const UploadSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadDate: { type: Date, default: Date.now },
  });
  module.exports = mongoose.model('Upload', UploadSchema);