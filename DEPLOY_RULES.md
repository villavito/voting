# Deploy Firebase Rules

## Quick Fix - Deploy Firestore Rules

### Option 1: Firebase Console (Recommended)
1. Go to https://console.firebase.google.com/
2. Select your project
3. Click "Firestore Database" → "Rules" tab
4. Copy the rules from `firestore.rules` file
5. Click "Publish"

### Option 2: Firebase CLI
```bash
# Make sure you're in the project directory
cd c:\Users\Admin\Desktop\voting\voting

# Login to Firebase (if not already logged in)
firebase login

# Initialize Firebase (if not already done)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

## Verify Rules Are Active
After deploying, you should see in the Firebase Console under Firestore Rules:
- Status: "Published"
- Last modified: Current timestamp

## Test the App
1. Restart your app
2. Try logging in as a user
3. The "Missing or insufficient permissions" error should be gone

## Security Note
⚠️ The current rules allow full read/write access for development.
For production, you should restrict access based on authentication:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Candidates collection
    match /candidates/{candidateId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Votes collection
    match /votes/{voteId} {
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.voterId;
    }
  }
}
```
