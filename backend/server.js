// backend/server.js

// ========= Requires & Environment =========
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

// ========= Import User Model =========
// Ensure your User schema (in models/User.js) sets `password` as required only when googleId is not present.
const User = require('./models/User');

// ========= Connect to MongoDB =========
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/excel_analytics';
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// ========= Setup for File Upload =========
const upload = multer({ storage: multer.memoryStorage() });

// ========= Passport & Google OAuth =========
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,           // Set in .env
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,   // Set in .env
      callbackURL: "/auth/google/callback"              // Must match the one set in Google Cloud Console
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Google Profile:", profile);
      const { id, displayName, emails } = profile;
      try {
        // Find a user by googleId
        let user = await User.findOne({ googleId: id });
        if (!user) {
          // Create a new user (note: password is not required because googleId exists)
          user = new User({
            googleId: id,
            name: displayName,
            email: emails[0].value
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Use express-session for Passport (required for OAuth flow)
app.use(
  require("express-session")({
    secret: "secretKey", // Use a strong secret in production!
    resave: false,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ========= Health Check =========
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// ========= Google Authentication Routes =========

// Redirect user to Google for authentication
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth Callback: Exchange session for JWT and redirect frontend
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication – generate a JWT token for the logged-in user
    const token = jwt.sign(
      { userId: req.user._id, role: req.user.role, name: req.user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    // Redirect to your frontend dashboard with the token.
    res.redirect(`http://localhost:3000/dashboard?token=${token}`);
  }
);

// ========= JWT Verification Middleware =========
const verifyToken = (req, res, next) => {
  // Expect header "Authorization: Bearer <token>"
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });
  const token = authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "No token provided" });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ message: "Failed to authenticate token" });
    req.user = decoded;
    next();
  });
};

// ========= Protected Endpoints (JWT based) =========

// Example: Upload history only for JWT-authenticated users
app.get("/api/upload-history", verifyToken, async (req, res) => {
  try {
    // Use req.user.userId from the JWT payload
    const { userId } = req.user;
    const dummyUploads = [
      { _id: "1", filename: "data1.xlsx", uploadDate: new Date() },
      { _id: "2", filename: "report.xlsx", uploadDate: new Date() }
    ];
    res.json({ success: true, history: dummyUploads });
  } catch (error) {
    console.error("Error fetching upload history:", error);
    res.status(500).json({ success: false, message: "Error retrieving upload history" });
  }
});

// Excel File Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    res.json({ success: true, data: jsonData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Summarization Endpoint (dummy)
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

// ========= Registration & Normal Login Endpoints =========

// Registration Endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: "User already exists" });
    // Hash the password for local sign-up
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Normal Login Endpoint (returns a JWT)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password does not match for user:", email);
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: "JWT secret is not defined." });
    }
    console.log("User name found:", user.name);
    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log("Generated token payload:", { userId: user._id, role: user.role, name: user.name });
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Dummy Predictive Analytics Endpoint
app.post('/api/predict', (req, res) => {
  try {
    const { data } = req.body;
    const dummyPrediction = {
      message: 'Based on current trends, the future looks promising!',
      suggestion: 'Invest more in the rising segments.',
      forecast: data && data.length ? "Overall, a 10% growth is anticipated over the next quarter." : "Insufficient data for prediction."
    };
    res.json({ success: true, prediction: dummyPrediction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Example Protected Endpoint with JWT
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected route.', user: req.user });
});

// ========= Start the Server =========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));