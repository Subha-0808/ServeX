const UserModel = require('../models/userModel');

const userController = {
  // GET /api/users
  getUsers(req, res) {
    try {
      const users = UserModel.getAll();
      // Omit passwords
      const safeUsers = users.map(({ password, ...u }) => u);
      res.status(200).json({
        success: true,
        count: safeUsers.length,
        data: safeUsers
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error retrieving users', error: err.message });
    }
  },

  // GET /api/users/:id
  getUserById(req, res) {
    try {
      const user = UserModel.getById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const { password, ...safeUser } = user;
      res.status(200).json({ success: true, data: safeUser });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error retrieving user', error: err.message });
    }
  },

  // PATCH /api/users/:id/roles (Admin only)
  updateUserRoles(req, res) {
    try {
      const { roles } = req.body;
      if (!Array.isArray(roles) || roles.length === 0) {
        return res.status(400).json({ success: false, message: 'Array of roles is required.' });
      }

      const updated = UserModel.update(req.params.id, { roles });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const { password, ...safeUser } = updated;
      res.status(200).json({
        success: true,
        message: `Updated roles for ${safeUser.name}`,
        data: safeUser
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error updating user roles', error: err.message });
    }
  }
};

module.exports = userController;
