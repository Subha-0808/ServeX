const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireRoles } = require('../middleware/authMiddleware');

// User listings (available to authenticated users or platform views)
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);

// Role modification (restricted strictly to Admin)
router.patch('/:id/roles', requireAuth, requireRoles(['Admin']), userController.updateUserRoles);

module.exports = router;
