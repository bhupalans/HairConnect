
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

// --- SELLER WORKFLOW ---

const sellerCheckoutApp = express();
sellerCheckoutApp.use(cors({ origin: true }));

sellerCheckoutApp.post("/", async (req, res) => {
    functions.logger.log("createCheckoutSession (Seller) function triggered", { body: req.body });

    const stripeConfig = functions.config().stripe;
    if (!stripeConfig || !stripeConfig.secret) {
        functions.logger.error("FATAL: Stripe secret key is not configured.");
        res.status(500).json({ message: "Stripe secret key is not configured." });
        return;
    }
    
    if (!stripe) {
        stripe = new Stripe(stripeConfig.secret, { apiVersion: "2024-04-10" });
    }

    const idToken = req.headers.authorization?.split('Bearer ')[1];
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

        const priceId = "price_1RpQKuSSXV7vnN2iDdRKtFTC";

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

    } catch (error: any) {
        functions.logger.error("Function error (Seller Checkout):", error);
        res.status(500).json({ message: `An error occurred: ${error.message}` });
    }
});
export const createCheckoutSession = functions.https.onRequest(sellerCheckoutApp);


const sellerWebhookApp = express();
sellerWebhookApp.post('/', express.raw({type: 'application/json'}), async (request: any, response) => {
    const sig = request.headers['stripe-signature'];
    const endpointSecret = functions.config().stripe.webhook_secret;
    let event: Stripe.Event;

    try {
        if (!sig || !endpointSecret) {
            return response.status(400).send('Webhook Error: Missing signature or secret');
        }
        event = stripe.webhooks.constructEvent(request.rawBody, sig, endpointSecret);
    } catch (err: any) {
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    const session = event.data.object as any;

    switch (event.type) {
        case 'checkout.session.completed':
            const uid = session.client_reference_id;
            if (!uid) { break; }
            try {
                const sellerRef = db.collection('sellers').doc(uid);
                await sellerRef.update({ 
                    isVerified: true,
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: session.subscription,
                    stripeSubscriptionStatus: 'active'
                });
            } catch (error) {
                functions.logger.error(`Failed to verify seller ${uid}.`, { error });
            }
            break;

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            const customerId = session.customer;
            const subscriptionStatus = session.status;
            const newVerificationStatus = subscriptionStatus === 'active';
            
            const sellersRef = db.collection('sellers');
            const q = sellersRef.where('stripeCustomerId', '==', customerId);
            const querySnapshot = await q.get();

            querySnapshot.forEach(async (doc) => {
                try {
                    await doc.ref.update({
                        stripeSubscriptionStatus: subscriptionStatus,
                        isVerified: newVerificationStatus
                    });
                } catch (error) {
                    functions.logger.error(`Failed to update seller ${doc.id} subscription.`, { error });
                }
            });
            break;
    }
    response.status(200).send();
});
export const stripeWebhook = functions.https.onRequest(sellerWebhookApp);


const sellerPortalApp = express();
sellerPortalApp.use(cors({ origin: true }));
sellerPortalApp.post('/', async (req, res) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const sellerRef = db.collection('sellers').doc(uid);
        const sellerSnap = await sellerRef.get();
        
        if (!sellerSnap.exists()) {
            return res.status(404).json({ message: "Seller not found." });
        }
        
        const customerId = sellerSnap.data()?.stripeCustomerId;
        if (!customerId) {
            return res.status(400).json({ message: "Stripe customer ID not found." });
        }

        const { return_url } = req.body;
        if (!return_url) {
            return res.status(400).json({ message: "Missing return_url." });
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: return_url,
        });

        res.status(200).json({ url: portalSession.url });

    } catch (error: any) {
        res.status(500).json({ message: `An error occurred: ${error.message}` });
    }
});
export const createStripePortalLink = functions.https.onRequest(sellerPortalApp);


// --- BUYER WORKFLOW (NEW & SEPARATE) ---

const buyerCheckoutApp = express();
buyerCheckoutApp.use(cors({ origin: true }));

buyerCheckoutApp.post("/", async (req, res) => {
    functions.logger.log("createBuyerCheckoutSession function triggered", { body: req.body });

    if (!stripe) {
        stripe = new Stripe(functions.config().stripe.secret, { apiVersion: "2024-04-10" });
    }

    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const { success_url, cancel_url } = req.body;
        
        if (!success_url || !cancel_url) {
            return res.status(400).json({ message: "Missing success_url or cancel_url." });
        }

        // IMPORTANT: Replace this with your actual Buyer Verification Price ID from Stripe
        const priceId = "price_BUYER_VERIFICATION_PLACEHOLDER"; 
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            line_items: [{ price: priceId, quantity: 1 }],
            client_reference_id: uid,
            success_url: success_url,
            cancel_url: cancel_url,
        });

        res.status(200).json({ url: session.url });

    } catch (error: any) {
        functions.logger.error("Function error (Buyer Checkout):", error);
        res.status(500).json({ message: `An error occurred: ${error.message}` });
    }
});
export const createBuyerCheckoutSession = functions.https.onRequest(buyerCheckoutApp);


const buyerPortalApp = express();
buyerPortalApp.use(cors({ origin: true }));
buyerPortalApp.post('/', async (req, res) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const buyerRef = db.collection('buyers').doc(uid);
        const buyerSnap = await buyerRef.get();
        
        if (!buyerSnap.exists()) {
            return res.status(404).json({ message: "Buyer not found." });
        }
        
        const customerId = buyerSnap.data()?.stripeCustomerId;
        if (!customerId) {
            return res.status(400).json({ message: "Stripe customer ID not found." });
        }

        const { return_url } = req.body;
        if (!return_url) {
            return res.status(400).json({ message: "Missing return_url." });
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: return_url,
        });

        res.status(200).json({ url: portalSession.url });

    } catch (error: any) {
        res.status(500).json({ message: `An error occurred: ${error.message}` });
    }
});
export const createBuyerStripePortalLink = functions.https.onRequest(buyerPortalApp);


const buyerWebhookApp = express();
buyerWebhookApp.post('/', express.raw({type: 'application/json'}), async (request: any, response) => {
    const sig = request.headers['stripe-signature'];
    const endpointSecret = functions.config().stripe.buyer_webhook_secret; // Use a separate secret for buyers
    let event: Stripe.Event;

    try {
        if (!sig || !endpointSecret) {
            return response.status(400).send('Webhook Error: Missing buyer signature or secret');
        }
        event = stripe.webhooks.constructEvent(request.rawBody, sig, endpointSecret);
    } catch (err: any) {
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    const session = event.data.object as any;

    switch (event.type) {
        case 'checkout.session.completed':
            const uid = session.client_reference_id;
            if (!uid) { break; }
            try {
                const buyerRef = db.collection('buyers').doc(uid);
                await buyerRef.update({ 
                    isVerified: true,
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: session.subscription,
                    stripeSubscriptionStatus: 'active'
                });
            } catch (error) {
                functions.logger.error(`Failed to verify buyer ${uid}.`, { error });
            }
            break;

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            const customerId = session.customer;
            const subscriptionStatus = session.status;
            const newVerificationStatus = subscriptionStatus === 'active';
            
            const buyersRef = db.collection('buyers');
            const q = buyersRef.where('stripeCustomerId', '==', customerId);
            const querySnapshot = await q.get();

            querySnapshot.forEach(async (doc) => {
                try {
                    await doc.ref.update({
                        stripeSubscriptionStatus: subscriptionStatus,
                        isVerified: newVerificationStatus
                    });
                } catch (error) {
                    functions.logger.error(`Failed to update buyer ${doc.id} subscription.`, { error });
                }
            });
            break;
    }
    response.status(200).send();
});
export const buyerStripeWebhook = functions.https.onRequest(buyerWebhookApp);


// --- GENERAL FUNCTIONS ---

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
        deletePromises.push(admin.auth().deleteUser(user.uid).catch((error) => {
            functions.logger.error(`Failed to delete user ${user.uid} from Auth:`, error);
        }));
        
        const sellerDocRef = db.collection("sellers").doc(user.uid);
        deletePromises.push(sellerDocRef.delete().catch(() => { /* Fail silently */ }));

        const buyerDocRef = db.collection("buyers").doc(user.uid);
        deletePromises.push(buyerDocRef.delete().catch(() => { /* Fail silently */ }));
      }

      await Promise.all(deletePromises);
      functions.logger.log(`Successfully cleaned up ${usersToDelete.length} users.`);
    } catch (error) {
      functions.logger.error("Error cleaning up unverified users:", error);
    }
    return null;
  });
