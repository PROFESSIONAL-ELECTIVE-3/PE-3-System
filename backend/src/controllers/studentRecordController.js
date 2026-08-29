const StudentRecord = require('../models/StudentRecord');

const ATTENDANCE_VALUES = ['day', 'night'];

const toPublicRecord = (record) => ({
  educationalSpecialNeeds: record.educationalSpecialNeeds,
  tuitionFeeStatus: record.tuitionFeeStatus,
  scholarshipStatus: record.scholarshipStatus,
  attendance: record.attendance,
  gradeMaximum: record.gradeMaximum,
  previousSemesterGrade: record.previousSemesterGrade,
  previousSemesterUnitsEnrolled: record.previousSemesterUnitsEnrolled,
  previousSemesterUnitsApproved: record.previousSemesterUnitsApproved,
  submittedAt: record.submittedAt,
  updatedAt: record.updatedAt,
});

const validatePayload = (body) => {
  const errors = {};

  if (typeof body.educationalSpecialNeeds !== 'boolean') {
    errors.educationalSpecialNeeds = 'Select an option.';
  }
  if (typeof body.tuitionFeeStatus !== 'boolean') {
    errors.tuitionFeeStatus = 'Select an option.';
  }
  if (typeof body.scholarshipStatus !== 'boolean') {
    errors.scholarshipStatus = 'Select an option.';
  }

  if (!ATTENDANCE_VALUES.includes(body.attendance)) {
    errors.attendance = 'Select day or night attendance.';
  }

  const gradeMaximum = Number(body.gradeMaximum);
  if (!Number.isFinite(gradeMaximum) || gradeMaximum <= 0 || gradeMaximum > 100) {
    errors.gradeMaximum = 'Select a grade maximum between 1 and 100.';
  }

  const previousSemesterGrade = Number(body.previousSemesterGrade);
  if (Number.isNaN(previousSemesterGrade) || previousSemesterGrade < 0 || previousSemesterGrade > gradeMaximum) {
    errors.previousSemesterGrade = 'Enter a grade within the selected grade scale.';
  }

  const previousSemesterUnitsEnrolled = Number(body.previousSemesterUnitsEnrolled);
  if (!Number.isInteger(previousSemesterUnitsEnrolled) || previousSemesterUnitsEnrolled < 1 || previousSemesterUnitsEnrolled > 100) {
    errors.previousSemesterUnitsEnrolled = 'Enter whole enrolled units between 1 and 100.';
  }

  const previousSemesterUnitsApproved = Number(body.previousSemesterUnitsApproved);
  if (!Number.isInteger(previousSemesterUnitsApproved) || previousSemesterUnitsApproved < 0 || previousSemesterUnitsApproved > 100) {
    errors.previousSemesterUnitsApproved = 'Enter whole approved units between 0 and 100.';
  } else if (Number.isInteger(previousSemesterUnitsEnrolled) && previousSemesterUnitsApproved > previousSemesterUnitsEnrolled) {
    errors.previousSemesterUnitsApproved = 'Approved units cannot exceed enrolled units.';
  }

  return { errors, gradeMaximum, previousSemesterGrade, previousSemesterUnitsEnrolled, previousSemesterUnitsApproved };
};

// @desc    Get the current student's own data-entry record
// @route   GET /api/students/me
// @access  Private (student)
exports.getMyRecord = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can access this resource.' });
    }

    const record = await StudentRecord.findOne({ user: req.user._id });
    res.status(200).json({ record: record ? toPublicRecord(record) : null });
  } catch (err) {
    next(err);
  }
};

// @desc    Create or update the current student's data-entry record
// @route   PUT /api/students/me
// @access  Private (student)
exports.upsertMyRecord = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit this data.' });
    }

    const { errors, gradeMaximum, previousSemesterGrade, previousSemesterUnitsEnrolled, previousSemesterUnitsApproved } = validatePayload(req.body || {});
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Please correct the highlighted fields.', errors });
    }

    const update = {
      user: req.user._id,
      educationalSpecialNeeds: req.body.educationalSpecialNeeds,
      tuitionFeeStatus: req.body.tuitionFeeStatus,
      scholarshipStatus: req.body.scholarshipStatus,
      attendance: req.body.attendance,
      gradeMaximum,
      previousSemesterGrade,
      previousSemesterUnitsEnrolled,
      previousSemesterUnitsApproved,
      submittedAt: new Date(),
    };

    const record = await StudentRecord.findOneAndUpdate(
      { user: req.user._id },
      update,
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: 'Your information has been saved.', record: toPublicRecord(record) });
  } catch (err) {
    next(err);
  }
};
