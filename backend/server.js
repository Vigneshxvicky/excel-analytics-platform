// backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');

const app = express();
// Use memory storage to easily access the file content without saving it to disk
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors());
app.use(express.json());

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});
// Endpoint to upload Excel file and parse its data
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    // Check if a file was provided
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    // Read the Excel file from the file buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; // Use the first sheet
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Respond with the parsed JSON data
    res.json({ success: true, data: jsonData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Placeholder for file upload and Excel parsing endpoint
// app.post('/upload', ... );

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));