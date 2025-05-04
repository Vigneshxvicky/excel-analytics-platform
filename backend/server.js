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
const session = require("express-session"); // Import express-session
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Upload = require("./models/Upload"); // Import Upload model
const User = require("./models/User"); // Import User model
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Import Google AI SDK

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

    // Initialize Google Gemini AI
let genAI;
let model;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Use gemini-pro or a suitable model
} else {
    console.warn("⚠️ GEMINI_API_KEY not found in .env file. AI features will be disabled.");
}


// JWT Middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
         return res.status(401).json({ message: "No token provided or token format is incorrect" });
    }

    const token = authHeader.split(" ")[1];

    // --- TEMPORARY DEBUGGING ---
    // console.log("Verifying token. JWT_SECRET used:", process.env.JWT_SECRET ? 'SECRET_LOADED' : 'SECRET_MISSING_OR_UNDEFINED');
    // --- END DEBUGGING ---

    if (!process.env.JWT_SECRET) {
        console.error("❌ JWT_SECRET environment variable is not set! Cannot verify token.");
        return res.status(500).json({ message: "Server configuration error: JWT secret missing." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("❌ JWT Verification Error:", err.message); // Log the specific error
            // Handle specific errors like expired token
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: "Token expired" });
            }
            return res.status(403).json({ message: "Invalid token" });
        }
        req.user = decoded; // Attach decoded payload (userId, role, name) to request
        next();
    });
};

// Function to get current stats and broadcast
const broadcastStats = async (socketIoInstance) => {
  try {
      const userCount = await User.countDocuments();
      const uploadCount = await Upload.countDocuments();
      // Ensure io instance is valid before accessing engine
      const activeConnections = socketIoInstance && socketIoInstance.engine ? socketIoInstance.engine.clientsCount : 0;
      socketIoInstance.emit('statsUpdate', { userCount, uploadCount, activeConnections });
      console.log('📊 Stats Updated:', { userCount, uploadCount, activeConnections });
  } catch (error) {
      console.error("Error broadcasting stats:", error);
  }
};

// WebSockets for Real-Time Updates
io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    // Removed the generic "newUser" listener as it might conflict with MongoDB change stream
    // socket.on("newUser", (userData) => io.emit("updateUsers", userData));
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        // Broadcast updated stats when a client disconnects
        // Use setTimeout to allow the count to update correctly
        setTimeout(() => broadcastStats(io), 100);
    });
    // Broadcast updated stats when a client connects
    broadcastStats(io);
});

// Listen for MongoDB User Changes & Broadcast
mongoose.connection.once("open", () => {
    console.log("👂 Listening for MongoDB changes...");
    const changeStream = mongoose.connection.collection("users").watch();
    changeStream.on("change", async (change) => { // Make async to await broadcastStats
        console.log("MongoDB Change Detected:", change.operationType);
        if (change.operationType === "insert") {
            // Only emit necessary, non-sensitive data
            const newUser = {
                _id: change.fullDocument._id,
                name: change.fullDocument.name,
                email: change.fullDocument.email,
                role: change.fullDocument.role,
                createdAt: change.fullDocument.createdAt, // Include createdAt if needed
                googleId: change.fullDocument.googleId // Include googleId if needed
            };
            io.emit("newUser", newUser); // Emit a more specific event name
            await broadcastStats(io); // Update stats when a new user is added
        }
        // Optional: Handle updates and deletes if needed for real-time UI changes
        if (change.operationType === "update") {
            try {
                // Fetch the updated user document to get necessary fields
                const updatedUser = await User.findById(change.documentKey._id, 'name email role googleId createdAt');
                if (updatedUser) io.emit("userUpdated", updatedUser);
            } catch (err) {
                console.error("Error fetching updated user:", err);
            }
        }
        if (change.operationType === "delete") {
            io.emit("userDeleted", change.documentKey._id); // Emit the ID of the deleted user
            await broadcastStats(io); // Update stats when a user is deleted
        }
    });
    changeStream.on("error", (error) => {
        console.error("❌ MongoDB Change Stream Error:", error);
        // Consider attempting to restart the stream or logging more details
    });
});

// File Upload Setup
const upload = multer({ storage: multer.memoryStorage() });

// ==================================
// API Routes
// ==================================

// --- Upload Routes ---
app.get("/api/upload-history", verifyToken, async (req, res) => {
  try {
    // Fetch uploads ONLY for the logged-in user.
    const { userId } = req.user; // Get userId from the verified token
    if (!userId) {
        return res.status(401).json({ success: false, message: "User ID not found in token." });
    }
    const uploads = await Upload.find({ user: userId }) // Filter by user ID
      .populate("user", "name") // Only grab the "name" field from the User document
      .sort({ createdAt: -1 }); // Sort by createdAt from timestamps
    res.json({ success: true, history: uploads });
  } catch (error) {
    console.error("Error fetching upload history:", error);
    res.status(500).json({ success: false, message: "Error retrieving upload history" });
  }
});

app.post("/api/upload", verifyToken, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ success: false, message: "Authentication error: User ID missing." });
  }

  try {
    let workbook;
    const originalName = req.file.originalname;
    const extension = originalName.split(".").pop()?.toLowerCase(); // Use optional chaining

    if (!extension) {
        return res.status(400).json({ success: false, message: "Could not determine file extension." });
    }

    // Parse CSV files differently than binary files (XLSX)
    if (extension === "csv") {
      const csvData = req.file.buffer.toString("utf8");
      workbook = XLSX.read(csvData, { type: "string" });
    } else if (['xlsx', 'xls', 'xlsm'].includes(extension)) { // Handle common excel extensions
      workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    } else {
        return res.status(400).json({ success: false, message: `Unsupported file type: .${extension}` });
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
        return res.status(400).json({ success: false, message: "No sheets found in the workbook." });
    }
    const sheet = workbook.Sheets[sheetName];
    const parsedData = XLSX.utils.sheet_to_json(sheet);
    // console.log("Parsed data:", parsedData); // Keep for debugging if needed

    // Save the upload to the database
    const newUpload = new Upload({
      filename: originalName,
      user: req.user.userId,
      // uploadDate is handled by timestamps:true in the model
    });

    await newUpload.save();
    await broadcastStats(io); // Broadcast stats update after successful upload

    return res.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("Error parsing file:", error);
    return res.status(500).json({ success: false, message: "Error processing file" });
  }
});

// --- Auth Routes ---
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email, and password are required" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        // Note: broadcastStats is handled by the MongoDB change stream listener

        res.status(201).json({ success: true, message: "User registered successfully" }); // Use 201 for created
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: "Server error during registration." });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

        // Only compare password if the user doesn't have a googleId (meaning they registered normally)
        if (!user.googleId) {
            if (!user.password) {
                 // Should not happen if schema is correct, but good failsafe
                 console.error(`User ${email} exists but has no password and no googleId.`);
                 return res.status(500).json({ success: false, message: "Authentication error." });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });
        } else if (user.googleId && password) {
            // If they have a googleId but try to log in with email/password, deny
            return res.status(400).json({ success: false, message: "Please log in using Google for this account." });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "1h" } // Consider making expiry configurable
        );

        res.json({ success: true, token });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error during login." });
    }
});

// --- Google Auth Routes ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback" // Relative path is usually fine
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            // Check if email already exists from normal registration
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
                // Link Google ID to existing user
                user.googleId = profile.id;
                user.name = profile.displayName; // Optionally update name
                await user.save();
            } else {
                // Create new user from Google profile
                user = new User({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value
                    // No password needed for Google sign-in
                });
                await user.save();
                // Note: broadcastStats handled by change stream
            }
        }
        return done(null, user); // Pass the user object to serializeUser
    } catch (err) {
        console.error("Google Strategy Error:", err);
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id); // Store only the user ID in the session
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user); // Attach user object to req.user
    } catch (err) {
        done(err, null);
    }
});

// Session Middleware (Place before Passport middleware)
app.use(session({
    secret: process.env.SESSION_SECRET || "fallback-secret-key-please-change", // Use env var, STRONG fallback
    resave: false,
    saveUninitialized: false, // Don't save session if unmodified
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true, // Helps prevent XSS
        maxAge: 1000 * 60 * 60 * 24 // Example: 1 day session duration
    }
}));

// Passport Middleware (Place after session middleware)
app.use(passport.initialize());
app.use(passport.session());

// Google Auth Initiation
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google Auth Callback
app.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed` }), // Redirect to frontend on failure
    (req, res) => {
        // Successful authentication
        if (!req.user) {
             console.error("Google callback success but req.user is missing.");
             return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_error`);
        }
        const token = jwt.sign(
            { userId: req.user._id, role: req.user.role, name: req.user.name },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        // Redirect to frontend dashboard with the JWT token
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
    }
);

// --- Admin Routes ---

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  // Assumes verifyToken middleware has run and attached req.user
  if (req.user && req.user.role === 'admin') {
    next(); // User is admin, proceed
  } else {
    res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
};

// Fetch users for the User Management page (Admin only)
app.get("/api/dashboard/users", verifyToken, isAdmin, async (req, res) => {
    try {
      const users = await User.find({}, 'name email role googleId createdAt').sort({ createdAt: -1 });
      res.json({ success: true, users });
    } catch (error) {
      console.error("Error fetching users for admin:", error);
      res.status(500).json({ success: false, message: 'Error fetching user list' });
    }
});

// Update User Role (Admin only)
app.put("/api/dashboard/users/:userId/role", verifyToken, isAdmin, async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, { role }, { new: true, select: 'name email role googleId createdAt' });
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        // MongoDB change stream handles broadcasting the update via io.emit("userUpdated",...)
        res.json({ success: true, message: 'User role updated successfully.', user: updatedUser });
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ success: false, message: 'Error updating user role.' });
    }
});

// Delete User (Admin only)
app.delete("/api/dashboard/users/:userId", verifyToken, isAdmin, async (req, res) => {
    const { userId } = req.params;
    // Prevent admin from deleting themselves
    if (req.user.userId === userId) {
        return res.status(400).json({ success: false, message: "Cannot delete your own account." });
    }
    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        // MongoDB change stream handles broadcasting the delete via io.emit("userDeleted",...)
        res.json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ success: false, message: 'Error deleting user.' });
    }
});

// --- Dashboard Stats Route ---
app.get('/api/dashboard/stats', verifyToken, isAdmin, async (req, res) => { // Added isAdmin middleware
  try {
      const userCount = await User.countDocuments();
      const uploadCount = await Upload.countDocuments();
      const activeConnections = io.engine.clientsCount;
      res.json({ success: true, stats: { userCount, uploadCount, activeConnections } });
  } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ success: false, message: 'Error fetching dashboard stats' });
  }
});

// --- AI Routes ---

// AI Summarization (Placeholder/Example - Requires Gemini Setup)
app.post('/api/summarize', verifyToken, async (req, res) => {
  if (!model) { // Check if Gemini model is initialized
      return res.status(503).json({ success: false, message: "AI Summarization is not configured or enabled." });
  }

  const { data } = req.body; // Expecting the JSON data array from the frontend

  if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ success: false, message: "No data provided for summarization." });
  }

  try {
    // Prepare a prompt - limit data size to avoid exceeding token limits
    const dataSample = data.slice(0, 50); // Limit sample size
    const dataString = JSON.stringify(dataSample, null, 2); // Pretty print for readability
    const headers = data.length > 0 ? Object.keys(data[0]).join(', ') : 'unknown columns';
    const prompt = `Analyze the following data sample (headers: ${headers}) and provide a concise summary (2-3 key bullet points) of the main insights, trends, or what the data represents overall:\n\n${dataString}\n\nSummary:`;

    console.log("Sending Summarize prompt to Gemini..."); // Debug log
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    console.log("Received Summarize response from Gemini."); // Debug log

    res.json({ success: true, summary });
  } catch (error) {
    console.error("Gemini API Error (Summarize):", error);
    res.status(500).json({ success: false, message: "Error generating AI summary." });
  }
});

// AI Relationship Discovery
app.post('/api/data/relationships', verifyToken, async (req, res) => {
  const { columns } = req.body; // Expecting an array of column names/headers

  if (!model) { // Check if Gemini model is initialized
      return res.status(503).json({ success: false, message: "AI Relationship Discovery is not configured or enabled." });
  }

  if (!columns || !Array.isArray(columns) || columns.length === 0) {
    return res.status(400).json({ msg: 'Column headers are required.' });
  }

  // Construct the Prompt
  const prompt = `
    Analyze a dataset with the following column headers: ${columns.join(', ')}.
    Identify potentially significant relationships or correlations between these columns.
    Focus on the 2-4 strongest or most interesting potential relationships relevant for business analysis.
    For each relationship:
    1. State the columns involved.
    2. Briefly describe the potential relationship (e.g., positive correlation, inverse correlation, categorical influence).
    3. Suggest a possible real-world reason for this relationship, if plausible.
    Present the findings as a numbered list. Be concise.
    Example:
    1. Columns: Sales, Profit. Relationship: Strong positive correlation. Reason: Higher sales volumes likely lead to increased overall profit, assuming consistent margins.
  `;

  try {
    console.log("Sending Relationship prompt to Gemini..."); // Debug log
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Received Relationship response from Gemini."); // Debug log

    if (!text || text.trim().length === 0) {
        throw new Error("Received empty response from AI service.");
    }

    res.json({ relationships: text }); // Send the raw text back
  } catch (error) {
    console.error('Gemini API Error (Relationships):', error);
    res.status(500).json({ msg: 'Failed to analyze data relationships via AI service.' });
  }
});


// --- Placeholder Routes ---
// Keep these simple or remove if not needed immediately
app.get("/api/dashboard/analytics", verifyToken, isAdmin, (req, res) => res.json({ labels: ["Jan", "Feb", "Mar"], dataset: [100, 150, 200] }));
app.post('/api/predict', verifyToken, (req, res) => res.json({ success: true, prediction: { message: "Prediction feature placeholder." } }));


// ==================================
// Server Start
// ==================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
