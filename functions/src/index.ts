
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import * as express from "express";
import * as cors from "cors";

admin.initializeApp();
const db = admin.firestore();

// It's better to initialize Stripe once outside the function handler
// if the configuration is available. If not, we'll do it inside.
let stripe: Stripe;
try {
    const stripeSecret = functions.config().stripe.secret;
    if (stripeSecret) {
        stripe = new Stripe(stripeSecret, {
            apiVersion: "2024-04-10",
        });
    }
} catch (error) {
    functions.logger.error("Stripe failed to initialize on cold start:", error);
}

const checkoutApp = express();
checkoutApp.use(cors({ origin: true }));

checkoutApp.post("/", async (req, res) => {
    functions.logger.log("createCheckoutSession function triggered", { body: req.body });

    // --- DIAGNOSTIC CHECK ---
    const stripeConfig = functions.config().stripe;
    if (!stripeConfig || !stripeConfig.secret) {
        functions.logger.error("FATAL: Stripe secret key is not configured in the environment.");
        res.status(500).json({ message: "Stripe secret key is not configured." });
        return;
    }
    
    // Initialize Stripe inside the function if it wasn't on cold start
    if (!stripe) {
        stripe = new Stripe(stripeConfig.secret, {
            apiVersion: "2024-04-10",
        });
        functions.logger.log("Stripe initialized on-demand inside function handler.");
    }

    // The httpsCallable function passes auth context in the request headers.
    // We need to verify it manually for onRequest functions.
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
        functions.logger.error("Authentication Error: No ID token provided.");
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        functions.logger.log(`Authenticated user UID: ${uid}`);

        const { success_url, cancel_url } = req.body;

        if (!success_url || !cancel_url) {
            functions.logger.error("Invalid Argument: Missing success_url or cancel_url.", { data: req.body });
            res.status(400).json({ message: "The function must be called with success_url and cancel_url." });
            return;
        }
        functions.logger.log("Received URLs:", { success_url, cancel_url });

        const priceId = "price_1RpQKuSSXV7vnN2iDdRKtFTC";
        functions.logger.log(`Using Stripe Price ID: ${priceId}`);

        functions.logger.log("Attempting to create Stripe checkout session...");
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            line_items: [{ price: priceId, quantity: 1 }],
            client_reference_id: uid,
            success_url: success_url,
            cancel_url: cancel_url,
        });

        if (!session.url) {
            functions.logger.error("Stripe session created, but no URL was returned.");
            res.status(500).json({ message: "Could not create a checkout session URL." });
            return;
        }

        functions.logger.log("Stripe session created successfully. URL:", session.url);
        // For onRequest, we send back the data in the response body.
        res.status(200).json({ url: session.url });

    } catch (error: any) {
        functions.logger.error("Function execution error:", error);
        if (error.raw) {
            functions.logger.error("Stripe Raw Error:", error.raw);
        }
        res.status(500).json({ message: `An error occurred: ${error.message}` });
    }
});

export const createCheckoutSession = functions.https.onRequest(checkoutApp);


const webhookApp = express();

// Stripe requires the raw body to construct events.
// The "verify" option allows us to capture the raw body buffer.
webhookApp.post('/', express.raw({type: 'application/json'}), async (request: any, response) => {
    const sig = request.headers['stripe-signature'];
    const endpointSecret = functions.config().stripe.webhook_secret;
    
    let event: Stripe.Event;

    try {
        if (!sig || !endpointSecret) {
            functions.logger.error("Webhook Error: Missing signature or secret");
            response.status(400).send('Webhook Error: Missing signature or secret');
            return;
        }
        // Use the raw body buffer for verification
        event = stripe.webhooks.constructEvent(request.rawBody, sig, endpointSecret);
    } catch (err: any) {
        functions.logger.error("Webhook signature verification failed.", { error: err.message });
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    const session = event.data.object as any; // Use `any` for easier property access across event types

    switch (event.type) {
        case 'checkout.session.completed':
            const uid = session.client_reference_id;
            if (!uid) {
                functions.logger.error("Webhook received 'checkout.session.completed' without a client_reference_id (UID).", session);
                break;
            }
            try {
                const sellerRef = db.collection('sellers').doc(uid);
                await sellerRef.update({ 
                    isVerified: true,
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: session.subscription,
                    stripeSubscriptionStatus: 'active'
                });
                functions.logger.log(`Successfully verified seller with UID: ${uid} and updated Stripe IDs.`);
            } catch (error) {
                functions.logger.error(`Failed to update seller ${uid} to verified.`, { error });
            }
            break;

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': // Handles cancellations
            const customerId = session.customer;
            const subscriptionStatus = session.status;
            
            functions.logger.log(`Subscription updated for customer ${customerId}. New status: ${subscriptionStatus}.`);

            // Find the seller by their Stripe customer ID
            const sellersRef = db.collection('sellers');
            const q = sellersRef.where('stripeCustomerId', '==', customerId);
            const querySnapshot = await q.get();

            if (querySnapshot.empty) {
                functions.logger.error(`Could not find seller for stripeCustomerId: ${customerId}`);
                break;
            }

            querySnapshot.forEach(async (doc) => {
                const sellerRef = doc.ref;
                // isVerified is true ONLY if the status from Stripe is 'active'.
                // This correctly handles grace periods for cancellations.
                const newVerificationStatus = subscriptionStatus === 'active';
                
                try {
                    await sellerRef.update({
                        stripeSubscriptionStatus: subscriptionStatus,
                        isVerified: newVerificationStatus
                    });
                    functions.logger.log(`Updated seller ${doc.id} subscription status to ${subscriptionStatus} and verification to ${newVerificationStatus}.`);
                } catch (error) {
                    functions.logger.error(`Failed to update seller ${doc.id} subscription status.`, { error });
                }
            });
            break;

        default:
            functions.logger.log(`Unhandled event type ${event.type}`);
    }


    // Return a 200 response to acknowledge receipt of the event
    response.status(200).send();
});

export const stripeWebhook = functions.https.onRequest(webhookApp);

const portalApp = express();
portalApp.use(cors({ origin: true }));

portalApp.post('/', async (req, res) => {
    functions.logger.log("createStripePortalLink function triggered");

    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
        functions.logger.error("Authentication Error: No ID token provided.");
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        
        const sellerRef = db.collection('sellers').doc(uid);
        const sellerSnap = await sellerRef.get();

        if (!sellerSnap.exists) {
            functions.logger.error(`Seller document not found for UID: ${uid}`);
            res.status(404).json({ message: "Seller not found." });
            return;
        }

        const sellerData = sellerSnap.data();
        const customerId = sellerData?.stripeCustomerId;

        if (!customerId) {
            functions.logger.error(`stripeCustomerId not found for seller UID: ${uid}`);
            res.status(400).json({ message: "Stripe customer ID not found." });
            return;
        }

        const { return_url } = req.body;
        if (!return_url) {
            functions.logger.error("Invalid Argument: Missing return_url.");
            res.status(400).json({ message: "The function must be called with a return_url." });
            return;
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: return_url,
        });

        res.status(200).json({ url: portalSession.url });

    } catch (error: any) {
        functions.logger.error("Portal link creation error:", error);
        res.status(500).json({ message: `An error occurred: ${error.message}` });
    }
});

export const createStripePortalLink = functions.https.onRequest(portalApp);

/**
 * A scheduled function that runs every 24 hours to clean up unverified users.
 * It deletes user accounts from Firebase Authentication and their corresponding
 * seller or buyer documents from Firestore if they were created more than 24 hours
 * ago and have not verified their email address. It ignores specific admin emails.
 */
export const cleanupUnverifiedUsers = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    functions.logger.log("Starting cleanup of unverified users.");

    const emailsToIgnore = ["admin@hairconnect.com", "admin@hairbuysell.com"];
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let usersToDelete: admin.auth.UserRecord[] = [];

    try {
      let pageToken: string | undefined;
      do {
        const listUsersResult = await admin.auth().listUsers(1000, pageToken);
        pageToken = listUsersResult.pageToken;

        const unverifiedUsers = listUsersResult.users.filter((user) => {
          // Do not delete if the user's email is in the ignore list
          if (user.email && emailsToIgnore.includes(user.email)) {
            return false;
          }
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

      const deletePromises: Promise<any>[] = [];

      for (const user of usersToDelete) {
        // Delete from Authentication
        deletePromises.push(
            admin.auth().deleteUser(user.uid).catch((error) => {
                functions.logger.error(`Failed to delete user ${user.uid} from Auth:`, error);
            })
        );
        
        // Attempt to delete from both 'sellers' and 'buyers' collections
        const sellerDocRef = db.collection("sellers").doc(user.uid);
        deletePromises.push(
            sellerDocRef.delete().catch((error) => {
                // It's okay if this fails (e.g., doc doesn't exist), so we don't log an error unless it's a real issue.
                // For simplicity, we'll just let it fail silently if the user is a buyer.
            })
        );

        const buyerDocRef = db.collection("buyers").doc(user.uid);
        deletePromises.push(
            buyerDocRef.delete().catch((error) => {
                // Same as above, fail silently if the user was a seller.
            })
        );
      }

      await Promise.all(deletePromises);

      functions.logger.log(
        `Successfully cleaned up ${usersToDelete.length} users.`
      );
    } catch (error) {
      functions.logger.error("Error cleaning up unverified users:", error);
    }

    return null;
  });
