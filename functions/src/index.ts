
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

/**
 * Simulates a seller verification process.
 * This function is called by a verified seller from their dashboard.
 * It updates the seller's 'isVerified' status to true in Firestore.
 */
export const verifySeller = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const uid = context.auth.uid;

  try {
    const sellerRef = db.collection('sellers').doc(uid);
    await sellerRef.update({ isVerified: true });
    functions.logger.log(`Successfully simulated verification for seller with UID: ${uid}`);
    return { success: true, message: "Seller verified successfully." };
  } catch (error) {
    functions.logger.error(`Failed to update seller ${uid} to verified.`, error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while trying to verify the seller."
    );
  }
});


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
