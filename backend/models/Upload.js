const mongoose = require('mongoose');

const UploadSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // uploadDate: { type: Date, default: Date.now }, // We can rely on createdAt from timestamps
  },
  { timestamps: true } // Add timestamps (createdAt, updatedAt)
);

// Create a TTL index on 'createdAt' field, expiring after 3 days (in seconds)
// Apply this index ONLY to documents where the 'user' field is null
UploadSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 3 * 24 * 60 * 60, partialFilterExpression: { user: null } }
);

module.exports = mongoose.model('Upload', UploadSchema);