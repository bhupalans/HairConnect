# HairBuySell - Global B2B Human Hair Marketplace

HairBuySell is a comprehensive B2B marketplace built with Next.js and Firebase. It serves as a dedicated platform connecting human hair vendors with professional buyers like salon owners, stylists, and distributors from around the world.

## Key Features

*   **Dual User Roles:** Separate registration and dashboard experiences for Vendors and Buyers.
*   **Vendor Features:**
    *   Publicly viewable profiles.
    *   Product management (add, edit, delete).
    *   Dashboard for viewing incoming quote requests.
    *   Stripe integration for a "Verified Seller" subscription, which unlocks unlimited product listings and access to the sourcing marketplace.
*   **Buyer Features:**
    *   Publicly viewable profiles.
    *   Browse and filter sellers and products.
    *   Save preferred vendors to a personal list.
    *   Request quotes for specific products or submit general inquiries.
    *   Dashboard to track sent quotes.
    *   Stripe integration for a "Verified Buyer" subscription to enhance trust with sellers.
*   **Admin Dashboard:** A central place for platform administrators to review all contact messages and quote requests.
*   **Secure Authentication:** Robust email/password authentication with email verification, handled by Firebase Authentication.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Backend & Database:** [Firebase](https://firebase.google.com/) (Authentication, Firestore, Cloud Storage, Cloud Functions)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [ShadCN/UI](https://ui.shadcn.com/)
*   **Payments:** [Stripe](https://stripe.com/) for handling subscriptions.
*   **Deployment:** [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## Project Structure

```
.
├── /functions/               # Firebase Cloud Functions (Node.js/TypeScript)
├── /src/
│   ├── /app/                 # Next.js App Router pages and layouts
│   │   ├── /admin/           # Admin-specific pages (dashboard, login)
│   │   ├── /buyer/           # Buyer-specific pages (dashboard, verification)
│   │   ├── /vendor/          # Vendor-specific pages (dashboard, verification)
│   │   ├── /api/             # (Optional) API routes
│   │   └── page.tsx          # Homepage
│   ├── /components/          # Shared React components (UI, layout, etc.)
│   ├── /lib/                 # Core utilities, Firebase config, data fetching
│   └── /hooks/               # Custom React hooks
├── firebase.json             # Firebase project configuration (hosting, functions)
├── apphosting.yaml           # Firebase App Hosting configuration
└── next.config.ts            # Next.js configuration
```

## Getting Started

To run this project locally, you will need Node.js, npm, and the Firebase CLI installed.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <your-project-directory>
```

### 2. Install Dependencies

Install the required packages for both the Next.js app and the Cloud Functions.

```bash
# Install root dependencies
npm install

# Navigate to functions directory and install its dependencies
cd functions
npm install
cd ..
```

### 3. Configure Firebase

The project uses Firebase for backend services.
*   **Firebase Configuration:** The client-side Firebase config is located in `src/lib/firebase.ts`. Ensure this is populated with your project's credentials.
*   **Service Account (for Emulators):** To run the Firebase Emulators, you may need to have a service account key. Follow Firebase documentation to set up the `GOOGLE_APPLICATION_CREDENTIALS` environment variable.

### 4. Stripe Configuration

The application uses Stripe for handling "Verified" user subscriptions. You will need to set your Stripe secret keys in the Firebase environment for the Cloud Functions.

```bash
# Set your Stripe secret key and webhook secrets
firebase functions:config:set stripe.secret="sk_test_..."
firebase functions:config:set stripe.webhook_secret="whsec_..."
firebase functions:config:set stripe.buyer_webhook_secret="whsec_..."

# To see current config
firebase functions:config:get
```
*Note: You must deploy the functions at least once for the configuration to be available to the deployed functions.*

### 5. Run the Development Server

You can run the Next.js frontend and the Firebase emulators concurrently.

```bash
# Start the Next.js development server
npm run dev

# In a separate terminal, start the Firebase Emulators
# This will emulate auth, firestore, and functions
firebase emulators:start
```
The application will be available at `http://localhost:3000`.

## Deployment

This application is configured for deployment on **Firebase App Hosting**.

To deploy the application, ensure you are logged into the Firebase CLI and have selected the correct project. Then, run the standard Firebase deploy command:

```bash
firebase deploy
```

This command will build the Next.js application and deploy it along with the Firestore rules, Storage rules, and Cloud Functions to your Firebase project.
