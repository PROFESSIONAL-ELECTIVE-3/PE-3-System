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
    tuitionFeeStatus: { type: Boolean, required: true },
    scholarshipStatus: { type: Boolean, required: true },

    // --- Academic characteristics ---
    attendance: {
      type: String,
      required: true,
      enum: ['day', 'night'],
    },
    gradeMaximum: { type: Number, required: true, min: 1, max: 100, default: 20 },
    previousSemesterGrade: { type: Number, required: true, min: 0, max: 100 },
    previousSemesterUnitsEnrolled: { type: Number, required: true, min: 1, max: 100 },
    previousSemesterUnitsApproved: { type: Number, required: true, min: 0, max: 100 },

    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentRecord', studentRecordSchema);
