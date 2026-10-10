# target-rank-android

Android Google login fix: the build bundles Capacitor App/Browser imports into `www/native-auth.bundle.js`; do not use bare dynamic imports from the classic `script.js`. Trigger the GitHub Actions workflow `Build TARGET RANK APK` to build a new APK.
