
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import * as cors from "cors";

const corsHandler = cors({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// Initialize Stripe with the secret key.
// IMPORTANT: Set this in your environment variables:
// firebase functions:config:set stripe.secret="your_stripe_secret_key"
const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: "2024-04-10",
});

/**
 * Creates a Stripe Checkout session for a one-time payment to verify a seller.
 * @param {object} data - The data object containing the return URLs.
 * @param {functions.https.CallableContext} context - The context object.
 * @returns {Promise<{url: string}>} - A promise that resolves with the checkout session URL.
 */
export const createCheckoutSession = functions.https.onCall(
  async (data, context) => {
    // Check if the user is authenticated.
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const uid = context.auth.uid;
    const { success_url, cancel_url } = data;

    if (!success_url || !cancel_url) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with success_url and cancel_url."
      );
    }
    
    // IMPORTANT: Create a one-time product and price in your Stripe dashboard
    // and replace this placeholder with the actual Price ID.
    const priceId = "price_1PMEqSRO9v6s4D094yGvZkP4"; // Placeholder Price ID

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        // Pass the user's UID to the session so we can identify them in the webhook.
        client_reference_id: uid,
        success_url: success_url,
        cancel_url: cancel_url,
      });

      if (!session.url) {
        throw new functions.https.HttpsError(
            "internal",
            "Could not create a checkout session URL."
        );
      }

      return { url: session.url };

    } catch (error) {
      console.error("Stripe Checkout Session Error:", error);
      throw new functions.https.HttpsError(
        "internal",
        "An error occurred while creating the checkout session."
      );
    }
  }
);


/**
 * A scheduled function that runs every 24 hours to clean up unverified users.
 * It deletes user accounts from Firebase Authentication and their corresponding
 * seller documents from Firestore if they were created more than 24 hours
 * ago and have not verified their email address.
 */
export const cleanupUnverifiedUsers = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    functions.logger.log("Starting cleanup of unverified users.");

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let usersToDelete: admin.auth.UserRecord[] = [];

    try {
      let pageToken: string | undefined;
      do {
        const listUsersResult = await admin.auth().listUsers(1000, pageToken);
        pageToken = listUsersResult.pageToken;

        const unverifiedUsers = listUsersResult.users.filter((user) => {
          const creationTime = new Date(user.metadata.creationTime);
          return !user.emailVerified && creationTime < twentyFourHoursAgo;
        });

        usersToDelete = usersToDelete.concat(unverifiedUsers);
      } while (pageToken);

      if (usersToDelete.length === 0) {
        functions.logger.log("No unverified users to delete.");
        return null;
      }

      functions.logger.log(`Found ${usersToDelete.length} unverified users to delete.`);

      // Delete from Authentication
      const deleteAuthPromises = usersToDelete.map((user) => {
        return admin.auth().deleteUser(user.uid).catch((error) => {
          functions.logger.error(
            `Failed to delete user ${user.uid} from Auth:`,
            error
          );
        });
      });

      // Delete from Firestore
      const deleteFirestorePromises = usersToDelete.map((user) => {
        const sellerDocRef = db.collection("sellers").doc(user.uid);
        return sellerDocRef.delete().catch((error) => {
          functions.logger.error(
            `Failed to delete seller doc ${user.uid} from Firestore:`,
            error
          );
        });
      });

      await Promise.all([...deleteAuthPromises, ...deleteFirestorePromises]);

      functions.logger.log(
        `Successfully cleaned up ${usersToDelete.length} users.`
      );
    } catch (error) {
      functions.logger.error("Error cleaning up unverified users:", error);
    }

    return null;
  });
