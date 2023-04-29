const express = require('express');
const multer = require('multer');
const path = require('path');
const libre = require('libreoffice-convert');
libre.convertAsync = require('util').promisify(libre.convert);
const app = express();

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
    const ext = path.extname(file.originalname);
    if (ext !== '.pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
}).single('file');

app.post('/convert', (req, res) => {
  upload(req, res, function(err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const filePath = req.file.path;
    const options = {
      output: path.join(__dirname, 'downloads', `${req.file.originalname}.docx`)
    };

    libre(filePath, options)
      .then(outputPath => {
        res.download(outputPath);
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      });
  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});


// Define the button click function
function btn() {
    // Get the input file
    const fileInput = document.getElementById('filename');
    const file = fileInput.files[0];
  
    // Create a new FormData object and append the file to it
    const formData = new FormData();
    formData.append('file', file);
  
    // Send a POST request to the server to convert the file
    fetch('/convert', {
      method: 'POST',
      body: formData
    })
    .then(response => response.blob())
    .then(file => {
      // Create a URL for the converted file
      const url = URL.createObjectURL(file);
  
      // Create a link element and set its attributes
      const link = document.createElement('a');
      link.href = url;
      link.download = 'converted.docx';
  
      // Append the link element to the document and click it
      document.body.appendChild(link);
      link.click();
  
      // Remove the link element from the document
      document.body.removeChild(link);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
  