const DonationModel = require('../models/donationModel');

const donationController = {
  // GET /api/donations
  getDonations(req, res) {
    try {
      let donations = DonationModel.getAll();
      const { status, category, search, urgency } = req.query;

      if (status && status !== 'all') {
        donations = donations.filter(d => d.status.toLowerCase() === status.toLowerCase());
      }

      if (category && category !== 'all') {
        donations = donations.filter(d => d.category.toLowerCase() === category.toLowerCase());
      }

      if (search) {
        const q = search.toLowerCase();
        donations = donations.filter(d =>
          d.title.toLowerCase().includes(q) ||
          d.donorName.toLowerCase().includes(q) ||
          d.pickupLocation.toLowerCase().includes(q) ||
          (d.description && d.description.toLowerCase().includes(q))
        );
      }

      if (urgency && urgency !== 'all') {
        const now = Date.now();
        if (urgency === 'soon') {
          // Expires in < 24 hrs and not expired yet
          donations = donations.filter(d => {
            const exp = new Date(d.expiryDateTime).getTime();
            return exp > now && exp - now <= 24 * 60 * 60 * 1000;
          });
        } else if (urgency === 'urgent') {
          // Expires in < 6 hrs
          donations = donations.filter(d => {
            const exp = new Date(d.expiryDateTime).getTime();
            return exp > now && exp - now <= 6 * 60 * 60 * 1000;
          });
        } else if (urgency === 'safe') {
          // > 24 hrs
          donations = donations.filter(d => {
            const exp = new Date(d.expiryDateTime).getTime();
            return exp - now > 24 * 60 * 60 * 1000;
          });
        }
      }

      res.status(200).json({
        success: true,
        count: donations.length,
        data: donations
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error retrieving donations', error: err.message });
    }
  },

  // GET /api/donations/:id
  getDonationById(req, res) {
    try {
      const donation = DonationModel.getById(req.params.id);
      if (!donation) {
        return res.status(404).json({ success: false, message: `Donation with ID ${req.params.id} not found.` });
      }
      res.status(200).json({ success: true, data: donation });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error retrieving donation', error: err.message });
    }
  },

  // POST /api/donations
  createDonation(req, res) {
    try {
      const { title, category, quantity, unit, pickupLocation, donorName, donorContact, expiryDateTime, description, dietary, storage } = req.body;

      if (!title || !quantity || !pickupLocation || !donorName || !donorContact || !expiryDateTime) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: title, quantity, pickupLocation, donorName, donorContact, expiryDateTime.'
        });
      }

      const qty = Number(quantity);
      let servings = req.body.estimatedServings || qty;
      if (!req.body.estimatedServings) {
        if (unit === 'kg') servings = Math.round(qty * 2.5);
        else if (unit === 'liters') servings = Math.round(qty * 3);
        else if (unit === 'boxes' || unit === 'packets') servings = Math.round(qty * 1.5);
      }

      const created = DonationModel.create({
        title,
        category: category || 'Cooked Meals',
        quantity: qty,
        unit: unit || 'meals',
        estimatedServings: servings,
        dietary: dietary || 'Vegetarian',
        storage: storage || 'Room Temperature',
        expiryDateTime,
        pickupLocation,
        donorName,
        donorContact,
        description: description || 'Fresh surplus food available for pickup and redistribution.'
      });

      res.status(201).json({
        success: true,
        message: 'Food donation listed successfully',
        data: created
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error creating donation', error: err.message });
    }
  },

  // PATCH /api/donations/:id/claim
  claimDonation(req, res) {
    try {
      const item = DonationModel.getById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Donation not found' });
      }

      if (item.status !== 'Available') {
        return res.status(400).json({ success: false, message: `Cannot claim donation: status is already '${item.status}'` });
      }

      const { ngoName, repName, notes } = req.body;
      const claimNotes = notes ? (repName ? `${notes} (Coordinated by ${repName})` : notes) : 'Claimed for community distribution';

      const updated = DonationModel.update(req.params.id, {
        status: 'Claimed',
        claimedBy: ngoName || 'Relief Partner NGO',
        claimedAt: new Date().toISOString(),
        claimNotes
      });

      res.status(200).json({
        success: true,
        message: 'Donation claimed successfully by NGO',
        data: updated
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error claiming donation', error: err.message });
    }
  },

  // PATCH /api/donations/:id/pickup
  pickupDonation(req, res) {
    try {
      const item = DonationModel.getById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Donation not found' });
      }

      const { volunteerName, notes } = req.body;
      const volunteer = volunteerName || 'Rahul Sharma (Volunteer)';

      const updated = DonationModel.update(req.params.id, {
        status: 'Picked Up',
        assignedVolunteer: volunteer,
        pickedUpAt: new Date().toISOString(),
        deliveryNotes: notes || `Picked up from ${item.donorName}. In transit to distribution destination.`
      });

      res.status(200).json({
        success: true,
        message: 'Donation marked as Picked Up / In Transit',
        data: updated
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error updating pickup', error: err.message });
    }
  },

  // PATCH /api/donations/:id/deliver
  deliverDonation(req, res) {
    try {
      const item = DonationModel.getById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Donation not found' });
      }

      const { notes } = req.body;

      const updated = DonationModel.update(req.params.id, {
        status: 'Delivered',
        deliveredAt: new Date().toISOString(),
        deliveryNotes: notes || `Successfully delivered and handed over to ${item.claimedBy || 'beneficiaries'}.`
      });

      res.status(200).json({
        success: true,
        message: 'Donation marked as Delivered',
        data: updated
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error marking delivery', error: err.message });
    }
  },

  // DELETE /api/donations/:id
  deleteDonation(req, res) {
    try {
      const item = DonationModel.getById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Donation not found' });
      }

      const deleted = DonationModel.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: `Donation ${req.params.id} cancelled/deleted successfully`,
        data: deleted
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error deleting donation', error: err.message });
    }
  },

  // POST /api/donations/reset
  resetDonations(req, res) {
    try {
      const fresh = DonationModel.reset();
      res.status(200).json({
        success: true,
        message: 'Database reset to initial sample seed records',
        count: fresh.length,
        data: fresh
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error resetting database', error: err.message });
    }
  },

  // GET /api/stats
  getStats(req, res) {
    try {
      const donations = DonationModel.getAll();
      const totalDonations = donations.length;
      const available = donations.filter(d => d.status === 'Available').length;
      const claimed = donations.filter(d => d.status === 'Claimed').length;
      const pickedUp = donations.filter(d => d.status === 'Picked Up').length;
      const delivered = donations.filter(d => d.status === 'Delivered').length;
      const expired = donations.filter(d => d.status === 'Expired').length;

      // Calculate total meals saved (from claimed, in-transit, delivered)
      let mealsSaved = 0;
      donations.forEach(d => {
        if (['Claimed', 'Picked Up', 'Delivered'].includes(d.status)) {
          mealsSaved += (d.estimatedServings || d.quantity || 0);
        }
      });

      // Calculate unique NGOs involved
      const ngos = new Set(donations.filter(d => d.claimedBy).map(d => d.claimedBy));

      res.status(200).json({
        success: true,
        data: {
          totalDonations,
          available,
          claimed,
          pickedUp,
          delivered,
          expired,
          mealsSaved,
          activeNgos: Math.max(ngos.size, 2)
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error calculating stats', error: err.message });
    }
  }
};

module.exports = donationController;
