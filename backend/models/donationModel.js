const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'donations.json');

// Helper to calculate relative ISO dates
function addHours(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

// Initial sample seed dataset
function getInitialSeedData() {
  return [
    {
      id: 'FS-1001',
      title: '50 Veg Biryani Packets & Raita',
      category: 'Cooked Meals',
      quantity: 50,
      unit: 'meals',
      estimatedServings: 50,
      dietary: 'Vegetarian',
      storage: 'Freshly Cooked / Insulated',
      expiryDateTime: addHours(6),
      pickupLocation: 'Green Park Restaurant, 12 MG Road, Central Market',
      donorName: 'Green Park Restaurant',
      donorContact: '+91 98765 43210',
      description: 'Excess freshly prepared vegetable dum biryani packed in individual hygiene containers from a lunchtime corporate banquet.',
      status: 'Available',
      createdAt: addHours(-2),
      claimedBy: null,
      claimedAt: null,
      assignedVolunteer: null,
      pickedUpAt: null,
      deliveredAt: null,
      deliveryNotes: null
    },
    {
      id: 'FS-1002',
      title: 'Fresh Whole Wheat Breads & Croissants',
      category: 'Bakery & Breads',
      quantity: 35,
      unit: 'packets',
      estimatedServings: 70,
      dietary: 'Vegetarian',
      storage: 'Room Temperature',
      expiryDateTime: addHours(18),
      pickupLocation: 'Artisan Bakers, Shop 4B, Indiranagar 100ft Rd',
      donorName: 'Artisan Bakers',
      donorContact: '+91 98222 33445',
      description: 'Fresh unsold artisan loaves, bread buns, and butter croissants packed at 8 PM closing.',
      status: 'Claimed',
      createdAt: addHours(-5),
      claimedBy: 'Hope Food Rescue NGO',
      claimedAt: addHours(-3),
      claimNotes: 'Allocated for distribution at East Slum Children Community Centre. (Coordinated by Sarah Jenkins)',
      assignedVolunteer: 'Rahul Sharma',
      pickedUpAt: null,
      deliveredAt: null,
      deliveryNotes: null
    },
    {
      id: 'FS-1003',
      title: 'Paneer Butter Masala, Dal Makhani & Jeera Rice',
      category: 'Cooked Meals',
      quantity: 25,
      unit: 'kg',
      estimatedServings: 80,
      dietary: 'Vegetarian',
      storage: 'Refrigerated Catering Containers',
      expiryDateTime: addHours(12),
      pickupLocation: 'Grand Palace Banquets, Gate 2, Ring Road',
      donorName: 'Grand Palace Banquets',
      donorContact: '+91 98450 11223',
      description: 'Large banquet buffet surplus stored immediately in clean thermal stainless steel food-grade urns.',
      status: 'Picked Up',
      createdAt: addHours(-6),
      claimedBy: 'Annam Shelter Foundation',
      claimedAt: addHours(-4),
      claimNotes: 'Urgent distribution to night shelter residents.',
      assignedVolunteer: 'Rahul Sharma',
      pickedUpAt: addHours(-1),
      deliveredAt: null,
      deliveryNotes: 'Picked up cleanly from Banquet Chef. On delivery transit now.'
    },
    {
      id: 'FS-1004',
      title: 'Assorted Apples, Bananas & Seasonal Produce',
      category: 'Fresh Produce',
      quantity: 45,
      unit: 'kg',
      estimatedServings: 120,
      dietary: 'Vegan',
      storage: 'Crates / Cool Area',
      expiryDateTime: addHours(48),
      pickupLocation: 'Daily Fresh Supermarket, Warehouse Bay 3, Koramangala',
      donorName: 'Daily Fresh Supermarket',
      donorContact: '+91 98333 44556',
      description: 'Edible, slightly blemished fresh fruits sorted for immediate redistribution.',
      status: 'Delivered',
      createdAt: addHours(-24),
      claimedBy: 'Care Foundation Orphanage',
      claimedAt: addHours(-20),
      claimNotes: 'Distributed to 95 children and senior home residents.',
      assignedVolunteer: 'Priya Nair',
      pickedUpAt: addHours(-16),
      deliveredAt: addHours(-14),
      deliveryNotes: 'Delivered in good condition to Care Foundation main dining hall.'
    },
    {
      id: 'FS-1005',
      title: 'Campus Club Sandwiches & Cold Juices',
      category: 'Cooked Meals',
      quantity: 15,
      unit: 'packets',
      estimatedServings: 20,
      dietary: 'Vegetarian',
      storage: 'Room Temperature',
      expiryDateTime: addHours(-4),
      pickupLocation: 'Campus Cafeteria, North Block counter',
      donorName: 'University Central Canteen',
      donorContact: '+91 98666 77889',
      description: 'Day-end boxed sandwiches and sealed fresh juice bottles.',
      status: 'Expired',
      createdAt: addHours(-16),
      claimedBy: null,
      claimedAt: null,
      assignedVolunteer: null,
      pickedUpAt: null,
      deliveredAt: null,
      deliveryNotes: 'Auto-flagged expired: Passed safety consumption window.'
    },
    {
      id: 'FS-1006',
      title: 'Pasteurized Toned Milk Packets & Curd Tubs',
      category: 'Dairy & Eggs',
      quantity: 20,
      unit: 'liters',
      estimatedServings: 60,
      dietary: 'Vegetarian',
      storage: 'Refrigerated (< 4°C)',
      expiryDateTime: addHours(30),
      pickupLocation: 'Metro Dairy Outlet, 5th Cross, Malleshwaram',
      donorName: 'Metro Dairy Hub',
      donorContact: '+91 98555 66778',
      description: 'Unopened dairy surplus nearing display rotation date, completely chilled and safe.',
      status: 'Available',
      createdAt: addHours(-8),
      claimedBy: null,
      claimedAt: null,
      assignedVolunteer: null,
      pickedUpAt: null,
      deliveredAt: null,
      deliveryNotes: null
    }
  ];
}

// Ensure data file exists
function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const seed = getInitialSeedData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf8');
  }
}

// Auto-check expiry status on data items
function refreshExpiries(donations) {
  const now = new Date();
  let modified = false;

  donations.forEach(item => {
    if (item.status === 'Available' && item.expiryDateTime) {
      if (new Date(item.expiryDateTime) <= now) {
        item.status = 'Expired';
        modified = true;
      }
    }
  });

  return { donations, modified };
}

const DonationModel = {
  getAll() {
    ensureFile();
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      let data = JSON.parse(raw);
      const { donations, modified } = refreshExpiries(data);
      if (modified) {
        this.saveAll(donations);
      }
      return donations;
    } catch (err) {
      console.error('Error reading donations data:', err);
      return [];
    }
  },

  getById(id) {
    const donations = this.getAll();
    return donations.find(d => d.id === id) || null;
  },

  saveAll(donations) {
    ensureFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(donations, null, 2), 'utf8');
    return donations;
  },

  create(donationData) {
    const donations = this.getAll();
    
    // Auto generate next FS-xxxx ID
    let nextNum = 1001;
    donations.forEach(d => {
      const num = parseInt(d.id.replace('FS-', ''), 10);
      if (!isNaN(num) && num >= nextNum) {
        nextNum = num + 1;
      }
    });
    const newId = `FS-${nextNum}`;

    const newDonation = {
      id: newId,
      title: donationData.title,
      category: donationData.category || 'Cooked Meals',
      quantity: Number(donationData.quantity),
      unit: donationData.unit || 'meals',
      estimatedServings: Number(donationData.estimatedServings || donationData.quantity),
      dietary: donationData.dietary || 'Vegetarian',
      storage: donationData.storage || 'Room Temperature',
      expiryDateTime: donationData.expiryDateTime,
      pickupLocation: donationData.pickupLocation,
      donorName: donationData.donorName,
      donorContact: donationData.donorContact,
      description: donationData.description || 'Surplus food available for redistribution.',
      status: 'Available',
      createdAt: new Date().toISOString(),
      claimedBy: null,
      claimedAt: null,
      claimNotes: null,
      assignedVolunteer: null,
      pickedUpAt: null,
      deliveredAt: null,
      deliveryNotes: null
    };

    donations.unshift(newDonation);
    this.saveAll(donations);
    return newDonation;
  },

  update(id, updates) {
    const donations = this.getAll();
    const index = donations.findIndex(d => d.id === id);
    if (index === -1) return null;

    donations[index] = { ...donations[index], ...updates };
    this.saveAll(donations);
    return donations[index];
  },

  delete(id) {
    const donations = this.getAll();
    const index = donations.findIndex(d => d.id === id);
    if (index === -1) return null;

    const removed = donations.splice(index, 1)[0];
    this.saveAll(donations);
    return removed;
  },

  reset() {
    ensureFile();
    const fresh = getInitialSeedData();
    this.saveAll(fresh);
    return fresh;
  }
};

module.exports = DonationModel;
