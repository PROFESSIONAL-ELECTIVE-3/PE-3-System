const mongoose = require('mongoose');

// One record per student, holding the self-reported socio-economic and
// academic fields used for risk classification / forecasting. Updated in
// place as the student edits their entry (unique index on `user`).
const studentRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // --- Socio-economic characteristics ---
    educationalSpecialNeeds: { type: Boolean, required: true },
    tuitionFeesUpToDate: { type: Boolean, required: true },
    scholarshipHolder: { type: Boolean, required: true },

    // --- Academic characteristics ---
    course: { type: String, required: true, trim: true, maxlength: 150 },
    attendance: {
      type: String,
      required: true,
      enum: ['daytime', 'evening'],
    },
    firstSemesterGrade: { type: Number, required: true, min: 0, max: 20 },
    secondSemesterGrade: { type: Number, required: true, min: 0, max: 20 },

    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentRecord', studentRecordSchema);