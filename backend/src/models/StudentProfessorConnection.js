const mongoose = require('mongoose');

const studentProfessorConnectionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    professor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

studentProfessorConnectionSchema.index({ student: 1, professor: 1 }, { unique: true });

module.exports = mongoose.model('StudentProfessorConnection', studentProfessorConnectionSchema);
