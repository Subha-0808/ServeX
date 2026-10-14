const UserModel = require('../models/userModel');

const authController = {
  // POST /api/auth/login
  login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required.'
        });
      }

      const user = UserModel.getByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      const { password: pwd, ...safeUser } = user;
      const token = `token_${user.id}`;

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: safeUser,
        roles: safeUser.roles
      });
    } catch (err) {
      console.error('[authController.login] Error:', err);
      res.status(500).json({ success: false, message: 'Server error during login', error: err.message });
    }
  },

  // POST /api/auth/register
  register(req, res) {
    try {
      const { name, email, phone, password, roles } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required fields.'
        });
      }

      // Check existing email
      const existing = UserModel.getByEmail(email);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists.'
        });
      }

      // Validate & normalize roles
      let assignedRoles = [];
      if (Array.isArray(roles) && roles.length > 0) {
        assignedRoles = roles.filter(r => ['Donor', 'NGO', 'Volunteer'].includes(r));
      } else if (typeof req.body.role === 'string') {
        assignedRoles = [req.body.role].filter(r => ['Donor', 'NGO', 'Volunteer'].includes(r));
      }

      if (assignedRoles.length === 0) {
        assignedRoles = ['Donor'];
      }

      const newUser = UserModel.create({
        name,
        email,
        phone: phone || 'N/A',
        password,
        roles: assignedRoles
      });

      const { password: pwd, ...safeUser } = newUser;
      const token = `token_${newUser.id}`;

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user: safeUser,
        roles: safeUser.roles
      });
    } catch (err) {
      console.error('[authController.register] Error:', err);
      res.status(500).json({ success: false, message: 'Server error during registration', error: err.message });
    }
  },

  // GET /api/auth/me
  getProfile(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated.' });
      }

      res.status(200).json({
        success: true,
        user: req.user,
        roles: req.user.roles
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error retrieving profile', error: err.message });
    }
  },

  // POST /api/auth/add-role (safe role expansion without duplicate account)
  addRole(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const { role } = req.body;
      if (!role || !['Donor', 'NGO', 'Volunteer'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Valid eligible role required: Donor, NGO, or Volunteer.'
        });
      }

      if (req.user.roles.includes(role)) {
        return res.status(200).json({
          success: true,
          message: `Your account already holds the ${role} role.`,
          user: req.user,
          roles: req.user.roles
        });
      }

      const updated = UserModel.addRole(req.user.id, role);
      const { password: pwd, ...safeUser } = updated;

      res.status(200).json({
        success: true,
        message: `Role '${role}' successfully added to your account!`,
        user: safeUser,
        roles: safeUser.roles
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message || 'Error adding role', error: err.message });
    }
  },

  // POST /api/auth/switch-role
  switchRole(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const { role } = req.body;
      if (!role) {
        return res.status(400).json({ success: false, message: 'Target role is required.' });
      }

      const isAllowed = req.user.roles.includes(role) || req.user.roles.includes('Admin');
      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: You do not possess the ${role} role on your account.`
        });
      }

      res.status(200).json({
        success: true,
        activeRole: role,
        message: `Session switched to ${role} view.`
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error switching role', error: err.message });
    }
  }
};

module.exports = authController;
