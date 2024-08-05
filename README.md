# SpeedDigital Contact Image Uploader (backend)

This backend is used to simulate/test image uploads for DM sites. 
Knowing that AWS S3 rejects requests from local domains, there's a need to test image uploads as if they were in a staging or production environment. After cloning this repo, follow these steps:

### 1. Run `npm i` to install dependencies

### 2. Go to `app.js` and change `line 22` whitelisted domains for CORS (REQUIRED)
- This will depend on the site/schema you're currently working on, so an entry to this array should look like this:
```
// Whitelist of allowed origins
const whitelist = ['http://{SCHEMA_NAME}.dm.test:3333'];
```
- Where `{SCHEMA_NAME}` should be the name of the site/schema.

### 3. Run `npm start` to start the server and you're done!
-----------------------------
## How to modify `_contact_image_uploader.html.haml` file
* Coming Soon...

-----------------------------

## Tips
A thing you should keep in mind is that the **"uploads"** folder holds all of the images that you upload through the contact image uploader. For this reason alone, you should empty out the folder every once in a while to clear out some space!