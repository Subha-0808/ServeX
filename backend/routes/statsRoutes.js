const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');

router.get('/', donationController.getStats);

module.exports = router;
