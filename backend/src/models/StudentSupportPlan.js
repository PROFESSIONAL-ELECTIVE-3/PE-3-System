const mongoose = require('mongoose');

// A lightweight, professor-owned support workflow. Only the shared next step is
// visible to the student; the private note stays in the professor workspace.
const studentSupportPlanSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    professor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['monitoring', 'outreach', 'meeting', 'plan_active', 'resolved'], default: 'monitoring' },
    priority: { type: String, enum: ['routine', 'watch', 'priority'], default: 'routine' },
    sharedNextStep: { type: String, trim: true, maxlength: 500, default: '' },
    privateNote: { type: String, trim: true, maxlength: 1000, default: '' },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
);

studentSupportPlanSchema.index({ student: 1, professor: 1 }, { unique: true });
studentSupportPlanSchema.index({ professor: 1, status: 1, updatedAt: -1 });

module.exports = mongoose.model('StudentSupportPlan', studentSupportPlanSchema);
