const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true, trim: true, maxlength: 2000 },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  readAt: { type: Date, default: null },
}, { timestamps: true });

messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ conversation: 1, readAt: 1, sender: 1 });
module.exports = mongoose.model('Message', messageSchema);
