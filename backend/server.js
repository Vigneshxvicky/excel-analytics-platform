// // backend/server.js

// // ========= Requires & Environment =========
// const express = require('express');
// const cors = require('cors');
// const multer = require('multer');
// const XLSX = require('xlsx');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ========= Import User Model =========
// // Ensure your User schema (in models/User.js) sets `password` as required only when googleId is not present.
// const User = require('./models/User');

// // ========= Connect to MongoDB =========
// const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/excel_analytics';
// mongoose
//   .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("MongoDB connected"))
//   .catch(err => console.error("MongoDB connection error:", err));

// // ========= Setup for File Upload =========
// const upload = multer({ storage: multer.memoryStorage() });

// // ========= Passport & Google OAuth =========
// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,           // Set in .env
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,   // Set in .env
//       callbackURL: "/auth/google/callback"              // Must match the one set in Google Cloud Console
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       console.log("Google Profile:", profile);
//       const { id, displayName, emails } = profile;
//       try {
//         // Find a user by googleId
//         let user = await User.findOne({ googleId: id });
//         if (!user) {
//           // Create a new user (note: password is not required because googleId exists)
//           user = new User({
//             googleId: id,
//             name: displayName,
//             email: emails[0].value
//           });
//           await user.save();
//         }
//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );

// passport.serializeUser((user, done) => done(null, user.id));
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (err) {
//     done(err, null);
//   }
// });

// // Use express-session for Passport (required for OAuth flow)
// app.use(
//   require("express-session")({
//     secret: "secretKey", // Use a strong secret in production!
//     resave: false,
//     saveUninitialized: true
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());

// // ========= Health Check =========
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK' });
// });

// // ========= Google Authentication Routes =========

// // Redirect user to Google for authentication
// app.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// // Google OAuth Callback: Exchange session for JWT and redirect frontend
// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   (req, res) => {
//     // Successful authentication – generate a JWT token for the logged-in user
//     const token = jwt.sign(
//       { userId: req.user._id, role: req.user.role, name: req.user.name },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );
//     // Redirect to your frontend dashboard with the token.
//     res.redirect(`http://localhost:3000/dashboard?token=${token}`);
//   }
// );

// // ========= JWT Verification Middleware =========
// const verifyToken = (req, res, next) => {
//   // Expect header "Authorization: Bearer <token>"
//   const authHeader = req.headers["authorization"];
//   if (!authHeader)
//     return res.status(401).json({ message: "No token provided" });
//   const token = authHeader.split(" ")[1];
//   if (!token)
//     return res.status(401).json({ message: "No token provided" });
//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err)
//       return res.status(403).json({ message: "Failed to authenticate token" });
//     req.user = decoded;
//     next();
//   });
// };

// // ========= Protected Endpoints (JWT based) =========

// // Example: Upload history only for JWT-authenticated users
// app.get("/api/upload-history", verifyToken, async (req, res) => {
//   try {
//     // Use req.user.userId from the JWT payload
//     const { userId } = req.user;
//     const dummyUploads = [
//       { _id: "1", filename: "data1.xlsx", uploadDate: new Date() },
//       { _id: "2", filename: "report.xlsx", uploadDate: new Date() }
//     ];
//     res.json({ success: true, history: dummyUploads });
//   } catch (error) {
//     console.error("Error fetching upload history:", error);
//     res.status(500).json({ success: false, message: "Error retrieving upload history" });
//   }
// });

// // Excel File Upload Endpoint
// app.post('/api/upload', upload.single('file'), (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ success: false, error: "No file uploaded" });
//     }
//     const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
//     const sheetName = workbook.SheetNames[0];
//     const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
//     res.json({ success: true, data: jsonData });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Summarization Endpoint (dummy)
// app.post('/api/summarize', async (req, res) => {
//   try {
//     const { text } = req.body;
//     console.log("Received text for summarization:", text);
//     const summary = "This dataset shows a steady upward trend with a notable surge in Q3.";
//     res.json({ success: true, summary });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ========= Registration & Normal Login Endpoints =========

// // Registration Endpoint
// app.post('/api/register', async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;
//     // Check if the user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser)
//       return res.status(400).json({ success: false, message: "User already exists" });
//     // Hash the password for local sign-up
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({ name, email, password: hashedPassword, role });
//     await user.save();
//     res.json({ success: true, message: "User registered successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Normal Login Endpoint (returns a JWT)
// app.post('/api/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//       console.log("User not found for email:", email);
//       return res.status(400).json({ success: false, message: "Invalid credentials" });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       console.log("Password does not match for user:", email);
//       return res.status(400).json({ success: false, message: "Invalid credentials" });
//     }
//     if (!process.env.JWT_SECRET) {
//       return res.status(500).json({ success: false, message: "JWT secret is not defined." });
//     }
//     console.log("User name found:", user.name);
//     const token = jwt.sign(
//       { userId: user._id, role: user.role, name: user.name },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );
//     console.log("Generated token payload:", { userId: user._id, role: user.role, name: user.name });
//     res.json({ success: true, token });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Dummy Predictive Analytics Endpoint
// app.post('/api/predict', (req, res) => {
//   try {
//     const { data } = req.body;
//     const dummyPrediction = {
//       message: 'Based on current trends, the future looks promising!',
//       suggestion: 'Invest more in the rising segments.',
//       forecast: data && data.length ? "Overall, a 10% growth is anticipated over the next quarter." : "Insufficient data for prediction."
//     };
//     res.json({ success: true, prediction: dummyPrediction });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // Example Protected Endpoint with JWT
// app.get('/api/protected', verifyToken, (req, res) => {
//   res.json({ message: 'This is a protected route.', user: req.user });
// });

// // ========= Admin Dashboard Routes =========

// // Define the /api/users route
// // Example in your backend (Express)
// app.get("/api/dashboard/users", (req, res) => {
//   // Replace with actual logic, e.g.,
//   res.json({ users: [{ id: 1, name: "Admin User", role: "admin" }] });
// });

// app.get("/api/dashboard/analytics", (req, res) => {
//   // Replace with actual logic, e.g.,
//   res.json({
//     labels: ["Jan", "Feb", "Mar", "Apr", "May"],
//     dataset: [100, 150, 200, 250, 300]
//   });
// }
// );

// // ========= Start the Server =========
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));



require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const XLSX = require("xlsx");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const http = require("http");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const Upload = require("./models/Upload"); // Import Upload model


// Initialize Express App
const app = express();
app.use(cors());
app.use(express.json());

// Setup Server & WebSocket
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// Define User Model
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    googleId: String,
    role: { type: String, default: "user" }
});
const User = mongoose.model("User", UserSchema);

// JWT Middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = decoded;
        next();
    });
};

// WebSockets for Real-Time Updates
io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    socket.on("newUser", (userData) => io.emit("updateUsers", userData));
    socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

// Listen for MongoDB User Changes & Broadcast
mongoose.connection.once("open", () => {
    const changeStream = mongoose.connection.collection("users").watch();
    changeStream.on("change", (change) => {
        if (change.operationType === "insert") {
            io.emit("updateUsers", change.fullDocument);
        }
    });
});

// File Upload Setup
const upload = multer({ storage: multer.memoryStorage() });


const Upload = require("./models/Upload"); // Ensure Upload model exists

app.get("/api/upload-history", verifyToken, async (req, res) => {
  try {
    // Fetch all uploads and populate the "user" field to get the name.
    const uploads = await Upload.find()
      .populate("user", "name") // Only grab the "name" field from the User document
      .sort({ uploadDate: -1 });
    res.json({ success: true, history: uploads });
  } catch (error) {
    console.error("Error fetching upload history:", error);
    res.status(500).json({ success: false, message: "Error retrieving upload history" });
  }
});

// Excel Upload & Parsing
// API endpoint to handle file uploads
// Ensure the route is protected so that req.user is available
app.post("/api/upload", verifyToken, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  
  try {
    let workbook;
    // Get the file extension by splitting on the dot.
    const originalName = req.file.originalname;
    const extension = originalName.split(".").pop().toLowerCase();
    
    // Parse CSV files differently than binary files (XLSX)
    if (extension === "csv") {
      const csvData = req.file.buffer.toString("utf8");
      workbook = XLSX.read(csvData, { type: "string" });
    } else {
      workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    }
    
    // Read data from the first sheet.
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convert the sheet to JSON – returns an array of objects.
    const parsedData = XLSX.utils.sheet_to_json(sheet);
    console.log("Parsed data:", parsedData);
    
    // --- Step 2: Save the upload to the database ---
    // Create a new upload record with user info.
    // (Make sure your Upload model has fields for filename, user, and uploadDate.)
    const newUpload = new Upload({
      filename: originalName,
      user: req.user.name,  // or req.user.userId if you prefer
      uploadDate: new Date(),
    });
    
    await newUpload.save();
    // --- End of Step 2 ---
    
    return res.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("Error parsing file:", error);
    return res.status(500).json({ success: false, message: "Error parsing file" });
  }
});


// User Registration
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.json({ success: true, message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// User Login (JWT)
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Google Authentication
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = new User({ googleId: profile.id, name: profile.displayName, email: profile.emails[0].value });
            await user.save();
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

app.use(require("express-session")({ secret: "secretKey", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
    const token = jwt.sign({ userId: req.user._id, role: req.user.role, name: req.user.name }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.redirect(`http://localhost:3000/dashboard?token=${token}`);
});

// Admin Dashboard API Routes
app.get("/api/dashboard/users", (req, res) => res.json({ users: [{ id: 1, name: "Admin User", role: "admin" }] }));
app.get("/api/dashboard/analytics", (req, res) => res.json({ labels: ["Jan", "Feb", "Mar"], dataset: [100, 150, 200] }));

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));