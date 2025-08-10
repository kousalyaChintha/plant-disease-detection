const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');

const app = express();

app.use(cors());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('image');

app.post('/upload', upload, async (req, res) => {
  if (!req.file) {
    console.error("No file uploaded.");
    return res.status(400).send('No file uploaded!');
  }

  const imagePath = path.join(__dirname, 'uploads', req.file.filename);
  const form = new FormData();
  form.append('image', fs.createReadStream(imagePath));
  form.append('latitude', '49.207');
  form.append('longitude', '16.608');
  form.append('similar_images', 'true');
  const datetime = new Date().toISOString().split('.')[0];
  form.append('datetime', datetime);

  const headers = {
    'Api-Key': 'IPB2fl0pN6IAOiK1ZiI2KUxvOBWDBrBBmsUj8hfoUecISiTy0q',
    ...form.getHeaders()
  };

  try {
    const response = await axios.post('https://crop.kindwise.com/api/v1/identification', form, { headers });
    // console.log('API Response:', response.data); // Log full response to help identify issues

    if (response.data && response.data.result && response.data.result.disease) {
      const diseases = response.data.result.disease.suggestions;
      // console.log('Diseases found:', diseases);

      if (diseases && diseases.length > 0) {
        res.json(diseases);
      } else {
        res.json(['No diseases detected']);
      }
    } else {
      res.json(['No disease information in the response.']);
    }
  } catch (error) {
    console.error('Error in API Request:', error.message);
    if (error.response && error.response.data) {
      console.error('Error Response Data:', error.response.data);
      res.status(500).send('API error: ' + JSON.stringify(error.response.data));
    } else {
      res.status(500).send('Something went wrong!');
    }
  }
});


// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.html'));
// });

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
