const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { listProfessorPlans, saveProfessorPlan, listStudentPlans } = require('../controllers/supportPlanController');

const router = express.Router();
router.use(protect);
router.get('/professor', listProfessorPlans);
router.put('/professor/:studentId', saveProfessorPlan);
router.get('/student', listStudentPlans);
module.exports = router;
