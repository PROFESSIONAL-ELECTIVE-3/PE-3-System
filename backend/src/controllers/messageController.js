const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const StudentProfessorConnection = require('../models/StudentProfessorConnection');

const validId = (id) => mongoose.isValidObjectId(id);
const peer = (conversation, role) => role === 'professor' ? conversation.student : conversation.professor;
const summary = (conversation, role) => ({
  id: conversation._id,
  state: conversation.state,
  lastMessageAt: conversation.lastMessageAt,
  peer: { id: peer(conversation, role)._id, fullName: peer(conversation, role).fullName },
  unreadCount: conversation.unreadCount || 0,
});

exports.listConversations = async (req, res, next) => {
  try {
    const owner = req.user.role === 'professor' ? { professor: req.user._id } : { student: req.user._id };
    const conversations = await Conversation.aggregate([
      { $match: { ...owner, state: 'open' } },
      { $lookup: { from: 'users', localField: req.user.role === 'professor' ? 'student' : 'professor', foreignField: '_id', as: 'peer' } },
      { $lookup: { from: 'messages', let: { conversationId: '$_id' }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$conversation', '$$conversationId'] }, { $ne: ['$sender', req.user._id] }, { $eq: ['$readAt', null] }] } } }, { $count: 'count' }], as: 'unread' } },
      { $unwind: '$peer' }, { $sort: { lastMessageAt: -1 } },
    ]);
    res.json({ conversations: conversations.map((item) => summary({ ...item, student: req.user.role === 'professor' ? item.peer : { _id: req.user._id }, professor: req.user.role === 'student' ? item.peer : { _id: req.user._id } }, req.user.role)) });
  } catch (error) { next(error); }
};

exports.createConversation = async (req, res, next) => {
  try {
    const recipientId = String(req.body.recipientId || req.body.studentId || '');
    if (!validId(recipientId)) return res.status(400).json({ message: 'Choose a valid connected recipient.' });
    const connectionFilter = req.user.role === 'professor'
      ? { student: recipientId, professor: req.user._id, status: 'accepted' }
      : { student: req.user._id, professor: recipientId, status: 'accepted' };
    const connection = await StudentProfessorConnection.findOne(connectionFilter);
    if (!connection) return res.status(403).json({ message: 'Messaging is available only for accepted student connections.' });
    const conversation = await Conversation.findOneAndUpdate(
      { connection: connection._id }, { $setOnInsert: { student: connection.student, professor: connection.professor, connection: connection._id } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('student', 'fullName').populate('professor', 'fullName');
    res.status(201).json({ conversation: summary(conversation, req.user.role) });
  } catch (error) { next(error); }
};

exports.getMessages = async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid conversation.' });
    const filter = req.user.role === 'professor' ? { _id: req.params.id, professor: req.user._id } : { _id: req.params.id, student: req.user._id };
    const conversation = await Conversation.findOne(filter).populate('student', 'fullName').populate('professor', 'fullName');
    if (!conversation || conversation.state !== 'open') return res.status(404).json({ message: 'Conversation is not available.' });
    await Message.updateMany({ conversation: conversation._id, sender: { $ne: req.user._id }, readAt: null }, { $set: { readAt: new Date() } });
    const messages = await Message.find({ conversation: conversation._id }).populate('sender', 'fullName role').sort({ createdAt: 1 }).lean();
    res.json({ conversation: summary(conversation, req.user.role), messages: messages.map((message) => ({ id: message._id, body: message.body, createdAt: message.createdAt, sender: { id: message.sender._id, fullName: message.sender.fullName, role: message.sender.role }, readAt: message.readAt })) });
  } catch (error) { next(error); }
};

exports.sendMessage = async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid conversation.' });
    const body = typeof req.body.body === 'string' ? req.body.body.trim() : '';
    if (!body || body.length > 2000) return res.status(400).json({ message: 'Write a message between 1 and 2,000 characters.' });
    const filter = req.user.role === 'professor' ? { _id: req.params.id, professor: req.user._id, state: 'open' } : { _id: req.params.id, student: req.user._id, state: 'open' };
    const conversation = await Conversation.findOne(filter);
    if (!conversation) return res.status(404).json({ message: 'Conversation is not available.' });
    const connected = await StudentProfessorConnection.exists({ _id: conversation.connection, status: 'accepted' });
    if (!connected) return res.status(403).json({ message: 'This student connection is no longer active.' });
    const message = await Message.create({ conversation: conversation._id, sender: req.user._id, body });
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();
    res.status(201).json({ message: { id: message._id, body: message.body, createdAt: message.createdAt, sender: { id: req.user._id, fullName: req.user.fullName, role: req.user.role } } });
  } catch (error) { next(error); }
};
