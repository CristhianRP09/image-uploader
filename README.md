# SpeedDigital Contact Image Uploader (backend)

This backend is used to simulate/test image uploads for DM sites.
Knowing that AWS S3 rejects requests from local domains, there's a need to test image uploads as if they were in a staging or production environment. After cloning this repo, follow these steps:

### 1. Run `npm i` to install dependencies

### 2. Run `npm start` to start the server and you're done!
-----------------------------

## How to modify `_contact_image_uploader.html.haml` file

Tipically, sites in DM have a file called `_contact_image_uploader.html.haml` placed in the paths `app/sites/{SCHEMA_NAME}/views/applicacion/` or `app/sites/{SCHEMA_NAME}/views/applicacion/common/`, where `{SCHEMA_NAME}` should be the name of the site/schema. If you don't find this file inside the site folder, then the file that is being used is located in the path `app/views/common/_contact_image_uploader.html.haml`

This file is imported from a form with a file input. Generally, this form has a class called `directUpload`. The calling of the image uploader in the form looks like this:

```ruby
= render 'application/contact_image_uploader', resource: f.object
.upload-file-names{ 'data-photo-names' => true }
```

For a better understanding, it's recommended to read and understand what the image uploader file does. In this file, bellow the line:

```js
$('.directUpload').find("input:file").each(function(i, elem) {
```

add this constant:

```js
const localServerEndpoint = 'http://localhost:3000/upload';
```

Later, from this line:

```js
fileInput.fileupload({
```

inside the object passed to `fileupload`:

* Modify the field `url` from `'#{@s3_direct_post.url}'` to `localServerEndpoint`.
* Comment out the field `formData` (`// formData:         #{@s3_direct_post.fields.to_json.html_safe},`).
* Change the field `dataType` from `XML` to `json`.
* At the beginning of the method `done`, add these constants:
```js
const jsonResponse = data.jqXHR.responseJSON;
const localImageFilename = jsonResponse.file.filename;
const localImageURL = jsonResponse.url;
```
The `jsonResponse` value has the response from the local server when a file is uploaded. This is an example of how this response looks:

```json
{
    "message": "File uploaded successfully",
    "url": "http://localhost:3000/uploads/1727796908483.png"
    "file": {
        "fieldname": "file",
        "originalname": "homepage_vehicle_img.png",
        "encoding": "7bit",
        "mimetype": "image/png",
        "destination": "uploads/",
        "filename": "1727796908483.png",
        "path": "uploads/1727796908483.png",
        "size": 503077
    },
}
```

From now on, throughout the `done` method, where is needed filename or the image url, you will use the values `localImageFilename` and `localImageURL` respectively. For example, this is the saratoga's image uploader file (`app/sites/saratoga/views/application/_contact_image_uploader.html.haml`) with the above changes:

```diff
    ...

    $('.directUpload').find("input:file").each(function(i, elem) {
+     const localServerEndpoint = 'http://localhost:3000/upload';
      var fileInput    = $(elem);

      ...

      fileInput.fileupload({
        fileInput:       fileInput,
-       url:             '#{@s3_direct_post.url}',
+       url:             localServerEndpoint,
        type:            'POST',
        autoUpload:       true,
-       formData:         #{@s3_direct_post.fields.to_json.html_safe},
+       // formData:         #{@s3_direct_post.fields.to_json.html_safe},
        paramName:        'file',
-       dataType:         'XML',
+       dataType:         'json',
        replaceFileInput: false,

        ...

        done: function(e, data) {
+         const jsonResponse = data.jqXHR.responseJSON;
+         const localImageFilename = jsonResponse.file.filename;
+         const localImageURL = jsonResponse.url;
+
          submitButton.prop('disabled', false);

          progressBar
            .removeClass('uploading-in-progress')
            .addClass('uploading-successful')
            .text("Uploading done")

          setTimeout(function() {
            progressBar.removeClass('uploading-successful');
          }, 5000);

          var uid = parseInt(Math.random() * 999999999);

          if ($fileNamesContainer.length) {
-           var filename = data.files[0].name;
+           var filename = localImageFilename;

            var $fileContainer = $('<div>')
              .addClass('direct-upload')
              .attr('data-photo-uid', uid)
              .attr('data-photo-name', filename);

            if ( form.hasClass('saratoga_consign_form') ) {
-             var imgUrl = data.url + data.formData.key.replace('${filename}', filename);
+             var imgUrl = localImageURL;

              var $photoContainer = $('<div>')
                .addClass('direct-upload__image')
                .css('background-image', `url(${imgUrl})`);

              $fileContainer.append($photoContainer);
            }

            var $photoName = $('<span>')
              .addClass('direct-upload__name')
              .text(filename);
            $fileContainer.append($photoName);

            var $closeBtn = $('<span>')
              .addClass('direct-upload__remove')
              .append('<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.40673 0L0 1.40673L8.59327 10L0 18.5933L1.40673 20L10 11.4067L18.5933 20L20 18.5933L11.4067 10L20 1.40673L18.5933 0L10 8.59327L1.40673 0Z" fill="white"/></svg>')
              .attr('onclick', 'deleteUploadedImage(' + uid + ', event);');
            $fileContainer.append($closeBtn);

            $fileNamesContainer.append($fileContainer);
          }

          // extract key and generate URL from response
          var key   = $(data.jqXHR.responseXML).find("Key").text();
-         var url   = 'https://#{@s3_direct_post.url.host}/' + key;
+         var url   = localImageURL;

          // create hidden field
          var input = $("<input />", {
            type: 'hidden',
            name: '#{contact_params_name}[image_urls][]',
            value: url,
            id: 'photo-upload-' + uid
          })
          form.append(input);

          // explicitly unset files from the file input so they don't get added to the payload with the form submit
          fileInput.get(0).value = null;
        },

        ...

      }
    }
...
```

> **_NOTE:_** Please take in account that the `done` method is different from a site to another one, however the constants `localImageFilename` and `localImageURL` will replace any filename or image url used in this method.

-----------------------------

## Tips
A thing you should keep in mind is that the **"uploads"** folder holds all of the images that you upload through the contact image uploader. For this reason alone, you should empty out the folder every once in a while to clear out some space!
