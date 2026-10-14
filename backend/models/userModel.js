const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'users.json');

// Initial seed users with multi-role support
function getInitialSeedUsers() {
  return [
    {
      id: 'USR-01',
      name: 'Green Park Restaurant',
      email: 'donations@greenpark.in',
      phone: '+91 98765 43210',
      password: 'donor123',
      roles: ['Donor'],
      status: 'Active',
      totalDonations: 18,
      createdAt: '2026-01-10T10:00:00.000Z'
    },
    {
      id: 'USR-02',
      name: 'Artisan Bakers',
      email: 'bakery@artisan.org',
      phone: '+91 98222 33445',
      password: 'donor123',
      roles: ['Donor'],
      status: 'Active',
      totalDonations: 24,
      createdAt: '2026-01-15T11:00:00.000Z'
    },
    {
      id: 'USR-03',
      name: 'Hope Food Rescue NGO',
      email: 'contact@hopefood.org',
      phone: '+91 98111 22334',
      password: 'ngo123',
      roles: ['NGO'],
      status: 'Verified',
      totalClaims: 32,
      createdAt: '2026-01-12T09:30:00.000Z'
    },
    {
      id: 'USR-04',
      name: 'Annam Shelter Foundation',
      email: 'relief@annamshelter.in',
      phone: '+91 98450 11223',
      password: 'ngo123',
      roles: ['NGO'],
      status: 'Verified',
      totalClaims: 41,
      createdAt: '2026-01-18T14:15:00.000Z'
    },
    {
      id: 'USR-05',
      name: 'Rahul Sharma',
      email: 'rahul.s@foodshare.in',
      phone: '+91 97234 56789',
      password: 'vol123',
      roles: ['Volunteer'],
      status: 'Active',
      completedDeliveries: 19,
      createdAt: '2026-02-01T08:00:00.000Z'
    },
    {
      id: 'USR-06',
      name: 'Priya Nair',
      email: 'priya.nair@foodshare.in',
      phone: '+91 97890 12345',
      password: 'vol123',
      roles: ['Volunteer', 'Donor'],
      status: 'Active',
      completedDeliveries: 15,
      totalDonations: 5,
      createdAt: '2026-02-10T12:00:00.000Z'
    },
    {
      id: 'USR-07',
      name: 'Kiran Mehta',
      email: 'kiran@foodshare.in',
      phone: '+91 96555 12300',
      password: 'multi123',
      roles: ['Donor', 'NGO', 'Volunteer'],
      status: 'Active',
      totalDonations: 7,
      totalClaims: 3,
      completedDeliveries: 6,
      createdAt: '2026-02-15T16:45:00.000Z'
    },
    {
      id: 'USR-08',
      name: 'FoodShare Administrator',
      email: 'admin@foodshare.in',
      phone: '+91 99000 88776',
      password: 'admin123',
      roles: ['Admin'],
      status: 'Verified',
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  ];
}

class UserModel {
  constructor() {
    this.ensureDataFile();
  }

  ensureDataFile() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE)) {
      this.writeUsers(getInitialSeedUsers());
    } else {
      // Migrate legacy single-role records if present
      this.migrateLegacyRoles();
    }
  }

  migrateLegacyRoles() {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const users = JSON.parse(raw);
      let modified = false;

      const migrated = users.map(user => {
        // If user has 'role' string but no 'roles' array, safely migrate
        if (!user.roles && user.role) {
          user.roles = [user.role];
          delete user.role;
          modified = true;
        } else if (!user.roles || !Array.isArray(user.roles)) {
          user.roles = ['Donor'];
          modified = true;
        }
        return user;
      });

      if (modified) {
        this.writeUsers(migrated);
        console.log('[UserModel] Migrated legacy single-role users to multi-role format.');
      }
    } catch (err) {
      console.error('[UserModel] Error during role migration:', err);
    }
  }

  readUsers() {
    try {
      if (!fs.existsSync(DATA_FILE)) {
        return getInitialSeedUsers();
      }
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      // Ensure roles is always an array
      return parsed.map(u => ({
        ...u,
        roles: Array.isArray(u.roles) ? u.roles : (u.role ? [u.role] : ['Donor'])
      }));
    } catch (err) {
      console.error('[UserModel] Error reading users file:', err);
      return [];
    }
  }

  writeUsers(users) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.error('[UserModel] Error writing users file:', err);
      return false;
    }
  }

  getAll() {
    return this.readUsers();
  }

  getById(id) {
    if (!id) return null;
    const users = this.readUsers();
    return users.find(u => u.id === id) || null;
  }

  getByEmail(email) {
    if (!email) return null;
    const users = this.readUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  }

  create(userData) {
    const users = this.readUsers();
    
    // Normalise roles into an array of strings
    let roles = [];
    if (Array.isArray(userData.roles)) {
      roles = userData.roles;
    } else if (typeof userData.role === 'string') {
      roles = [userData.role];
    } else {
      roles = ['Donor'];
    }

    // Restrict Admin self-assignment (security requirement #4 & #7)
    roles = roles.filter(r => r !== 'Admin');
    if (roles.length === 0) roles = ['Donor'];

    const nextIndex = users.length + 1;
    const newId = `USR-${String(nextIndex + 10).padStart(2, '0')}`;

    // Verified status for NGO requires verification; standard donors/volunteers are active
    const isNgo = roles.includes('NGO');
    const status = userData.status || (isNgo ? 'Pending Verification' : 'Active');

    const newUser = {
      id: newId,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      phone: userData.phone || 'N/A',
      password: userData.password,
      roles: roles,
      status: status,
      totalDonations: 0,
      totalClaims: 0,
      completedDeliveries: 0,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.writeUsers(users);
    return newUser;
  }

  update(id, updates) {
    const users = this.readUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;

    // Preserve critical fields
    const existing = users[idx];
    const updated = {
      ...existing,
      ...updates,
      id: existing.id, // ID cannot be changed
      createdAt: existing.createdAt
    };

    // Ensure roles is valid array
    if (updates.roles) {
      updated.roles = Array.from(new Set(updates.roles));
    }

    users[idx] = updated;
    this.writeUsers(users);
    return updated;
  }

  addRole(id, newRole) {
    const users = this.readUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;

    const user = users[idx];
    if (!Array.isArray(user.roles)) user.roles = [];

    // Admin role cannot be added via regular self-service
    if (newRole === 'Admin') {
      throw new Error('Admin role cannot be self-assigned');
    }

    if (!user.roles.includes(newRole)) {
      user.roles.push(newRole);
      // If adding NGO role, preserve verification requirement
      if (newRole === 'NGO' && user.status === 'Active') {
        user.ngoVerification = 'Pending';
      }
      users[idx] = user;
      this.writeUsers(users);
    }

    return user;
  }

  reset() {
    const seed = getInitialSeedUsers();
    this.writeUsers(seed);
    return seed;
  }
}

module.exports = new UserModel();
