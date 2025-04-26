// backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());

// --- Connect to MongoDB ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/excel_analytics';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// --- File Upload and Summarize Endpoints ---
const upload = multer({ storage: multer.memoryStorage() });

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Excel file upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }
    // Parse Excel file using SheetJS (xlsx)
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    res.json({ success: true, data: jsonData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Summarization endpoint (dummy implementation)
app.post('/api/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    console.log("Received text for summarization:", text);
    const summary = "This dataset shows a steady upward trend with a notable surge in Q3.";
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- Authentication Endpoints ---

// Import the User model
const User = require('./models/User');

// Registration Endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    
    // Ensure JWT_SECRET is loaded
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: "JWT secret is not defined." });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- JWT Verification Middleware ---
const verifyToken = (req, res, next) => {
  // Expecting header "Authorization: Bearer <token>"
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token provided" });
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Failed to authenticate token" });
    req.user = decoded;
    next();
  });
};

// --- Protected Endpoints & Predictive Analytics ---

// Dummy predictive analytics endpoint
app.post('/api/predict', (req, res) => {
  try {
    // Extract the data submitted from the client
    const { data } = req.body;
    // Create a dummy prediction as an example:
    const dummyPrediction = {
      message: 'Based on current trends, the future looks promising!',
      suggestion: 'Invest more in the rising segments.',
      forecast: data && data.length ? "Overall, a 10% growth is anticipated over the next quarter." : "Insufficient data for prediction."
    };

    return res.json({ success: true, prediction: dummyPrediction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Example protected endpoint
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected route.', user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));