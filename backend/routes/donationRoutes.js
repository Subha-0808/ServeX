const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { requireAuth, requireRoles } = require('../middleware/authMiddleware');

// Standard REST CRUD endpoints
// GET endpoints are public for browsing food surplus listings
router.get('/', donationController.getDonations);
router.get('/:id', donationController.getDonationById);

// Creation and deletion require Donor or Admin role
router.post('/', requireAuth, requireRoles(['Donor']), donationController.createDonation);
router.delete('/:id', requireAuth, requireRoles(['Donor']), donationController.deleteDonation);

// Specific workflow action endpoints with multi-role authorization
router.patch('/:id/claim', requireAuth, requireRoles(['NGO']), donationController.claimDonation);
router.patch('/:id/pickup', requireAuth, requireRoles(['Volunteer']), donationController.pickupDonation);
router.patch('/:id/deliver', requireAuth, requireRoles(['Volunteer']), donationController.deliverDonation);

// Database seed reset endpoint
router.post('/reset', donationController.resetDonations);

module.exports = router;
