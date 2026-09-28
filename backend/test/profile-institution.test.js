const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Connection = require('../src/models/StudentProfessorConnection');
const Conversation = require('../src/models/Conversation');
const directory = require('../src/controllers/institutionController');
const restores = [];
function stub(object, key, value) {
  const original = object[key]; object[key] = value;
  restores.push(() => { object[key] = original; });
}
afterEach(() => { while (restores.length) restores.pop()(); });

async function update(overrides = {}, role = 'student') {
  delete require.cache[require.resolve('../src/controllers/authController')];
  const { updateProfile } = require('../src/controllers/authController');
  const req = {
    user: { _id: 'account', role, institution: 'Old School' },
    body: { fullName: 'Test Person', bio: '', profileImage: '', ...overrides },
  };
  const res = { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  await updateProfile(req, res, error => { res.error = error; });
  return res;
}

test('institution changes require explicit acknowledgement before directory or database writes', async () => {
  stub(User, 'exists', async () => false);
  stub(directory, 'resolveInstitution', async () => { throw new Error('Should not search'); });
  const result = await update({ institution: 'New School' });
  assert.equal(result.code, 400);
  assert.match(result.body.message, /Confirm/);
});

test('a forged directory selection is rejected', async () => {
  stub(User, 'exists', async () => false);
  stub(directory, 'resolveInstitution', async () => undefined);
  const result = await update({ institution: 'Fake School', institutionId: 'fake', confirmInstitutionChange: true });
  assert.equal(result.code, 400);
  assert.match(result.body.message, /valid institution/);
});

for (const role of ['student', 'professor']) {
  test(`${role} school change retires connections and closes chats in the same transaction`, async () => {
    stub(User, 'exists', async () => false);
    stub(directory, 'resolveInstitution', async () => ({ id: 'new', name: 'New School' }));
    const writes = [];
    let ended = false;
    const session = { withTransaction: async callback => callback(), endSession: async () => { ended = true; } };
    stub(mongoose, 'startSession', async () => session);
    stub(User, 'findOneAndUpdate', async (filter, change, options) => {
      assert.equal(filter.institution, 'Old School'); assert.equal(options.session, session);
      return { _id: 'account', role, ...change.$set };
    });
    stub(Connection, 'updateMany', async (filter, change, options) => {
      writes.push('connections'); assert.equal(filter[role], 'account');
      assert.equal(change.$set.status, 'declined'); assert.equal(options.session, session);
    });
    stub(Conversation, 'updateMany', async (filter, change, options) => {
      if (!options) return;
      writes.push('conversations'); assert.equal(filter[role], 'account');
      assert.equal(change.$set.state, 'closed'); assert.equal(options.session, session);
    });
    const result = await update({ institution: 'New School', institutionId: 'new', confirmInstitutionChange: true }, role);
    assert.ifError(result.error); assert.equal(result.body.user.institution, 'New School');
    assert.deepEqual(writes, ['connections', 'conversations']); assert.equal(ended, true);
  });
}

test('ordinary profile edits do not retire connections', async () => {
  stub(User, 'exists', async () => false);
  stub(User, 'findByIdAndUpdate', async (id, changes) => ({ _id: id, institution: 'Old School', ...changes.$set }));
  stub(Conversation, 'updateMany', async () => {});
  stub(Connection, 'updateMany', async () => { throw new Error('Connections must be preserved'); });
  const result = await update({ institution: 'Old School' });
  assert.ifError(result.error); assert.equal(result.body.institutionChanged, false);
});

test('failed school-change transaction is propagated and the session is closed', async () => {
  stub(User, 'exists', async () => false);
  stub(directory, 'resolveInstitution', async () => ({ id: 'new', name: 'New School' }));
  let ended = false;
  stub(mongoose, 'startSession', async () => ({
    withTransaction: async () => { throw new Error('Transaction failed'); },
    endSession: async () => { ended = true; },
  }));
  const result = await update({ institution: 'New School', institutionId: 'new', confirmInstitutionChange: true });
  assert.match(result.error.message, /Transaction failed/);
  assert.equal(result.body, undefined);
  assert.equal(ended, true);
});

test('institution access denies cross-school and missing participants', async () => {
  const { participantsShareInstitution } = require('../src/utils/institutionAccess');
  for (const [users, expected] of [
    [[{ institution: 'School A' }, { institution: ' school a ' }], true],
    [[{ institution: 'School A' }, { institution: 'School B' }], false],
    [[{ institution: 'School A' }], false],
  ]) {
    stub(User, 'find', () => ({ select: async () => users }));
    assert.equal(await participantsShareInstitution('student', 'professor'), expected);
  }
});
