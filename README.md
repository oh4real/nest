# nest

## Project setup
1. Create and register a pem key with Google Chrome App. Place in root of project as nest.pem
2. Copy env-sample.js to env.js
3. Install local chrome extension as "Load unpacked extension..." Don't worry about errors.
4. Grab ID and use in env.js for dev version.
5. Create test credential at nest and set Authorization edirect domain to ID.chromiumapp.org -- Chrome will catch the redirect and route it to extension.
6. Reload extension.


## Build process
1. Update manifest.json with new build number (manually controlled right now)
2. Run `./bin/build.sh nest` to get a dist/nest-REV.zip
3. Upload dist/nest-REV.zip to Chrom Apps.

## Alt build/project setup
Note: This will point developer loaded extension to a build. This will help verify src dir and build process are in sync.

1. Create and register a pem key with Google Chrome App. Place in root of project as nest.pem
2. Copy src/env-sample.js to src/env.js
3. Run `./bin/build.sh nest` 
4. Install local chrome extension as "Load unpacked extension..." pointing to build /nest dir. Don't worry about errors.
4. Grab ID from chrome://extensions and replace dev version env.js.
6. Reload extension.
7. Ignore "key.pem" warnings. The key.pem is required in root of zip for uploading to Chrome Web Store.