const User = require('../models/User');

const sameInstitution = (first, second) => {
  const normalize = (value) => String(value || '').trim().toLowerCase();
  return Boolean(normalize(first) && normalize(first) === normalize(second));
};

const participantsShareInstitution = async (student, professor) => {
  const users = await User.find({ _id: { $in: [student, professor] } }).select('institution');
  return users.length === 2 && sameInstitution(users[0].institution, users[1].institution);
};

module.exports = { sameInstitution, participantsShareInstitution };
