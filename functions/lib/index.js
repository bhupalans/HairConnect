"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = exports.createCheckoutSession = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe_1 = require("stripe");
const express = require("express");
const cors = require("cors");
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
const checkoutApp = express();
checkoutApp.use(cors({ origin: true }));
checkoutApp.post("/", async (req, res) => {
    var _a;
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
        stripe = new stripe_1.default(stripeConfig.secret, {
            apiVersion: "2024-04-10",
        });
        functions.logger.log("Stripe initialized on-demand inside function handler.");
    }
    // The httpsCallable function passes auth context in the request headers.
    // We need to verify it manually for onRequest functions.
    const idToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split('Bearer ')[1];
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
    }
    catch (error) {
        functions.logger.error("Function execution error:", error);
        if (error.raw) {
            functions.logger.error("Stripe Raw Error:", error.raw);
        }
        res.status(500).json({ message: `An error occurred: ${error.message}` });
    }
});
exports.createCheckoutSession = functions.https.onRequest(checkoutApp);
const webhookApp = express();
// Stripe requires the raw body to construct events.
// The "verify" option allows us to capture the raw body buffer.
webhookApp.post('/', express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}), async (request, response) => {
    const sig = request.headers['stripe-signature'];
    const endpointSecret = functions.config().stripe.webhook_secret;
    let event;
    try {
        if (!sig || !endpointSecret) {
            functions.logger.error("Webhook Error: Missing signature or secret");
            response.status(400).send('Webhook Error: Missing signature or secret');
            return;
        }
        // Use the raw body buffer for verification
        event = stripe.webhooks.constructEvent(request.rawBody, sig, endpointSecret);
    }
    catch (err) {
        functions.logger.error("Webhook signature verification failed.", { error: err.message });
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const uid = session.client_reference_id;
        if (!uid) {
            functions.logger.error("Webhook received 'checkout.session.completed' without a client_reference_id (UID).", session);
            response.status(400).send('Webhook Error: Missing client_reference_id.');
            return;
        }
        try {
            const sellerRef = db.collection('sellers').doc(uid);
            await sellerRef.update({ isVerified: true });
            functions.logger.log(`Successfully verified seller with UID: ${uid}`);
        }
        catch (error) {
            functions.logger.error(`Failed to update seller ${uid} to verified.`, { error });
            // Even if DB update fails, we must acknowledge the webhook to Stripe
        }
    }
    // Return a 200 response to acknowledge receipt of the event
    response.status(200).send();
});
exports.stripeWebhook = functions.https.onRequest(webhookApp);
//# sourceMappingURL=index.js.map