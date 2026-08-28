const StudentRecord = require('../models/StudentRecord');

const ATTENDANCE_VALUES = ['daytime', 'evening'];

const toPublicRecord = (record) => ({
  educationalSpecialNeeds: record.educationalSpecialNeeds,
  tuitionFeesUpToDate: record.tuitionFeesUpToDate,
  scholarshipHolder: record.scholarshipHolder,
  course: record.course,
  attendance: record.attendance,
  firstSemesterGrade: record.firstSemesterGrade,
  secondSemesterGrade: record.secondSemesterGrade,
  submittedAt: record.submittedAt,
  updatedAt: record.updatedAt,
});

const validatePayload = (body) => {
  const errors = {};

  if (typeof body.educationalSpecialNeeds !== 'boolean') {
    errors.educationalSpecialNeeds = 'Select an option.';
  }
  if (typeof body.tuitionFeesUpToDate !== 'boolean') {
    errors.tuitionFeesUpToDate = 'Select an option.';
  }
  if (typeof body.scholarshipHolder !== 'boolean') {
    errors.scholarshipHolder = 'Select an option.';
  }

  const course = String(body.course || '').trim();
  if (!course) {
    errors.course = 'Course is required.';
  } else if (course.length > 150) {
    errors.course = 'Course name is too long.';
  }

  if (!ATTENDANCE_VALUES.includes(body.attendance)) {
    errors.attendance = 'Select daytime or evening attendance.';
  }

  const grade1 = Number(body.firstSemesterGrade);
  if (Number.isNaN(grade1) || grade1 < 0 || grade1 > 20) {
    errors.firstSemesterGrade = 'Enter a grade between 0 and 20.';
  }

  const grade2 = Number(body.secondSemesterGrade);
  if (Number.isNaN(grade2) || grade2 < 0 || grade2 > 20) {
    errors.secondSemesterGrade = 'Enter a grade between 0 and 20.';
  }

  return { errors, course, grade1, grade2 };
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

    const { errors, course, grade1, grade2 } = validatePayload(req.body || {});
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Please correct the highlighted fields.', errors });
    }

    const update = {
      user: req.user._id,
      educationalSpecialNeeds: req.body.educationalSpecialNeeds,
      tuitionFeesUpToDate: req.body.tuitionFeesUpToDate,
      scholarshipHolder: req.body.scholarshipHolder,
      course,
      attendance: req.body.attendance,
      firstSemesterGrade: grade1,
      secondSemesterGrade: grade2,
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