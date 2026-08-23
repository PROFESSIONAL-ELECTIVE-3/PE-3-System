const express = require('express');
const { searchInstitutions } = require('../controllers/institutionController');

const router = express.Router();

router.get('/', searchInstitutions);

module.exports = router;
