"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = exports.createCheckoutSession = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe_1 = require("stripe");
const express = require("express");
admin.initializeApp();
const db = admin.firestore();
// It's better to initialize Stripe once outside the function handler
// if the configuration is available. If not, we'll do it inside.
let stripe;
try {
    const stripeSecret = functions.config().stripe.secret;
    if (stripeSecret) {
        stripe = new stripe_1.default(stripeSecret, {
            apiVersion: "2024-04-10",
        });
    }
}
catch (error) {
    functions.logger.error("Stripe failed to initialize on cold start:", error);
}
/**
 * Creates a Stripe Checkout session for a one-time payment to verify a seller.
 * @param {object} data - The data object containing the return URLs.
 * @param {functions.https.CallableContext} context - The context object.
 * @returns {Promise<{url: string}>} - A promise that resolves with the checkout session URL.
 */
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    functions.logger.log("createCheckoutSession function triggered");
    // --- DIAGNOSTIC CHECK ---
    // Check if the stripe configuration and secret key exist.
    const stripeConfig = functions.config().stripe;
    if (!stripeConfig || !stripeConfig.secret) {
        functions.logger.error("FATAL: Stripe secret key is not configured in the environment.");
        throw new functions.https.HttpsError("failed-precondition", "Stripe secret key is not configured. Please set functions.config().stripe.secret");
    }
    // Initialize Stripe inside the function if it wasn't on cold start
    if (!stripe) {
        stripe = new stripe_1.default(stripeConfig.secret, {
            apiVersion: "2024-04-10",
        });
        functions.logger.log("Stripe initialized on-demand inside function handler.");
    }
    // Check if the user is authenticated.
    if (!context.auth) {
        functions.logger.error("Authentication Error: User is not authenticated.");
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    functions.logger.log(`Authenticated user UID: ${context.auth.uid}`);
    const uid = context.auth.uid;
    const { success_url, cancel_url } = data;
    if (!success_url || !cancel_url) {
        functions.logger.error("Invalid Argument: Missing success_url or cancel_url.", { data });
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with success_url and cancel_url.");
    }
    functions.logger.log("Received URLs:", { success_url, cancel_url });
    // IMPORTANT: Create a one-time product and price in your Stripe dashboard
    // and replace this placeholder with the actual Price ID.
    const priceId = "price_1RpQKuSSXV7vnN2iDdRKtFTC"; // Placeholder Price ID, replaced a test value.
    functions.logger.log(`Using Stripe Price ID: ${priceId}`);
    try {
        functions.logger.log("Attempting to create Stripe checkout session...");
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
            functions.logger.error("Stripe session created, but no URL was returned.");
            throw new functions.https.HttpsError("internal", "Could not create a checkout session URL.");
        }
        functions.logger.log("Stripe session created successfully. URL:", session.url);
        return { url: session.url };
    }
    catch (error) {
        functions.logger.error("Stripe API Error:", error);
        // Log the specific Stripe error message if available
        if (error.raw) {
            functions.logger.error("Stripe Raw Error:", error.raw);
        }
        throw new functions.https.HttpsError("internal", `An error occurred while creating the checkout session: ${error.message}`);
    }
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