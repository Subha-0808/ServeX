const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');

// Standard REST CRUD endpoints
router.get('/', donationController.getDonations);
router.post('/', donationController.createDonation);
router.get('/:id', donationController.getDonationById);
router.delete('/:id', donationController.deleteDonation);

// Specific workflow action endpoints
router.patch('/:id/claim', donationController.claimDonation);
router.patch('/:id/pickup', donationController.pickupDonation);
router.patch('/:id/deliver', donationController.deliverDonation);

// Database seed reset endpoint
router.post('/reset', donationController.resetDonations);

module.exports = router;
