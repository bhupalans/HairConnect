"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupUnverifiedUsers = exports.createBuyerStripePortalLink = exports.buyerStripeWebhook = exports.createBuyerCheckoutSession = exports.createStripePortalLink = exports.stripeWebhook = exports.createCheckoutSession = void 0;
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
// --- SELLER WORKFLOW (UNCHANGED) ---
const sellerCheckoutApp = express();
sellerCheckoutApp.use(cors({ origin: true }));
sellerCheckoutApp.post("/", async (req, res) => {
    var _a;
    functions.logger.log("createCheckoutSession (Seller) function triggered", { body: req.body });
    const stripeConfig = functions.config().stripe;
    if (!stripeConfig || !stripeConfig.secret) {
        functions.logger.error("FATAL: Stripe secret key is not configured.");
        res.status(500).json({ message: "Stripe secret key is not configured." });
        return;
    }
    if (!stripe) {
        stripe = new stripe_1.default(stripeConfig.secret, { apiVersion: "2024-04-10" });
    }
    const idToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split('Bearer ')[1];
    if (!idToken) {
        functions.logger.error("Auth Error: No ID token provided.");
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const { success_url, cancel_url } = req.body;
        if (!success_url || !cancel_url) {
            res.status(400).json({ message: "Missing success_url or cancel_url." });
            return;
        }
        const priceId = "price_1RpQKuSSXV7vnN2iDdRKtFTC"; // Seller Price ID
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            line_items: [{ price: priceId, quantity: 1 }],
            client_reference_id: uid,
            success_url: success_url,
            cancel_url: cancel_url,
        });
        if (!session.url) {
            res.status(500).json({ message: "Could not create checkout session URL." });
            return;
        }
        res.status(200).json({ url: session.url });
    }
    catch (error) {
        functions.logger.error("Function error (Seller Checkout):", error);
        res.status(500).json({ message: `An error occurred: ${error.message}` });
    }
});
exports.createCheckoutSession = functions.https.onRequest(sellerCheckoutApp);
const sellerWebhookApp = express();
sellerWebhookApp.post('/', express.raw({ type: 'application/json' }), async (request, response) => {
    const sig = request.headers['stripe-signature'];
    const endpointSecret = functions.config().stripe.webhook_secret;
    let event;
    try {
        if (!sig || !endpointSecret) {
            return response.status(400).send('Webhook Error: Missing seller signature or secret');
        }
        event = stripe.webhooks.constructEvent(request.rawBody, sig, endpointSecret);
    }
    catch (err) {
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }
    const session = event.data.object;
    // This webhook only handles sellers.
    const updateUserSubscription = async (customerId, status) => {
        const sellersRef = db.collection('sellers');
        const q = sellersRef.where('stripeCustomerId', '==', customerId);
        const querySnapshot = await q.get();
        querySnapshot.forEach(async (doc) => {
            try {
                await doc.ref.update({
                    stripeSubscriptionStatus: status,
                    isVerified: status === 'active'
                });
            }
            catch (error) {
                functions.logger.error(`Failed to update seller ${doc.id} subscription.`, { error });
            }
        });
    };
    switch (event.type) {
        case 'checkout.session.completed':
            const uid = session.client_reference_id;
            if (!uid) {
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
            }
            catch (error) {
                functions.logger.error(`Failed to verify seller ${uid}.`, { error });
            }
            break;
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            await updateUserSubscription(session.customer, session.status);
            break;
    }
    response.status(200).send();
});
exports.stripeWebhook = functions.https.onRequest(sellerWebhookApp);
const sellerPortalApp = express();
sellerPortalApp.use(cors({ origin: true }));
sellerPortalApp.post('/', async (req, res) => {
    var _a, _b;
    const idToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split('Bearer ')[1];
    if (!idToken) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const sellerRef = db.collection('sellers').doc(uid);
        const sellerSnap = await sellerRef.get();
        if (!sellerSnap.exists) {
            res.status(404).json({ message: "Seller not found." });
            return;
        }
        const customerId = (_b = sellerSnap.data()) === null || _b === void 0 ? void 0 : _b.stripeCustomerId;
        if (!customerId) {
            res.status(400).json({ message: "Stripe customer ID not found." });
            return;
        }
        const { return_url } = req.body;
        if (!return_url) {
            res.status(400).json({ message: "Missing return_url." });
            return;
        }
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: return_url,
        });
        res.status(200).json({ url: portalSession.url });
    }
    catch (error) {
        res.status(500).json({ message: `An error occurred: ${error.message}` });
    }
});
exports.createStripePortalLink = functions.https.onRequest(sellerPortalApp);
// --- BUYER WORKFLOW (NEW & SEPARATE) ---
const buyerCheckoutApp = express();
buyerCheckoutApp.use(cors({ origin: true }));
buyerCheckoutApp.post("/", async (req, res) => {
    var _a;
    functions.logger.log("createBuyerCheckoutSession function triggered", { body: req.body });
    const stripeConfig = functions.config().stripe;
    if (!stripeConfig || !stripeConfig.secret) {
        functions.logger.error("FATAL: Stripe secret key is not configured.");
        res.status(500).json({ message: "Stripe secret key is not configured." });
        return;
    }
    if (!stripe) {
        stripe = new stripe_1.default(stripeConfig.secret, { apiVersion: "2024-04-10" });
    }
    const idToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split('Bearer ')[1];
    if (!idToken) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const { success_url, cancel_url } = req.body;
        if (!success_url || !cancel_url) {
            res.status(400).json({ message: "Missing success_url or cancel_url." });
            return;
        }
        const priceId = "price_1RrvUxSSXV7vnN2iBXB030CS";
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            line_items: [{ price: priceId, quantity: 1 }],
            client_reference_id: uid,
            success_url: success_url,
            cancel_url: cancel_url,
        });
        res.status(200).json({ url: session.url });
    }
    catch (error) {
        functions.logger.error("Function error (Buyer Checkout):", error);
        res.status(500).json({ message: `An error occurred: ${error.message}` });
    }
});
exports.createBuyerCheckoutSession = functions.https.onRequest(buyerCheckoutApp);
const buyerWebhookApp = express();
buyerWebhookApp.post('/', express.raw({ type: 'application/json' }), async (request, response) => {
    const sig = request.headers['stripe-signature'];
    const endpointSecret = functions.config().stripe.buyer_webhook_secret; // Use a separate secret for buyers
    let event;
    try {
        if (!sig || !endpointSecret) {
            functions.logger.error("Webhook Error: Missing buyer signature or secret");
            return response.status(400).send('Webhook Error: Missing buyer signature or secret');
        }
        event = stripe.webhooks.constructEvent(request.rawBody, sig, endpointSecret);
    }
    catch (err) {
        functions.logger.error("Webhook signature verification failed for buyer.", { error: err.message });
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }
    const session = event.data.object;
    // This webhook only handles buyers.
    const updateBuyerSubscription = async (customerId, status) => {
        const buyersRef = db.collection('buyers');
        const q = buyersRef.where('stripeCustomerId', '==', customerId);
        const querySnapshot = await q.get();
        if (querySnapshot.empty) {
            functions.logger.warn(`Webhook received subscription update for non-existent buyer customer ID: ${customerId}`);
            return;
        }
        querySnapshot.forEach(async (doc) => {
            try {
                await doc.ref.update({
                    stripeSubscriptionStatus: status,
                    isVerified: status === 'active'
                });
                functions.logger.log(`Updated buyer ${doc.id} subscription status to ${status}.`);
            }
            catch (error) {
                functions.logger.error(`Failed to update buyer ${doc.id} subscription.`, { error });
            }
        });
    };
    switch (event.type) {
        case 'checkout.session.completed':
            const uid = session.client_reference_id;
            if (!uid) {
                functions.logger.error("Webhook received 'checkout.session.completed' for buyer without a client_reference_id (UID).", session);
                break;
            }
            try {
                const buyerRef = db.collection('buyers').doc(uid);
                await buyerRef.update({
                    isVerified: true,
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: session.subscription,
                    stripeSubscriptionStatus: 'active'
                });
                functions.logger.log(`Successfully verified buyer with UID: ${uid}.`);
            }
            catch (error) {
                functions.logger.error(`Failed to verify buyer ${uid}.`, { error });
            }
            break;
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            await updateBuyerSubscription(session.customer, session.status);
            break;
    }
    response.status(200).send();
});
exports.buyerStripeWebhook = functions.https.onRequest(buyerWebhookApp);
const buyerPortalApp = express();
buyerPortalApp.use(cors({ origin: true }));
buyerPortalApp.post('/', async (req, res) => {
    var _a, _b;
    const idToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split('Bearer ')[1];
    if (!idToken) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const buyerRef = db.collection('buyers').doc(uid);
        const buyerSnap = await buyerRef.get();
        if (!buyerSnap.exists) {
            res.status(404).json({ message: "Buyer not found." });
            return;
        }
        const customerId = (_b = buyerSnap.data()) === null || _b === void 0 ? void 0 : _b.stripeCustomerId;
        if (!customerId) {
            res.status(400).json({ message: "Stripe customer ID not found for this buyer." });
            return;
        }
        const { return_url } = req.body;
        if (!return_url) {
            res.status(400).json({ message: "Missing return_url." });
            return;
        }
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: return_url,
        });
        res.status(200).json({ url: portalSession.url });
    }
    catch (error) {
        res.status(500).json({ message: `An error occurred creating buyer portal link: ${error.message}` });
    }
});
exports.createBuyerStripePortalLink = functions.https.onRequest(buyerPortalApp);
// --- GENERAL FUNCTIONS (UNCHANGED) ---
exports.cleanupUnverifiedUsers = functions.pubsub
    .schedule("every 24 hours")
    .onRun(async (context) => {
    functions.logger.log("Starting cleanup of unverified users.");
    const emailsToIgnore = ["admin@hairconnect.com", "admin@hairbuysell.com"];
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let usersToDelete = [];
    try {
        let pageToken;
        do {
            const listUsersResult = await admin.auth().listUsers(1000, pageToken);
            pageToken = listUsersResult.pageToken;
            const unverifiedUsers = listUsersResult.users.filter((user) => {
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
        const deletePromises = [];
        for (const user of usersToDelete) {
            deletePromises.push(admin.auth().deleteUser(user.uid).catch((error) => {
                functions.logger.error(`Failed to delete user ${user.uid} from Auth:`, error);
            }));
            const sellerDocRef = db.collection("sellers").doc(user.uid);
            deletePromises.push(sellerDocRef.delete().catch(() => { }));
            const buyerDocRef = db.collection("buyers").doc(user.uid);
            deletePromises.push(buyerDocRef.delete().catch(() => { }));
        }
        await Promise.all(deletePromises);
        functions.logger.log(`Successfully cleaned up ${usersToDelete.length} users.`);
    }
    catch (error) {
        functions.logger.error("Error cleaning up unverified users:", error);
    }
    return null;
});
//# sourceMappingURL=index.js.map