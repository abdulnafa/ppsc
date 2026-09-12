(function (window) {
  "use strict";

  // Firebase web configuration is intentionally public. Access to progress data is
  // enforced by Firebase Authentication and the Firestore rules in firestore.rules.
  window.PPSC_FIREBASE_CONFIG = Object.freeze({
    firebase: Object.freeze({
      apiKey: "AIzaSyDkLMDeNARqPYAp7IXOnNHMTZSDOTtFrkM",
      authDomain: "ppsc-prep-ffe86.firebaseapp.com",
      projectId: "ppsc-prep-ffe86",
      storageBucket: "ppsc-prep-ffe86.firebasestorage.app",
      messagingSenderId: "46143324438",
      appId: "1:46143324438:web:ed212ce2b4b3d75fa09037"
    }),
    allowedEmail: "developerabdulnafa@gmail.com",
    sdkVersion: "12.18.0"
  });
})(window);
