const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

// Set up storage for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// MongoDB setup
mongoose.connect('mongodb://localhost:27017/license-plate-db', { useNewUrlParser: true, useUnifiedTopology: true });

// Schema and model
const Schema = mongoose.Schema;
const plateSchema = new Schema({
  licensePlate: String,
  state: String,
  bumperSticker: String,
  image: String // Store the path to the image in MongoDB
});
const Plate = mongoose.model('Plate', plateSchema);

// Serve static files (not necessary if you already have this)
app.use(express.static('public'));

// Routes
app.post('/submit', upload.single('image'), async (req, res) => {
  const { licensePlate, state, bumperSticker } = req.body;
  const image = req.file ? '/uploads/' + req.file.filename : '';

  const newPlate = new Plate({ licensePlate, state, bumperSticker, image });
  await newPlate.save();
  res.send('Information submitted successfully!');
});

app.get('/lookup/:licensePlate/:state', async (req, res) => {
  const { licensePlate, state } = req.params;
  const plate = await Plate.findOne({ licensePlate, state });
  if (plate) {
    res.json(plate);
  } else {
    res.json(null); // Return null if not found
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
