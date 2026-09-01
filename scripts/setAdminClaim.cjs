/**
 * Script to set the admin claim for a user using Firebase Admin SDK.
 * 
 * Usage:
 * export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-file.json"
 * node scripts/setAdminClaim.cjs <USER_UID>
 */

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Ensure UID is provided
const uid = process.argv[2];
if (!uid) {
  console.error("Error: You must provide a UID.");
  console.error("Usage: node scripts/setAdminClaim.cjs <USER_UID>");
  process.exit(1);
}

// Ensure credentials are provided
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error("Error: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.");
  console.error("Please export it with the path to your service account JSON file.");
  process.exit(1);
}

console.log(`Initializing Firebase Admin...`);

async function setAdminClaim() {
  try {
    // Initialize the app with the credentials from the environment variable
    initializeApp({
      credential: applicationDefault()
    });

    const auth = getAuth();
    
    console.log(`Checking UID: ${uid}`);
    
    // Verify that the supplied UID exists before changing anything
    const user = await auth.getUser(uid);
    console.log(`Found user: ${user.email}`);

    // Preserve existing custom claims
    const currentClaims = user.customClaims || {};
    
    console.log(`Setting admin claim for UID: ${uid}`);
    
    // Assign { admin: true }
    await auth.setCustomUserClaims(uid, { ...currentClaims, admin: true });
    console.log(`✅ Successfully set admin claim for user: ${uid}`);

    // Re-read the user after assignment and print only safe verification information
    const updatedUser = await auth.getUser(uid);
    console.log(`\n--- Verification ---`);
    console.log(`Email: ${updatedUser.email}`);
    console.log(`UID: ${updatedUser.uid}`);
    console.log(`Custom Claims:`, updatedUser.customClaims);
    console.log(`--------------------\n`);

    console.log(`Please ask the user to log out and log back in to refresh their ID token.`);
    process.exit(0);

  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin SDK or set claims.");
    console.error(error.message || error);
    process.exit(1);
  }
}

setAdminClaim();
