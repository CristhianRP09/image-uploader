const express = require('express');
const multer  = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Whitelist of allowed origins
const whitelist = [];

// Custom CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

// Use CORS middleware with custom options
app.use(cors(corsOptions));

// Serve static files from the 'public' directory
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Route to handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // Logging information about the uploaded file
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    console.log('File uploaded:');
    console.log('Original Name:', req.file.originalname);
    console.log('File Name:', req.file.filename);
    console.log('File Size:', req.file.size);
    console.log('MIME Type:', req.file.mimetype);
    console.log('File URL:', fileUrl);
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');

    res.json({ message: 'File uploaded successfully', file: req.file, url: fileUrl });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
