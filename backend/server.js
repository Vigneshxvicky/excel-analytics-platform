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
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); // Use a current model name
} else {
    console.warn("⚠️ GEMINI_API_KEY not found in .env file. AI Summarization will be disabled.");
}


// JWT Middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    // --- TEMPORARY DEBUGGING ---
    console.log("Verifying token. JWT_SECRET used:", process.env.JWT_SECRET ? 'SECRET_LOADED' : 'SECRET_MISSING_OR_UNDEFINED');
    // --- END DEBUGGING ---
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("❌ JWT Verification Error:", err.message); // Log the specific error
            return res.status(403).json({ message: "Invalid token" });
        }
        req.user = decoded;
        next();
    });
};

// Function to get current stats and broadcast
const broadcastStats = async (socketIoInstance) => {
  try {
      const userCount = await User.countDocuments();
      const uploadCount = await Upload.countDocuments();
      const activeConnections = socketIoInstance.engine.clientsCount; // Get current socket connections
      socketIoInstance.emit('statsUpdate', { userCount, uploadCount, activeConnections });
      console.log('📊 Stats Updated:', { userCount, uploadCount, activeConnections });
  } catch (error) {
      console.error("Error broadcasting stats:", error);
  }
};

// WebSockets for Real-Time Updates
io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    socket.on("newUser", (userData) => io.emit("updateUsers", userData));
    socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
    // Broadcast updated stats when a client connects
    broadcastStats(io);

    // Broadcast updated stats when a client disconnects
        // Use setTimeout to allow the count to update correctly
        setTimeout(() => broadcastStats(io), 100);

});

// Listen for MongoDB User Changes & Broadcast
mongoose.connection.once("open", () => {
    const changeStream = mongoose.connection.collection("users").watch();
    changeStream.on("change", (change) => {
        if (change.operationType === "insert") {
            // Only emit necessary, non-sensitive data
            const newUser = {
                _id: change.fullDocument._id,
                name: change.fullDocument.name,
                email: change.fullDocument.email,
                role: change.fullDocument.role,
            };
            io.emit("newUser", newUser); // Emit a more specific event name
            // Also update stats when a new user is added
            broadcastStats(io);
        }
    });
});

// File Upload Setup
const upload = multer({ storage: multer.memoryStorage() });

// Upload History Endpoint (Fixed Privacy)
app.get("/api/upload-history", verifyToken, async (req, res) => {
  try {
    // Fetch uploads ONLY for the logged-in user.
    const { userId } = req.user; // Get userId from the verified token
    const uploads = await Upload.find({ user: userId }) // Filter by user ID
      .populate("user", "name") // Only grab the "name" field from the User document
      .sort({ uploadDate: -1 });
    res.json({ success: true, history: uploads });
  } catch (error) {
    console.error("Error fetching upload history:", error);
    res.status(500).json({ success: false, message: "Error retrieving upload history" });
  }
});

// Excel/CSV Upload & Parsing (Fixed User Saving)
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
      user: req.user.userId,  // <-- FIX: Save the user's ID (ObjectId)
      uploadDate: new Date(),
    });
    
    await newUpload.save();
    // --- End of Step 2 ---
    // Broadcast stats update after successful upload
    broadcastStats(io);


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
        // Basic Input Validation
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email, and password are required" });
        }
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
        // Basic Input Validation
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: "1h" });

        if (!process.env.JWT_SECRET) {
            console.error("❌ JWT_SECRET environment variable is not set!");
        }

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

// Use express-session for Passport (Fixed Secret)
app.use(session({
    secret: process.env.SESSION_SECRET || "fallback-secret-key", // Use env var, provide fallback ONLY for dev
    resave: false,
    saveUninitialized: true,
    // Consider adding cookie settings for production (secure: true, httpOnly: true)
}));
app.use(passport.initialize());
app.use(passport.session());

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
    const token = jwt.sign({ userId: req.user._id, role: req.user.role, name: req.user.name }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.redirect(`http://localhost:3000/dashboard?token=${token}`);
    if (!process.env.JWT_SECRET) {
        console.error("❌ JWT_SECRET environment variable is not set!");
    }
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.error("❌ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables are not set!");
    }
});

// Admin Dashboard API Routes
// Fetch actual users for the initial load
app.get("/api/dashboard/users", verifyToken, async (req, res) => {
  // Optional: Add role check to ensure only admins can access
  // if (req.user.role !== 'admin') {
  //     return res.status(403).json({ success: false, message: 'Forbidden' });
  // }
  const users = await User.find({}, 'name email role googleId'); // Select specific fields, exclude password
  res.json({ success: true, users });
});

// Make Analytics endpoint dynamic (Example: Cumulative User Growth by Month)
app.get("/api/dashboard/analytics", verifyToken, async (req, res) => {
    // Optional: Add admin role check
    try {
        // Aggregate users by registration month (requires createdAt field from timestamps:true)
        const timeRange = req.query.timeRange || '30d'; // Default to 30 days
        let startDate = new Date();
        let groupByFormat = '%Y-%m-%d'; // Default grouping by day
        let labelFormat = (date) => date.toISOString().split('T')[0]; // Default label format YYYY-MM-DD

        switch (timeRange) {
            case '1d':
                startDate.setDate(startDate.getDate() - 1);
                groupByFormat = '%Y-%m-%dT%H:00:00.000Z'; // Group by hour
                labelFormat = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); // HH:MM
                break;
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                // Default groupByFormat and labelFormat are fine
                break;
            case '30d':
            default: // Default to 30 days
                startDate.setDate(startDate.getDate() - 30);
                // Default groupByFormat and labelFormat are fine
                break;
        }

        // --- Aggregate User Registrations ---
        const userGrowthData = await User.aggregate([
            { $match: { createdAt: { $gte: startDate } } }, // Filter by date range
            {
                $group: {
                    _id: { $dateToString: { format: groupByFormat, date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } } // Sort chronologically
        ]);

        // --- Aggregate File Uploads ---
        const uploadTrendData = await Upload.aggregate([
            { $match: { createdAt: { $gte: startDate } } }, // Filter by date range
            {
                $group: {
                    _id: { $dateToString: { format: groupByFormat, date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } } // Sort chronologically
        ]);

        // --- Format Data for Chart.js ---
        // Create a map of all possible labels in the range to ensure continuity
        const allLabelsMap = new Map();
        let currentDate = new Date(startDate);
        const endDate = new Date();
        endDate.setHours(endDate.getHours() + 1, 0, 0, 0); // Ensure we include the current hour/day

        while (currentDate <= endDate) {
            const labelKey = new Date(currentDate).toISOString().split(timeRange === '1d' ? ':' : 'T')[0] + (timeRange === '1d' ? ':00:00.000Z' : 'T00:00:00.000Z');
            // Use a consistent key format for matching, then format the display label
            const displayLabel = labelFormat(new Date(currentDate));
            if (!allLabelsMap.has(displayLabel)) { // Avoid duplicate display labels if formatting isn't unique enough per key
                 allLabelsMap.set(displayLabel, { userCount: 0, uploadCount: 0, sortKey: new Date(currentDate) });
            }
            if (timeRange === '1d') {
              currentDate.setHours(currentDate.getHours() + 1);
          } else {
              currentDate.setDate(currentDate.getDate() + 1);
          }
      }

      // Populate counts from aggregated data
      userGrowthData.forEach(item => {
          const displayLabel = labelFormat(new Date(item._id));
          if (allLabelsMap.has(displayLabel)) {
              allLabelsMap.get(displayLabel).userCount = item.count;
          }
      });
      uploadTrendData.forEach(item => {
          const displayLabel = labelFormat(new Date(item._id));
          if (allLabelsMap.has(displayLabel)) {
              allLabelsMap.get(displayLabel).uploadCount = item.count;
          }
      });

      // Sort the map by date and extract final arrays
      const sortedLabels = Array.from(allLabelsMap.entries()).sort(([, a], [, b]) => a.sortKey - b.sortKey);

      const finalLabels = sortedLabels.map(([label]) => label);
      const userDataset = sortedLabels.map(([, data]) => data.userCount);
      const uploadDataset = sortedLabels.map(([, data]) => data.uploadCount);

      res.json({
          userGrowth: { labels: finalLabels, dataset: userDataset },
          uploadTrend: { labels: finalLabels, dataset: uploadDataset }
      });

    } catch (error) {
        console.error("Error fetching analytics data:", error);
        res.status(500).json({ success: false, message: 'Error fetching analytics data' });
    }
});

// Placeholder Endpoints (Add comments indicating they are placeholders)
// Updated Summarize Endpoint using Gemini
app.post('/api/summarize', verifyToken, async (req, res) => {
  if (!model) {
      return res.status(503).json({ success: false, message: "AI Summarization is not configured or enabled." });
  }

  const { data } = req.body; // Expecting the JSON data array

  if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ success: false, message: "No data provided for summarization." });
  }

  // Prepare a prompt - limit data size to avoid exceeding token limits
  // Convert first few rows to string format for the prompt
  const dataSample = data.slice(0, 30); // Limit to first 30 rows for the prompt
  const dataString = JSON.stringify(dataSample, null, 2);
  const prompt = `Analyze the following data sample (in JSON format) and provide a concise summary of the key insights, trends, or main points. Focus on what the data represents overall:\n\n${dataString}\n\nSummary:`;

  try {
    // --- This is where the error likely occurs ---
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    // --- End of likely error area ---

    res.json({ success: true, summary });
} catch (error) { // <--- This block is being executed
    console.error("Gemini API Error:", error); // Check your backend console for this!
    res.status(500).json({ success: false, message: "Error generating AI summary." });
}

});app.post('/api/predict', (req, res) => res.json({ success: true, prediction: { message: "Placeholder prediction." } }));


// API Endpoint to get initial dashboard stats
app.get('/api/dashboard/stats', verifyToken, async (req, res) => {
  // Optional: Add admin role check here if needed
  try {
      const userCount = await User.countDocuments();
      const uploadCount = await Upload.countDocuments();
      const activeConnections = io.engine.clientsCount; // Get current socket connections
      res.json({ success: true, stats: { userCount, uploadCount, activeConnections } });
  } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching dashboard stats' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));