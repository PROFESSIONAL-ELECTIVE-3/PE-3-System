const mongoose = require('mongoose');
const StudentProfessorConnection = require('../models/StudentProfessorConnection');
const StudentSupportPlan = require('../models/StudentSupportPlan');

const statuses = ['monitoring', 'outreach', 'meeting', 'plan_active', 'resolved'];
const priorities = ['routine', 'watch', 'priority'];

const publicPlan = (plan, includePrivate = false) => plan && ({
  id: plan._id,
  status: plan.status,
  priority: plan.priority,
  sharedNextStep: plan.sharedNextStep,
  dueDate: plan.dueDate,
  updatedAt: plan.updatedAt,
  ...(includePrivate ? { privateNote: plan.privateNote, studentId: plan.student } : {}),
});

exports.listProfessorPlans = async (req, res, next) => {
  try {
    if (req.user.role !== 'professor') return res.status(403).json({ message: 'Only professors can access support workflows.' });
    const plans = await StudentSupportPlan.find({ professor: req.user._id }).lean();
    return res.json({ plans: plans.map((plan) => publicPlan(plan, true)) });
  } catch (error) { next(error); }
};

exports.saveProfessorPlan = async (req, res, next) => {
  try {
    if (req.user.role !== 'professor') return res.status(403).json({ message: 'Only professors can update support workflows.' });
    const studentId = String(req.params.studentId || '');
    if (!mongoose.isValidObjectId(studentId)) return res.status(400).json({ message: 'Invalid student.' });
    const connected = await StudentProfessorConnection.exists({ student: studentId, professor: req.user._id, status: 'accepted' });
    if (!connected) return res.status(403).json({ message: 'A support plan can only be created for a connected student.' });
    const { status, priority, sharedNextStep, privateNote, dueDate } = req.body || {};
    if (!statuses.includes(status) || !priorities.includes(priority)) return res.status(400).json({ message: 'Choose a valid status and priority.' });
    if (typeof sharedNextStep !== 'string' || sharedNextStep.trim().length > 500 || typeof privateNote !== 'string' || privateNote.trim().length > 1000) return res.status(400).json({ message: 'Keep the shared next step under 500 characters and the private note under 1000.' });
    const parsedDate = dueDate ? new Date(dueDate) : null;
    if (dueDate && Number.isNaN(parsedDate.getTime())) return res.status(400).json({ message: 'Choose a valid follow-up date.' });
    const plan = await StudentSupportPlan.findOneAndUpdate(
      { student: studentId, professor: req.user._id },
      { student: studentId, professor: req.user._id, status, priority, sharedNextStep: sharedNextStep.trim(), privateNote: privateNote.trim(), dueDate: parsedDate },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return res.json({ message: 'Support workflow saved.', plan: publicPlan(plan, true) });
  } catch (error) { next(error); }
};

exports.listStudentPlans = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Only students can view shared support plans.' });
    const plans = await StudentSupportPlan.find({ student: req.user._id, sharedNextStep: { $ne: '' } })
      .populate('professor', 'fullName')
      .sort({ updatedAt: -1 })
      .lean();
    return res.json({ plans: plans.map((plan) => ({ ...publicPlan(plan), professor: { fullName: plan.professor.fullName } })) });
  } catch (error) { next(error); }
};
