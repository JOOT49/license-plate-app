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
  image: String
});
const Plate = mongoose.model('Plate', plateSchema);

// Serve static files
app.use(express.static('public'));

// Routes
app.post('/submit', upload.single('image'), async (req, res) => {
  const { licensePlate, state, bumperSticker } = req.body;
  const image = req.file ? req.file.path : '';

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
