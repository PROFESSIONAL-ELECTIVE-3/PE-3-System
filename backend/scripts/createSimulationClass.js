// Explicit simulation setup only. Never called by the server or CSV importer.
const path = require('node:path');
const fs = require('node:fs/promises');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Profile = require('../src/models/StudentRecord');
const Connection = require('../src/models/StudentProfessorConnection');
const Academic = require('../src/models/AcademicRecord');
const Revision = require('../src/models/AcademicRecordRevision');
const Activity = require('../src/models/StudentActivity');
const Event = require('../src/models/ProfessorHistoryEvent');
const { HEADERS, parseCsv, validateAcademicRow, institutionKey } = require('../src/utils/academicValidation');
const { configureMongoDns, checkMongoSrv } = require('../src/config/mongoDns');
const { redact } = require('../src/utils/migrationDiagnostics');

const ROOT = path.resolve(__dirname, '../..');
const INSTITUTION = 'Pamantasan ng Lungsod ng Maynila';
const PREFIX = 'Retainify simulation class';

function csv(headers, rows) {
  const cell = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
  return [headers, ...rows.map(row => headers.map(key => row[key]))]
    .map(row => row.map(cell).join(',')).join('\r\n') + '\r\n';
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('node backend/scripts/createSimulationClass.js [--cohort sim20261114-abcdef] [--prepare | --apply]');
    console.log('Creates a NEW professor and 30 NEW students atomically. Default: read-only preview.');
    return;
  }
  let apply = false;
  let prepare = false;
  let cohort = 'sim' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + crypto.randomBytes(3).toString('hex');
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--apply') apply = true;
    else if (args[i] === '--prepare') prepare = true;
    else if (args[i] === '--cohort' && args[i + 1]) cohort = args[++i];
    else throw new Error('Supported options: --cohort identifier, --prepare, --apply, --help.');
  }
  if (!/^sim\d{8}-[a-z0-9]{6}$/.test(cohort)) throw new Error('Use a cohort such as sim20261114-abcdef.');
  const marker = `${PREFIX}: ${cohort}. Synthetic demonstration accounts.`;
  const professor = { _id: new mongoose.Types.ObjectId(), role: 'professor',
    fullName: `Simulation Professor ${cohort}`, email: `professor.${cohort}@example.com` };
  const students = Array.from({ length: 30 }, (_, i) => ({ _id: new mongoose.Types.ObjectId(), role: 'student',
    fullName: `Simulation Student ${String(i + 1).padStart(2, '0')} ${cohort}`,
    email: `student${String(i + 1).padStart(2, '0')}.${cohort}@example.com`,
  }));
  const accounts = [professor, ...students];
  const source = parseCsv(await fs.readFile(path.join(ROOT, 'Retainify_BSIT_3-3_Class_Test.csv'), 'utf8'));
  if (source.length !== 30) throw new Error('The sample academic CSV must contain exactly 30 students.');
  const rows = source.map((row, i) => ({ ...row, studentEmail: students[i].email }));
  const academicCsv = csv(HEADERS, rows);
  for (const row of parseCsv(academicCsv)) {
    const { errors } = validateAcademicRow(row);
    if (errors.length) throw new Error(`Row ${row.rowNumber}: ${errors.join(' ')}`);
  }
  const periods = new Set(rows.map(row => `${row.academicYear}:${row.semester}`));
  if (periods.size !== 1) throw new Error('Use one academic period per simulation.');
  if (!apply && !prepare) {
    console.log(JSON.stringify({ mode: 'preview', cohort, professor: professor.email, students: students.length,
      institution: INSTITUTION, academicYear: rows[0].academicYear, semester: Number(rows[0].semester),
      academicStatus: 'awaiting_upload', csvRowsValidated: rows.length }));
    return;
  }

  const emails = accounts.map(account => account.email);
  const folder = path.join(ROOT, 'tmp/simulations', cohort);
  await fs.mkdir(folder, { recursive: true });
  const planFile = path.join(folder, 'simulation-plan.json');
  let previousPlan;
  try { previousPlan = JSON.parse(await fs.readFile(planFile, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (previousPlan) {
    if (previousPlan.cohort !== cohort || previousPlan.accounts?.length !== 31) throw new Error('Invalid saved simulation plan.');
    for (let i = 0; i < accounts.length; i++) {
      const saved = previousPlan.accounts[i];
      if (saved.email !== accounts[i].email || saved.role !== accounts[i].role || saved.fullName !== accounts[i].fullName ||
        !mongoose.isValidObjectId(saved._id) || typeof saved.password !== 'string' || saved.password.length < 16) {
        throw new Error('Saved account plan does not match the selected cohort.');
      }
      accounts[i]._id = new mongoose.Types.ObjectId(saved._id);
      accounts[i].password = saved.password;
    }
  }
  // Persist credentials before the transaction so a filesystem failure cannot strand accounts.
  if (!previousPlan) {
    for (const account of accounts) account.password = 'Rt!' + crypto.randomBytes(12).toString('base64url');
    await fs.writeFile(planFile, JSON.stringify({ cohort, accounts }, null, 2), { flag: 'wx', mode: 0o600 });
  }
  const academicFile = path.join(folder, 'Retainify_Simulation_Academic.csv');
  const passwordFile = path.join(folder, 'Retainify_Simulation_Accounts.csv');
  const statusFile = path.join(folder, 'Retainify_Simulation_Status.json');
  await fs.writeFile(academicFile, academicCsv);
  await fs.writeFile(passwordFile, csv(['role', 'fullName', 'email', 'password', 'professorEmail', 'institution'],
    accounts.map(account => ({ ...account, institution: INSTITUTION,
      professorEmail: account.role === 'student' ? professor.email : '' }))), { mode: 0o600 });
  if (!previousPlan) await fs.writeFile(statusFile, JSON.stringify({ status: 'prepared_not_created', cohort }, null, 2));
  if (!apply) {
    console.log(JSON.stringify({ status: 'prepared_not_created', cohort, professor: professor.email, students: 30,
      academicFile, passwordFile, command: `node backend/scripts/createSimulationClass.js --cohort ${cohort} --apply` }));
    return;
  }
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error('MONGODB_URI is missing in backend/.env.');
  configureMongoDns();
  await checkMongoSrv(uri);
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME || 'StudentPerformanceSystem',
    serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000, socketTimeoutMS: 20000,
    autoCreate: false, autoIndex: false });
  if (await User.exists({ email: { $in: emails } })) throw new Error('This cohort already exists. Check its status file; existing accounts will not be changed.');

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      if (await User.exists({ email: { $in: emails } }).session(session)) throw new Error('A cohort account already exists. No changes applied.');
      for (const account of accounts) {
        await User.create([{ ...account, institution: INSTITUTION, institutionId: 'city-manila-plm',
          bio: marker, emailVerified: true }], { session });
      }
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const number = i + 1;
        const record = { educationalSpecialNeeds: number % 10 === 0, tuitionFeeStatus: number % 4 !== 0,
          scholarshipStatus: number % 3 === 0, profileVersion: 1 };
        await Profile.create([{ user: student._id, ...record }], { session });
        await Activity.create([{ student: student._id, type: 'record_created', record, profileVersion: 1 }], { session });
        const [connection] = await Connection.create([{ student: student._id, professor: professor._id,
          status: 'accepted' }], { session });
        await Event.create([{ eventKey: `${cohort}:connection:${connection._id}`, professors: [professor._id],
          institutionKey: institutionKey(INSTITUTION), category: 'connection', action: 'accepted',
          actor: { id: professor._id, fullName: professor.fullName, role: professor.role },
          student: { id: student._id, fullName: student.fullName, role: student.role },
          details: { connectionId: String(connection._id), status: 'accepted', source: 'simulation_class_seed' } }], { session });
        const [academic] = await Academic.create([{ student: student._id, institutionKey: institutionKey(INSTITUTION),
          academicYear: rows[i].academicYear, semester: Number(rows[i].semester), provider: professor._id,
          status: 'awaiting_upload' }], { session });
        await Revision.create([{ academicRecord: academic._id, student: student._id, actor: student._id,
          actorName: student.fullName, studentName: student.fullName, receivingProviderName: professor.fullName,
          action: 'provider_designated', reason: marker, after: academic.toObject() }], { session });
      }
    }, { maxCommitTimeMS: 10000 });
  } finally {
    await session.endSession();
  }
  const saved = await User.find({ email: { $in: emails }, bio: marker }).select('+password').lean();
  if (saved.length !== 31) throw new Error('Post-creation verification failed: account count. See status file before retrying.');
  for (const account of accounts) {
    const match = saved.find(user => user.email === account.email);
    if (!match?.emailVerified || match.role !== account.role || !await bcrypt.compare(account.password, match.password)) {
      throw new Error('Post-creation login verification failed. See status file before retrying.');
    }
  }
  const ids = students.map(student => student._id);
  const connections = await Connection.countDocuments({ student: { $in: ids }, professor: professor._id, status: 'accepted' });
  const profiles = await Profile.countDocuments({ user: { $in: ids }, profileVersion: 1 });
  const providers = await Academic.countDocuments({ student: { $in: ids }, provider: professor._id, status: 'awaiting_upload' });
  if (connections !== 30 || profiles !== 30 || providers !== 30) throw new Error('Post-creation class verification failed. See status file before retrying.');
  const result = { status: 'created_and_verified', cohort, database: mongoose.connection.name, professor: professor.email,
    accounts: saved.length, students: 30, acceptedConnections: connections, profiles, providerAssignments: providers,
    academicYear: rows[0].academicYear, semester: Number(rows[0].semester), academicFile, passwordFile };
  await fs.writeFile(statusFile, JSON.stringify(result, null, 2));
  await fs.writeFile(path.join(folder, 'Retainify_Simulation_Instructions.txt'), [
    'Retainify sample simulation', '', 'Status: 31 accounts created and passwords verified.',
    `Professor: ${professor.email}`, 'Account passwords: Retainify_Simulation_Accounts.csv',
    'All 30 students have accepted professor connections, completed personal profiles, and assigned academic providers.',
    '', '1. Sign in using the professor email and its password from the accounts file.',
    '2. Upload Retainify_Simulation_Academic.csv in the professor academic CSV import.',
    `3. Use academic year ${rows[0].academicYear}, semester ${rows[0].semester}. Validate and confirm the 30 records.`,
    '4. Run the class forecasts. Sign in as any student to inspect their forecast and history.',
    '', 'These are synthetic demonstration accounts with example.com addresses and preverified access.',
    'The CSV contains varied grades, enrolled/approved units, and day/night attendance.',
    'Forecast risk levels are assigned by the model when forecasts run; no results are predetermined.',
  ].join('\r\n') + '\r\n');
  console.log(JSON.stringify(result));
}

if (require.main === module) {
  main().catch(error => {
    console.error('Simulation setup failed: ' + redact(error.message, process.env.MONGODB_URI));
    process.exitCode = 1;
  }).finally(() => mongoose.disconnect());
}
