const StudentProfessorConnection = require('../models/StudentProfessorConnection');
const StudentRecord = require('../models/StudentRecord');
const StudentActivity = require('../models/StudentActivity');

const ensureProfessor = (req, res) => {
  if (req.user.role === 'professor') return true;
  res.status(403).json({ message: 'Only professors can access this workspace.' });
  return false;
};

const publicRecord = (record) => record && ({
  educationalSpecialNeeds: record.educationalSpecialNeeds,
  tuitionFeeStatus: record.tuitionFeeStatus,
  scholarshipStatus: record.scholarshipStatus,
  attendance: record.attendance,
  gradeMaximum: record.gradeMaximum,
  previousSemesterGrade: record.previousSemesterGrade,
  previousSemesterUnitsEnrolled: record.previousSemesterUnitsEnrolled,
  previousSemesterUnitsApproved: record.previousSemesterUnitsApproved,
  updatedAt: record.updatedAt,
});

exports.listConnectedStudentWorkspace = async (req, res, next) => {
  try {
    if (!ensureProfessor(req, res)) return;
    const connections = await StudentProfessorConnection.find({ professor: req.user._id, status: 'accepted' })
      .populate('student', 'fullName institution').sort({ updatedAt: -1 });
    const studentIds = connections.map((item) => item.student._id);
    const [records, forecasts] = await Promise.all([
      StudentRecord.find({ user: { $in: studentIds } }),
      StudentActivity.aggregate([
        { $match: { student: { $in: studentIds }, type: 'forecast_run' } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: '$student', forecast: { $first: '$forecast' }, createdAt: { $first: '$createdAt' } } },
      ]),
    ]);
    const recordByStudent = new Map(records.map((record) => [String(record.user), record]));
    const forecastByStudent = new Map(forecasts.map((item) => [String(item._id), { ...item.forecast, createdAt: item.createdAt }]));
    res.status(200).json({ students: connections.map((connection) => ({
      connectionId: connection._id,
      student: { id: connection.student._id, fullName: connection.student.fullName, institution: connection.student.institution },
      record: publicRecord(recordByStudent.get(String(connection.student._id))),
      forecast: forecastByStudent.get(String(connection.student._id)) || null,
    })) });
  } catch (error) { next(error); }
};
