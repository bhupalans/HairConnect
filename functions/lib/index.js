"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = exports.cleanupUnverifiedUsers = exports.createCheckoutSession = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe_1 = require("stripe");
const express = require("express");
admin.initializeApp();
const db = admin.firestore();
// Initialize Stripe with the secret key.
// IMPORTANT: Set this in your environment variables:
// firebase functions:config:set stripe.secret="your_stripe_secret_key"
const stripe = new stripe_1.default(functions.config().stripe.secret, {
    apiVersion: "2024-04-10",
});
/**
 * Creates a Stripe Checkout session for a one-time payment to verify a seller.
 * @param {object} data - The data object containing the return URLs.
 * @param {functions.https.CallableContext} context - The context object.
 * @returns {Promise<{url: string}>} - A promise that resolves with the checkout session URL.
 */
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    // Check if the user is authenticated.
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const uid = context.auth.uid;
    const { success_url, cancel_url } = data;
    if (!success_url || !cancel_url) {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with success_url and cancel_url.");
    }
    // IMPORTANT: Create a one-time product and price in your Stripe dashboard
    // and replace this placeholder with the actual Price ID.
    const priceId = "price_1RpQKuSSXV7vnN2iDdRKtFTC"; // Placeholder Price ID, replaced a test value.
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment", // Use 'payment' for one-time fee
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
            throw new functions.https.HttpsError("internal", "Could not create a checkout session URL.");
        }
        return { url: session.url };
    }
    catch (error) {
        console.error("Stripe Checkout Session Error:", error);
        throw new functions.https.HttpsError("internal", "An error occurred while creating the checkout session.");
    }
});
/**
 * A scheduled function that runs every 24 hours to clean up unverified users.
 * It deletes user accounts from Firebase Authentication and their corresponding
 * seller documents from Firestore if they were created more than 24 hours
 * ago and have not verified their email address.
 */
exports.cleanupUnverifiedUsers = functions.pubsub
    .schedule("every 24 hours")
    .onRun(async (context) => {
    functions.logger.log("Starting cleanup of unverified users.");
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let usersToDelete = [];
    try {
        let pageToken;
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
                functions.logger.error(`Failed to delete user ${user.uid} from Auth:`, error);
            });
        });
        // Delete from Firestore
        const deleteFirestorePromises = usersToDelete.map((user) => {
            const sellerDocRef = db.collection("sellers").doc(user.uid);
            return sellerDocRef.delete().catch((error) => {
                functions.logger.error(`Failed to delete seller doc ${user.uid} from Firestore:`, error);
            });
        });
        await Promise.all([...deleteAuthPromises, ...deleteFirestorePromises]);
        functions.logger.log(`Successfully cleaned up ${usersToDelete.length} users.`);
    }
    catch (error) {
        functions.logger.error("Error cleaning up unverified users:", error);
    }
    return null;
});
const app = express();
app.post('/', express.raw({ type: 'application/json' }), async (request, response) => {
    const sig = request.headers['stripe-signature'];
    // Get this from your Stripe Dashboard webhook settings
    // IMPORTANT: Set this in your environment variables:
    // firebase functions:config:set stripe.webhook_secret="your_webhook_secret"
    const endpointSecret = functions.config().stripe.webhook_secret;
    let event;
    try {
        if (!sig || !endpointSecret) {
            response.status(400).send('Webhook Error: Missing signature or secret');
            return;
        }
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    }
    catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const uid = session.client_reference_id;
        if (!uid) {
            functions.logger.error("Webhook received without a client_reference_id (UID).", session);
            response.status(400).send('Webhook Error: Missing client_reference_id.');
            return;
        }
        try {
            // Find the user's document in the 'sellers' collection and update it.
            const sellerRef = db.collection('sellers').doc(uid);
            await sellerRef.update({ isVerified: true });
            functions.logger.log(`Successfully verified seller with UID: ${uid}`);
        }
        catch (error) {
            functions.logger.error(`Failed to update seller ${uid} to verified.`, error);
            // We don't send a 400 here because the webhook itself was valid.
            // This is an internal error. Stripe will see the 200 and not retry.
        }
    }
    // Return a response to acknowledge receipt of the event
    response.status(200).send();
});
exports.stripeWebhook = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map