const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  listConnections,
  searchProfessors,
  listConnectedStudentData,
  requestConnection,
  respondToConnection,
  removeConnection,
} = require('../controllers/connectionController');

const router = express.Router();

router.use(protect);
router.get('/', listConnections);
router.get('/professors', searchProfessors);
router.get('/students', listConnectedStudentData);
router.post('/requests', requestConnection);
router.patch('/:id', respondToConnection);
router.delete('/:id', removeConnection);

module.exports = router;
