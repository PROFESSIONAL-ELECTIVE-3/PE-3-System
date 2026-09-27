const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  connection: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfessorConnection', required: true, unique: true },
  state: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
  lastMessageAt: { type: Date, default: Date.now },
  closedAt: { type: Date, default: null },
}, { timestamps: true });

conversationSchema.index({ professor: 1, lastMessageAt: -1 });
conversationSchema.index({ student: 1, lastMessageAt: -1 });
module.exports = mongoose.model('Conversation', conversationSchema);
