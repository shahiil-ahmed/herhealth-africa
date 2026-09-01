/**
 * script to set the admin claim for a user using Firebase Admin SDK.
 * 
 * Requirements:
 * 1. You must have a Firebase Service Account JSON file downloaded from the Firebase Console.
 *    (Project Settings > Service Accounts > Generate New Private Key)
 * 2. Save the JSON file locally BUT NEVER COMMIT IT TO GIT. (Ensure it's in .gitignore)
 * 3. Run this script using Node.js, providing the path to the credentials and the user's UID.
 * 
 * Usage:
 * export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-file.json"
 * node scripts/setAdminClaim.js <USER_UID>
 */

const admin = require('firebase-admin');

// Ensure UID is provided
const uid = process.argv[2];
if (!uid) {
  console.error("Error: You must provide a UID.");
  console.error("Usage: node scripts/setAdminClaim.js <USER_UID>");
  process.exit(1);
}

// Ensure credentials are provided
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error("Error: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.");
  console.error("Please export it with the path to your service account JSON file.");
  process.exit(1);
}

console.log(`Initializing Firebase Admin...`);

try {
  // Initialize the app with the credentials from the environment variable
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });

  console.log(`Setting admin claim for UID: ${uid}`);

  admin.auth().setCustomUserClaims(uid, { admin: true })
    .then(() => {
      console.log(`✅ Successfully set admin claim for user: ${uid}`);
      console.log(`Please ask the user to log out and log back in to refresh their ID token.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error setting custom claims:", error);
      process.exit(1);
    });

} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin SDK or set claims.");
  console.error(error);
  process.exit(1);
}
