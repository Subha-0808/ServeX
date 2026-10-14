const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

// Public endpoints
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected user endpoints
router.get('/me', requireAuth, authController.getProfile);
router.post('/add-role', requireAuth, authController.addRole);
router.post('/switch-role', requireAuth, authController.switchRole);

module.exports = router;
