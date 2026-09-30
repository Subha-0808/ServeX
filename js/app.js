/**
 * FoodShare - Surplus Food Donation and Distribution Platform
 * Core Application Logic (Vanilla JavaScript & LocalStorage)
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. Constants and Storage Keys
  // =========================================================================
  const STORAGE_KEYS = {
    DONATIONS: 'foodshare_donations_v1',
    USERS: 'foodshare_users_v1',
    CURRENT_ROLE: 'foodshare_active_role_v1'
  };

  const DEFAULT_DONOR = {
    name: 'Green Park Restaurant',
    contactPerson: 'Chef Anand Verma',
    phone: '+91 98765 43210',
    location: '12, MG Road, Central Market, Bengaluru'
  };

  const DEFAULT_NGO = {
    name: 'Hope Food Rescue NGO',
    repName: 'Sarah Jenkins',
    phone: '+91 98111 22334',
    zone: 'East City Zone & Slum Community Kitchens'
  };

  const DEFAULT_VOLUNTEER = {
    name: 'Rahul Sharma',
    vehicle: 'Cargo Scooter / Bike Box',
    phone: '+91 97234 56789'
  };

  // =========================================================================
  // 2. Initial Sample Dataset Generator (Relative Dates for Dynamic Demos)
  // =========================================================================
  function getSampleDonations() {
    const now = new Date();

    // Helper to calculate relative ISO string
    const addHours = (hours) => {
      const d = new Date(now.getTime() + hours * 60 * 60 * 1000);
      return d.toISOString();
    };

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
        expiryDateTime: addHours(6), // Expiring soon (< 24 hrs)
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
        expiryDateTime: addHours(18), // Expiring soon (< 24 hrs)
        pickupLocation: 'Artisan Bakers, Shop 4B, Indiranagar 100ft Rd',
        donorName: 'Artisan Bakers',
        donorContact: '+91 98222 33445',
        description: 'Fresh unsold artisan loaves, bread buns, and butter croissants packed at 8 PM closing.',
        status: 'Claimed',
        createdAt: addHours(-5),
        claimedBy: 'Hope Food Rescue NGO',
        claimedAt: addHours(-3),
        claimNotes: 'Allocated for distribution at East Slum Children Community Centre.',
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
        claimedBy: 'Annam Shelter & Relief Foundation',
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
        expiryDateTime: addHours(-4), // Expired 4 hours ago!
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

  function getSampleUsers() {
    return [
      { id: 'USR-01', name: 'Green Park Restaurant', role: 'Donor', email: 'donations@greenpark.in', phone: '+91 98765 43210', totalDonations: 18, status: 'Active' },
      { id: 'USR-02', name: 'Artisan Bakers', role: 'Donor', email: 'bakery@artisan.org', phone: '+91 98222 33445', totalDonations: 24, status: 'Active' },
      { id: 'USR-03', name: 'Hope Food Rescue NGO', role: 'NGO', email: 'contact@hopefood.org', phone: '+91 98111 22334', totalClaims: 32, status: 'Verified' },
      { id: 'USR-04', name: 'Annam Shelter Foundation', role: 'NGO', email: 'relief@annamshelter.in', phone: '+91 98450 11223', totalClaims: 41, status: 'Verified' },
      { id: 'USR-05', name: 'Rahul Sharma', role: 'Volunteer', email: 'rahul.s@foodshare.in', phone: '+91 97234 56789', completedDeliveries: 19, status: 'Active' },
      { id: 'USR-06', name: 'Priya Nair', role: 'Volunteer', email: 'priya.nair@foodshare.in', phone: '+91 97890 12345', completedDeliveries: 15, status: 'Active' }
    ];
  }

  // =========================================================================
  // 3. Application State & Storage Management
  // =========================================================================
  const State = {
    donations: [],
    users: [],
    activeRole: 'home', // 'home' | 'donor' | 'ngo' | 'volunteer' | 'admin'
    filters: {
      ngo: { category: 'all', urgency: 'all', search: '' },
      donor: { status: 'all' },
      admin: { search: '', status: 'all' }
    }
  };

  function initStorage() {
    try {
      const storedDonations = localStorage.getItem(STORAGE_KEYS.DONATIONS);
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const storedRole = localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE);

      if (!storedDonations) {
        State.donations = getSampleDonations();
        saveDonationsToStorage();
      } else {
        State.donations = JSON.parse(storedDonations);
      }

      if (!storedUsers) {
        State.users = getSampleUsers();
        saveUsersToStorage();
      } else {
        State.users = JSON.parse(storedUsers);
      }

      if (storedRole && ['home', 'donor', 'ngo', 'volunteer', 'admin'].includes(storedRole)) {
        State.activeRole = storedRole;
      }
    } catch (e) {
      console.warn('LocalStorage access issue, using in-memory state:', e);
      State.donations = getSampleDonations();
      State.users = getSampleUsers();
    }

    // Run expiry refresh across all listings on initialization
    refreshExpiryStatuses();
  }

  function saveDonationsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(State.donations));
    } catch (e) {
      console.error('Failed to write to LocalStorage:', e);
    }
  }

  function saveUsersToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(State.users));
    } catch (e) {
      console.error('Failed to save users:', e);
    }
  }

  function resetSampleData() {
    State.donations = getSampleDonations();
    State.users = getSampleUsers();
    saveDonationsToStorage();
    saveUsersToStorage();
    refreshExpiryStatuses();
    renderAllViews();
    showToast('Database reset to fresh sample records successfully!', 'success');
  }
  const resetToSampleData = resetSampleData;

  // =========================================================================
  // 4. Expiry Monitoring & Date Utilities
  // =========================================================================
  function getExpiryAnalysis(expiryDateTimeStr, currentStatus) {
    if (!expiryDateTimeStr) return { isExpired: false, isExpiringSoon: false, text: 'No expiry set' };

    const now = new Date();
    const expiry = new Date(expiryDateTimeStr);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) {
      const hoursAgo = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));
      return {
        isExpired: true,
        isExpiringSoon: false,
        text: hoursAgo <= 0 ? 'Expired just now' : `Expired ${hoursAgo} hr${hoursAgo > 1 ? 's' : ''} ago`
      };
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    const isExpiringSoon = diffHours < 24;
    let timeRemainingText = '';

    if (diffHours < 1) {
      timeRemainingText = `Expires in ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      timeRemainingText = `Expires in ${diffHours}h ${diffMins}m`;
    } else {
      const days = Math.floor(diffHours / 24);
      timeRemainingText = `Expires in ${days} day${days > 1 ? 's' : ''} (${diffHours % 24}h)`;
    }

    return {
      isExpired: false,
      isExpiringSoon: isExpiringSoon,
      text: timeRemainingText
    };
  }

  function refreshExpiryStatuses() {
    let changed = false;
    State.donations.forEach(donation => {
      const analysis = getExpiryAnalysis(donation.expiryDateTime, donation.status);
      // If food was Available but has expired in real time, transition to Expired
      if (analysis.isExpired && donation.status === 'Available') {
        donation.status = 'Expired';
        changed = true;
      }
    });
    if (changed) {
      saveDonationsToStorage();
    }
  }

  function formatDate(isoStr) {
    if (!isoStr) return 'N/A';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  }

  // =========================================================================
  // 5. Calculation & Statistics Utilities
  // =========================================================================
  function calculatePlatformStats() {
    refreshExpiryStatuses();

    const totalDonations = State.donations.length;
    const available = State.donations.filter(d => d.status === 'Available').length;
    const claimed = State.donations.filter(d => d.status === 'Claimed').length;
    const pickedUp = State.donations.filter(d => d.status === 'Picked Up').length;
    const delivered = State.donations.filter(d => d.status === 'Delivered').length;
    const expired = State.donations.filter(d => d.status === 'Expired').length;

    // Total estimated meals saved from completed and active donations (not expired)
    const validDonations = State.donations.filter(d => d.status !== 'Expired');
    const mealsSaved = validDonations.reduce((acc, curr) => {
      let meals = Number(curr.estimatedServings) || 0;
      if (!meals) {
        const qty = Number(curr.quantity) || 0;
        if (curr.unit === 'kg') meals = Math.round(qty * 2.5);
        else if (curr.unit === 'meals') meals = qty;
        else if (curr.unit === 'liters') meals = Math.round(qty * 3);
        else meals = Math.round(qty * 1.5);
      }
      return acc + meals;
    }, 0);

    // Approximate KG calculation
    const kgSaved = validDonations.reduce((acc, curr) => {
      const qty = Number(curr.quantity) || 0;
      if (curr.unit === 'kg') return acc + qty;
      if (curr.unit === 'meals') return acc + Math.round(qty * 0.4);
      if (curr.unit === 'liters') return acc + qty;
      return acc + Math.round(qty * 0.5);
    }, 0);

    return {
      totalDonations,
      available,
      claimed,
      pickedUp,
      delivered,
      expired,
      mealsSaved,
      kgSaved,
      activeNgos: State.users.filter(u => u.role === 'NGO').length,
      activeVolunteers: State.users.filter(u => u.role === 'Volunteer').length
    };
  }

  // =========================================================================
  // 6. UI Notification / Toast Helper
  // =========================================================================
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    } else {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      setTimeout(() => toast.remove(), 250);
    }, 4000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // =========================================================================
  // 7. Navigation & View Routing
  // =========================================================================
  function switchRole(targetRole) {
    const validRoles = ['home', 'donor', 'ngo', 'volunteer', 'admin'];
    if (!validRoles.includes(targetRole)) targetRole = 'home';

    State.activeRole = targetRole;
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, targetRole);
    } catch (e) {
      // noop
    }

    // Update Role Switcher Buttons
    document.querySelectorAll('.role-btn').forEach(btn => {
      const role = btn.dataset.role;
      if (role === targetRole) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Nav links
    document.querySelectorAll('.nav-link[data-nav-role]').forEach(link => {
      if (link.dataset.navRole === targetRole) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Toggle Content Sections
    document.querySelectorAll('.content-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const activeSection = document.getElementById(`section-${targetRole}`);
    if (activeSection) {
      activeSection.classList.add('active');
    }

    // Scroll to top cleanly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Render relevant view data
    renderAllViews();
  }

  // =========================================================================
  // 8. View Renderers
  // =========================================================================

  // 8.1 Landing / Homepage
  function renderHomeView() {
    const stats = calculatePlatformStats();

    // Update Stats on Landing Page
    const mealsEl = document.getElementById('homeStatMeals');
    const donationsEl = document.getElementById('homeStatDonations');
    const ngosEl = document.getElementById('homeStatNgos');
    const deliveredEl = document.getElementById('homeStatDelivered');

    if (mealsEl) mealsEl.textContent = stats.mealsSaved.toLocaleString();
    if (donationsEl) donationsEl.textContent = stats.totalDonations;
    if (ngosEl) ngosEl.textContent = stats.activeNgos;
    if (deliveredEl) deliveredEl.textContent = stats.delivered;

    // Mini Live Listings ticker on Hero
    const miniContainer = document.getElementById('heroLiveFeed');
    if (miniContainer) {
      const recentAvailable = State.donations
        .filter(d => d.status === 'Available' || d.status === 'Claimed')
        .slice(0, 3);

      if (recentAvailable.length === 0) {
        miniContainer.innerHTML = `<p style="font-size:0.85rem;color:var(--text-muted);padding:1rem;">All surplus food has been safely claimed and delivered!</p>`;
      } else {
        miniContainer.innerHTML = recentAvailable.map(item => {
          const analysis = getExpiryAnalysis(item.expiryDateTime, item.status);
          const isUrgent = analysis.isExpiringSoon;
          return `
            <div class="mini-listing-item" onclick="FoodShareApp.showDetailsModal('${item.id}')" style="cursor:pointer;" title="Click to view details">
              <div class="mini-item-info">
                <h4>${escapeHtml(item.title)}</h4>
                <p>📍 ${escapeHtml(item.donorName)} • ${item.quantity} ${item.unit}</p>
              </div>
              <div style="text-align:right;">
                <span class="badge ${getStatusBadgeClass(item.status)}">${item.status}</span>
                <div style="font-size:0.7rem; color:${isUrgent ? 'var(--status-expiring)' : 'var(--text-muted)'}; margin-top:0.25rem;">
                  ${analysis.text}
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Home Showcase Grid (Available Surplus)
    const showcaseGrid = document.getElementById('homeAvailableGrid');
    if (showcaseGrid) {
      const avail = State.donations.filter(d => d.status === 'Available').slice(0, 3);
      if (avail.length === 0) {
        showcaseGrid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3>No pending food surplus right now</h3>
            <p>Every listed meal has been claimed! Donors can click "Donate Food" to list new surplus meals.</p>
            <button class="btn btn-primary" onclick="FoodShareApp.switchRole('donor')">List Food Surplus</button>
          </div>
        `;
      } else {
        showcaseGrid.innerHTML = avail.map(item => renderFoodCardHtml(item, 'home')).join('');
      }
    }
  }

  // 8.2 Donor Dashboard
  function renderDonorView() {
    // Donor Stats
    const donorDonations = State.donations.filter(d => d.donorName.includes('Green Park') || d.donorContact === DEFAULT_DONOR.phone || true);
    const activeCount = State.donations.filter(d => d.status === 'Available' || d.status === 'Claimed').length;
    const deliveredCount = State.donations.filter(d => d.status === 'Delivered').length;
    const totalCount = State.donations.length;

    const statTotalEl = document.getElementById('donorTotalCount');
    const statActiveEl = document.getElementById('donorActiveCount');
    const statDeliveredEl = document.getElementById('donorDeliveredCount');

    if (statTotalEl) statTotalEl.textContent = totalCount;
    if (statActiveEl) statActiveEl.textContent = activeCount;
    if (statDeliveredEl) statDeliveredEl.textContent = deliveredCount;

    // Filter donor list
    const filterStatus = State.filters.donor.status;
    let list = [...State.donations];
    if (filterStatus !== 'all') {
      list = list.filter(d => d.status === filterStatus);
    }

    const container = document.getElementById('donorDonationsList');
    if (container) {
      if (list.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </div>
            <h3>No donations matching filter</h3>
            <p>Try switching status filters or use the form above to add your surplus food listing.</p>
          </div>
        `;
      } else {
        container.innerHTML = list.map(item => renderFoodCardHtml(item, 'donor')).join('');
      }
    }
  }

  // 8.3 NGO Dashboard
  function renderNgoView() {
    const stats = calculatePlatformStats();
    const ngoAvailEl = document.getElementById('ngoAvailCount');
    const ngoClaimedEl = document.getElementById('ngoClaimedCount');
    const ngoDeliveredEl = document.getElementById('ngoDeliveredCount');

    if (ngoAvailEl) ngoAvailEl.textContent = stats.available;
    if (ngoClaimedEl) ngoClaimedEl.textContent = stats.claimed + stats.pickedUp;
    if (ngoDeliveredEl) ngoDeliveredEl.textContent = stats.delivered;

    // Filter available food listings
    const { category, urgency, search } = State.filters.ngo;

    let availableItems = State.donations.filter(d => d.status === 'Available');

    if (category !== 'all') {
      availableItems = availableItems.filter(d => d.category.toLowerCase().includes(category.toLowerCase()));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      availableItems = availableItems.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.pickupLocation.toLowerCase().includes(q) ||
        d.donorName.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
      );
    }

    if (urgency === 'urgent') {
      availableItems = availableItems.filter(d => {
        const analysis = getExpiryAnalysis(d.expiryDateTime, d.status);
        return analysis.isExpiringSoon && !analysis.isExpired;
      });
    }

    const availableContainer = document.getElementById('ngoAvailableGrid');
    if (availableContainer) {
      if (availableItems.length === 0) {
        availableContainer.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <h3>No available donations found</h3>
            <p>There are no listings matching your current filter criteria or all food has been claimed. Try resetting your search filters.</p>
            <button class="btn btn-outline btn-sm" onclick="FoodShareApp.resetNgoFilters()">Clear Filters</button>
          </div>
        `;
      } else {
        availableContainer.innerHTML = availableItems.map(item => renderFoodCardHtml(item, 'ngo')).join('');
      }
    }

    // Render NGO Claimed Section
    const claimedList = State.donations.filter(d => d.status === 'Claimed' || d.status === 'Picked Up' || d.status === 'Delivered');
    const claimedContainer = document.getElementById('ngoClaimedList');
    if (claimedContainer) {
      if (claimedList.length === 0) {
        claimedContainer.innerHTML = `
          <div class="empty-state">
            <p style="color:var(--text-muted);">You have not claimed any food donations yet. Browse the available listings above and click "Claim Donation".</p>
          </div>
        `;
      } else {
        claimedContainer.innerHTML = claimedList.map(item => renderFoodCardHtml(item, 'ngo-claimed')).join('');
      }
    }
  }

  // 8.4 Volunteer Dashboard
  function renderVolunteerView() {
    const assignmentsPending = State.donations.filter(d => d.status === 'Claimed');
    const inTransit = State.donations.filter(d => d.status === 'Picked Up');
    const completed = State.donations.filter(d => d.status === 'Delivered');

    const statPendingEl = document.getElementById('volPendingCount');
    const statTransitEl = document.getElementById('volTransitCount');
    const statCompletedEl = document.getElementById('volCompletedCount');

    if (statPendingEl) statPendingEl.textContent = assignmentsPending.length;
    if (statTransitEl) statTransitEl.textContent = inTransit.length;
    if (statCompletedEl) statCompletedEl.textContent = completed.length;

    // Available Assignments (Claimed listings waiting for volunteer)
    const availTasksContainer = document.getElementById('volunteerAvailableTasks');
    if (availTasksContainer) {
      if (assignmentsPending.length === 0) {
        availTasksContainer.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3>No pending deliveries awaiting pickup</h3>
            <p>All claimed surplus donations have either been assigned or delivered. Great job keeping food moving!</p>
          </div>
        `;
      } else {
        availTasksContainer.innerHTML = assignmentsPending.map(item => renderFoodCardHtml(item, 'volunteer-avail')).join('');
      }
    }

    // In-Progress Pickups Container
    const inTransitContainer = document.getElementById('volunteerInTransitTasks');
    if (inTransitContainer) {
      if (inTransit.length === 0) {
        inTransitContainer.innerHTML = `
          <div class="empty-state" style="padding:2rem;">
            <p style="color:var(--text-muted);font-size:0.9rem;">You have no deliveries currently in transit. Accept an assignment above to start delivery coordination.</p>
          </div>
        `;
      } else {
        inTransitContainer.innerHTML = inTransit.map(item => renderFoodCardHtml(item, 'volunteer-transit')).join('');
      }
    }

    // Completed Deliveries History
    const completedContainer = document.getElementById('volunteerCompletedTasks');
    if (completedContainer) {
      if (completed.length === 0) {
        completedContainer.innerHTML = `<p style="color:var(--text-muted);padding:1rem;">No completed deliveries recorded yet.</p>`;
      } else {
        completedContainer.innerHTML = completed.map(item => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0.85rem 1rem; background:var(--bg-card); border:1px solid var(--border-light); border-radius:var(--radius-md); margin-bottom:0.75rem;">
            <div>
              <strong style="color:var(--text-main); font-size:0.95rem;">${escapeHtml(item.title)}</strong>
              <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.2rem;">
                Delivered to: <strong>${escapeHtml(item.claimedBy || 'Community Partner')}</strong> • Quantity: ${item.quantity} ${item.unit}
              </div>
            </div>
            <div style="text-align:right;">
              <span class="badge badge-delivered">Delivered</span>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.25rem;">
                ${item.deliveredAt ? formatDate(item.deliveredAt) : 'Recently'}
              </div>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // 8.5 Admin Dashboard
  function renderAdminView() {
    const stats = calculatePlatformStats();

    const elTotal = document.getElementById('adminTotalDonations');
    const elAvail = document.getElementById('adminAvailDonations');
    const elClaimed = document.getElementById('adminClaimedDonations');
    const elDelivered = document.getElementById('adminDeliveredDonations');
    const elExpired = document.getElementById('adminExpiredDonations');
    const elMeals = document.getElementById('adminMealsSaved');
    const elKg = document.getElementById('adminKgSaved');

    if (elTotal) elTotal.textContent = stats.totalDonations;
    if (elAvail) elAvail.textContent = stats.available;
    if (elClaimed) elClaimed.textContent = stats.claimed + stats.pickedUp;
    if (elDelivered) elDelivered.textContent = stats.delivered;
    if (elExpired) elExpired.textContent = stats.expired;
    if (elMeals) elMeals.textContent = stats.mealsSaved.toLocaleString();
    if (elKg) elKg.textContent = `${stats.kgSaved} kg`;

    // Filter Admin Donations Table
    const { search, status } = State.filters.admin;
    let list = [...State.donations];

    if (status !== 'all') {
      list = list.filter(d => d.status === status);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.id.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.donorName.toLowerCase().includes(q) ||
        (d.claimedBy && d.claimedBy.toLowerCase().includes(q))
      );
    }

    const tableBody = document.getElementById('adminDonationsTableBody');
    if (tableBody) {
      if (list.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted);">No records found matching filters.</td></tr>`;
      } else {
        tableBody.innerHTML = list.map(item => {
          const analysis = getExpiryAnalysis(item.expiryDateTime, item.status);
          return `
            <tr>
              <td><code>${item.id}</code></td>
              <td>
                <strong>${escapeHtml(item.title)}</strong>
                <div style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(item.category)} • ${item.quantity} ${item.unit}</div>
              </td>
              <td>${escapeHtml(item.donorName)}</td>
              <td>
                <span class="badge ${getStatusBadgeClass(item.status)}">${item.status}</span>
              </td>
              <td>
                <span style="font-size:0.8rem;color:${analysis.isExpired ? 'var(--status-expired)' : (analysis.isExpiringSoon ? 'var(--status-expiring)' : 'inherit')}; font-weight:600;">
                  ${analysis.text}
                </span>
              </td>
              <td>${escapeHtml(item.claimedBy || '—')}</td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-outline btn-sm" onclick="FoodShareApp.showDetailsModal('${item.id}')" title="View Details">
                    View
                  </button>
                  <button class="btn btn-outline btn-sm" style="color:var(--status-expired); border-color:#fecaca;" onclick="FoodShareApp.promptDeleteDonation('${item.id}')" title="Delete">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Users Directory Table
    const userTableBody = document.getElementById('adminUsersTableBody');
    if (userTableBody) {
      userTableBody.innerHTML = State.users.map(u => `
        <tr>
          <td><strong>${escapeHtml(u.name)}</strong></td>
          <td><span class="badge badge-category">${u.role}</span></td>
          <td>${escapeHtml(u.email)}<br><span style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(u.phone)}</span></td>
          <td>
            ${u.totalDonations ? `${u.totalDonations} Donations` : ''}
            ${u.totalClaims ? `${u.totalClaims} Claims` : ''}
            ${u.completedDeliveries ? `${u.completedDeliveries} Deliveries` : ''}
          </td>
          <td><span class="badge badge-available">${u.status}</span></td>
        </tr>
      `).join('');
    }
  }

  function renderAllViews() {
    renderHomeView();
    renderDonorView();
    renderNgoView();
    renderVolunteerView();
    renderAdminView();
  }

  // =========================================================================
  // 9. Card HTML Generator Component
  // =========================================================================
  function renderFoodCardHtml(item, context = 'default') {
    const analysis = getExpiryAnalysis(item.expiryDateTime, item.status);
    const badgeClass = getStatusBadgeClass(item.status);

    // Dietary Badge
    let dietBadge = '';
    if (item.dietary === 'Vegetarian') dietBadge = '<span class="badge badge-diet badge-veg">🌿 Veg</span>';
    else if (item.dietary === 'Non-Vegetarian') dietBadge = '<span class="badge badge-diet badge-nonveg">🍗 Non-Veg</span>';
    else if (item.dietary === 'Vegan') dietBadge = '<span class="badge badge-diet badge-vegan">🌱 Vegan</span>';

    // Expiry Notice Box
    let expiryAlertBox = '';
    if (analysis.isExpired) {
      expiryAlertBox = `
        <div class="expiry-alert-tag expired">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          ${analysis.text} • Not eligible for claim
        </div>
      `;
    } else if (analysis.isExpiringSoon) {
      expiryAlertBox = `
        <div class="expiry-alert-tag warning">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ⚠️ Expiring Soon! (${analysis.text})
        </div>
      `;
    }

    // Action Buttons based on Context & Status
    let actionButtons = '';

    if (context === 'home') {
      actionButtons = `
        <button class="btn btn-outline btn-sm" onclick="FoodShareApp.showDetailsModal('${item.id}')">View Details</button>
        <button class="btn btn-primary btn-sm" onclick="FoodShareApp.switchRole('ngo'); FoodShareApp.openClaimModal('${item.id}')">Claim Food</button>
      `;
    } else if (context === 'donor') {
      actionButtons = `
        <button class="btn btn-outline btn-sm" onclick="FoodShareApp.showDetailsModal('${item.id}')">View Details</button>
        ${item.status === 'Available' ? `
          <button class="btn btn-outline btn-sm" style="color:var(--status-expired); border-color:#fecaca;" onclick="FoodShareApp.cancelDonation('${item.id}')">Cancel</button>
        ` : ''}
      `;
    } else if (context === 'ngo') {
      const canClaim = item.status === 'Available' && !analysis.isExpired;
      actionButtons = `
        <button class="btn btn-outline btn-sm" onclick="FoodShareApp.showDetailsModal('${item.id}')">Details</button>
        <button class="btn btn-primary btn-sm" ${!canClaim ? 'disabled' : ''} onclick="FoodShareApp.openClaimModal('${item.id}')">
          ${analysis.isExpired ? 'Expired' : 'Claim for NGO'}
        </button>
      `;
    } else if (context === 'ngo-claimed') {
      actionButtons = `
        <button class="btn btn-outline btn-sm" onclick="FoodShareApp.showDetailsModal('${item.id}')">Tracking Details</button>
        ${item.status === 'Claimed' ? `
          <span style="font-size:0.75rem; color:var(--status-claimed); display:inline-flex; align-items:center; gap:4px; font-weight:600;">
            ⏳ Awaiting Volunteer
          </span>
        ` : ''}
        ${item.status === 'Picked Up' ? `
          <span style="font-size:0.75rem; color:var(--status-transit); display:inline-flex; align-items:center; gap:4px; font-weight:600;">
            🚚 Volunteer in transit
          </span>
        ` : ''}
        ${item.status === 'Delivered' ? `
          <span style="font-size:0.75rem; color:var(--status-delivered); font-weight:700;">
            ✅ Completed
          </span>
        ` : ''}
      `;
    } else if (context === 'volunteer-avail') {
      actionButtons = `
        <button class="btn btn-outline btn-sm" onclick="FoodShareApp.showDetailsModal('${item.id}')">Details</button>
        <button class="btn btn-primary btn-sm" onclick="FoodShareApp.acceptDelivery('${item.id}')">Accept Task</button>
      `;
    } else if (context === 'volunteer-transit') {
      actionButtons = `
        <button class="btn btn-outline btn-sm" onclick="FoodShareApp.showDetailsModal('${item.id}')">Details</button>
        ${!item.pickedUpAt ? `
          <button class="btn btn-warning btn-sm" onclick="FoodShareApp.markAsPickedUp('${item.id}')">Mark Picked Up</button>
        ` : `
          <button class="btn btn-success btn-sm" onclick="FoodShareApp.markAsDelivered('${item.id}')">Mark Delivered</button>
        `}
      `;
    }

    return `
      <div class="donation-card" data-id="${item.id}">
        <div>
          <div class="card-top-bar">
            <span class="badge badge-category">${escapeHtml(item.category)}</span>
            <span class="badge ${badgeClass}"><span class="badge-dot"></span>${item.status}</span>
          </div>

          <div class="card-title-group">
            <h3>${escapeHtml(item.title)}</h3>
          </div>

          <div class="card-badges-row">
            ${dietBadge}
            <span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:700;">
              📦 ${item.quantity} ${item.unit} (~${item.estimatedServings} meals)
            </span>
          </div>

          ${expiryAlertBox}

          <div class="card-meta-list">
            <div class="card-meta-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span><strong>Expiry:</strong> ${formatDate(item.expiryDateTime)}</span>
            </div>
            <div class="card-meta-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span class="truncate" title="${escapeHtml(item.pickupLocation)}"><strong>Location:</strong> ${escapeHtml(item.pickupLocation)}</span>
            </div>
            <div class="card-meta-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span><strong>Donor:</strong> ${escapeHtml(item.donorName)}</span>
            </div>
          </div>
        </div>

        <div class="card-action-bar">
          ${actionButtons}
        </div>
      </div>
    `;
  }

  function getStatusBadgeClass(status) {
    switch (status) {
      case 'Available': return 'badge-available';
      case 'Claimed': return 'badge-claimed';
      case 'Picked Up': return 'badge-picked-up';
      case 'Delivered': return 'badge-delivered';
      case 'Expired': return 'badge-expired';
      default: return 'badge-category';
    }
  }

  // =========================================================================
  // 10. Donation Actions & Workflow Logic
  // =========================================================================

  // Add Donation from Form
  function handleAddDonationForm(e) {
    e.preventDefault();

    const form = e.target;
    let isValid = true;

    // Field references
    const titleInput = form.foodTitle;
    const categoryInput = form.foodCategory;
    const quantityInput = form.foodQuantity;
    const unitInput = form.foodUnit;
    const expiryInput = form.foodExpiry;
    const locationInput = form.foodLocation;
    const donorNameInput = form.donorName;
    const donorContactInput = form.donorContact;
    const descriptionInput = form.foodDescription;
    const dietaryInput = form.foodDietary;
    const storageInput = form.foodStorage;

    // Validation checks
    function validateField(input, condition, errorMsg) {
      const parent = input.closest('.form-group');
      const errEl = parent ? parent.querySelector('.invalid-feedback') : null;
      if (!condition) {
        input.classList.add('is-invalid');
        if (errEl) errEl.textContent = errorMsg;
        isValid = false;
      } else {
        input.classList.remove('is-invalid');
      }
    }

    validateField(titleInput, titleInput.value.trim().length >= 3, 'Please enter a clear food item name (at least 3 chars).');
    validateField(categoryInput, categoryInput.value !== '', 'Please select a food category.');
    validateField(quantityInput, Number(quantityInput.value) > 0, 'Quantity must be greater than 0.');
    validateField(unitInput, unitInput.value !== '', 'Please select a measurement unit.');
    validateField(expiryInput, expiryInput.value !== '', 'Expiry date and time is required.');

    // Expiry must be in the future
    if (expiryInput.value) {
      const selectedExpiry = new Date(expiryInput.value);
      const now = new Date();
      validateField(expiryInput, selectedExpiry > now, 'Expiry date and time must be in the future.');
    }

    validateField(locationInput, locationInput.value.trim().length >= 5, 'Please provide an accurate pickup address.');
    validateField(donorNameInput, donorNameInput.value.trim().length >= 2, 'Donor name / establishment is required.');
    validateField(donorContactInput, donorContactInput.value.trim().length >= 7, 'Contact phone number is required.');

    if (!isValid) {
      showToast('Please correct the highlighted form errors before submitting.', 'error');
      return;
    }

    // Generate unique ID: FS-(highest + 1)
    let nextNum = 1001;
    State.donations.forEach(d => {
      const num = parseInt(d.id.replace('FS-', ''), 10);
      if (!isNaN(num) && num >= nextNum) {
        nextNum = num + 1;
      }
    });
    const newId = `FS-${nextNum}`;

    // Estimated servings logic
    const qty = Number(quantityInput.value);
    const unit = unitInput.value;
    let servings = qty;
    if (unit === 'kg') servings = Math.round(qty * 2.5);
    else if (unit === 'liters') servings = Math.round(qty * 3);
    else if (unit === 'boxes' || unit === 'packets') servings = Math.round(qty * 1.5);

    const newDonation = {
      id: newId,
      title: titleInput.value.trim(),
      category: categoryInput.value,
      quantity: qty,
      unit: unit,
      estimatedServings: servings,
      dietary: dietaryInput.value || 'Vegetarian',
      storage: storageInput.value || 'Room Temperature',
      expiryDateTime: new Date(expiryInput.value).toISOString(),
      pickupLocation: locationInput.value.trim(),
      donorName: donorNameInput.value.trim(),
      donorContact: donorContactInput.value.trim(),
      description: descriptionInput.value.trim() || 'Fresh surplus food available for pickup and redistribution.',
      status: 'Available',
      createdAt: new Date().toISOString(),
      claimedBy: null,
      claimedAt: null,
      assignedVolunteer: null,
      pickedUpAt: null,
      deliveredAt: null,
      deliveryNotes: null
    };

    // Prepend to top of array
    State.donations.unshift(newDonation);
    saveDonationsToStorage();

    // Reset form
    form.reset();
    setDefaultExpiryTime();

    renderAllViews();
    showToast(`Donation "${newDonation.title}" listed successfully with ID ${newId}!`, 'success');
  }

  // Set default expiry date input to current time + 12 hours
  function setDefaultExpiryTime() {
    const expiryInput = document.getElementById('foodExpiry');
    if (!expiryInput) return;

    const future = new Date(Date.now() + 12 * 60 * 60 * 1000);
    // Format to YYYY-MM-DDTHH:mm
    const year = future.getFullYear();
    const month = String(future.getMonth() + 1).padStart(2, '0');
    const day = String(future.getDate()).padStart(2, '0');
    const hours = String(future.getHours()).padStart(2, '0');
    const minutes = String(future.getMinutes()).padStart(2, '0');

    expiryInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;

    // Set min to current time
    const now = new Date();
    const minMonth = String(now.getMonth() + 1).padStart(2, '0');
    const minDay = String(now.getDate()).padStart(2, '0');
    const minHours = String(now.getHours()).padStart(2, '0');
    const minMinutes = String(now.getMinutes()).padStart(2, '0');
    expiryInput.min = `${now.getFullYear()}-${minMonth}-${minDay}T${minHours}:${minMinutes}`;
  }

  // Claim Donation (NGO Workflow)
  function openClaimModal(donationId) {
    const item = State.donations.find(d => d.id === donationId);
    if (!item) return;

    const analysis = getExpiryAnalysis(item.expiryDateTime, item.status);
    if (analysis.isExpired) {
      showToast('This donation has expired and cannot be claimed.', 'error');
      return;
    }

    if (item.status !== 'Available') {
      showToast(`This food listing is already ${item.status}.`, 'warning');
      return;
    }

    const modalBody = document.getElementById('claimModalBody');
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="background:var(--bg-subtle); padding:1rem; border-radius:var(--radius-md); margin-bottom:1rem;">
          <h4 style="font-size:1.1rem; color:var(--text-main); margin-bottom:0.35rem;">${escapeHtml(item.title)}</h4>
          <p style="font-size:0.85rem; color:var(--text-muted);">
            📍 <strong>Pickup:</strong> ${escapeHtml(item.pickupLocation)}<br>
            📦 <strong>Quantity:</strong> ${item.quantity} ${item.unit} (~${item.estimatedServings} servings)<br>
            ⏰ <strong>Expiry:</strong> ${formatDate(item.expiryDateTime)}
          </p>
        </div>

        <form id="claimSubmitForm" onsubmit="FoodShareApp.confirmClaim(event, '${item.id}')">
          <div class="form-group" style="margin-bottom:1rem;">
            <label>NGO Organization Name <span class="required">*</span></label>
            <input type="text" id="claimNgoName" class="form-control" value="${escapeHtml(DEFAULT_NGO.name)}" required>
          </div>
          <div class="form-group" style="margin-bottom:1rem;">
            <label>Representative / Coordinator Name <span class="required">*</span></label>
            <input type="text" id="claimRepName" class="form-control" value="${escapeHtml(DEFAULT_NGO.repName)}" required>
          </div>
          <div class="form-group" style="margin-bottom:1rem;">
            <label>Distribution Target / Community Note <span class="required">*</span></label>
            <input type="text" id="claimNotes" class="form-control" placeholder="e.g. Slum community kitchen, Night shelter, Orphanage" value="Distribution to Community Feeding Centre" required>
          </div>
          <div class="form-group" style="margin-bottom:1.5rem;">
            <label>Estimated Beneficiaries Count</label>
            <input type="number" id="claimBeneficiaries" class="form-control" value="${item.estimatedServings}">
          </div>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
            <button type="button" class="btn btn-outline" onclick="FoodShareApp.closeModal('claimModal')">Cancel</button>
            <button type="submit" class="btn btn-primary">Confirm Food Claim</button>
          </div>
        </form>
      `;
    }

    openModal('claimModal');
  }

  function confirmClaim(e, donationId) {
    e.preventDefault();
    const item = State.donations.find(d => d.id === donationId);
    if (!item) return;

    const ngoName = document.getElementById('claimNgoName').value.trim();
    const repName = document.getElementById('claimRepName').value.trim();
    const notes = document.getElementById('claimNotes').value.trim();

    item.status = 'Claimed';
    item.claimedBy = ngoName || DEFAULT_NGO.name;
    item.claimedAt = new Date().toISOString();
    item.claimNotes = `${notes} (Coordinated by ${repName})`;

    saveDonationsToStorage();
    closeModal('claimModal');
    renderAllViews();

    showToast(`Donation ${item.id} claimed! Volunteer notification triggered for pickup coordination.`, 'success');
  }

  // Volunteer Accepts Task
  function acceptDelivery(donationId) {
    const item = State.donations.find(d => d.id === donationId);
    if (!item) return;

    item.assignedVolunteer = DEFAULT_VOLUNTEER.name;
    item.status = 'Picked Up'; // or assigned -> transit
    item.pickedUpAt = new Date().toISOString();
    item.deliveryNotes = `Accepted by volunteer ${DEFAULT_VOLUNTEER.name}. In transit for delivery.`;

    saveDonationsToStorage();
    renderAllViews();
    showToast(`Delivery assignment accepted! Food marked In-Transit.`, 'info');
  }

  // Mark Picked Up
  function markAsPickedUp(donationId) {
    const item = State.donations.find(d => d.id === donationId);
    if (!item) return;

    item.status = 'Picked Up';
    item.pickedUpAt = new Date().toISOString();
    item.deliveryNotes = `Picked up from ${item.donorName}. In transit to destination.`;

    saveDonationsToStorage();
    renderAllViews();
    showToast(`Donation ${item.id} status updated to Picked Up!`, 'info');
  }

  // Mark Delivered
  function markAsDelivered(donationId) {
    const item = State.donations.find(d => d.id === donationId);
    if (!item) return;

    item.status = 'Delivered';
    item.deliveredAt = new Date().toISOString();
    item.deliveryNotes = `Successfully delivered and handed over to ${item.claimedBy || 'NGO'}.`;

    saveDonationsToStorage();
    renderAllViews();
    showToast(`Great work! Donation ${item.id} marked as Delivered!`, 'success');
  }

  // Donor cancel donation
  function cancelDonation(donationId) {
    if (!confirm('Are you sure you want to cancel this surplus food listing?')) return;

    const item = State.donations.find(d => d.id === donationId);
    if (!item) return;

    if (item.status !== 'Available') {
      showToast('Cannot cancel a donation that has already been claimed or processed.', 'warning');
      return;
    }

    State.donations = State.donations.filter(d => d.id !== donationId);
    saveDonationsToStorage();
    renderAllViews();
    showToast(`Donation listing ${donationId} has been cancelled.`, 'info');
  }

  // Admin Prompt Delete
  function promptDeleteDonation(donationId) {
    if (confirm(`Admin Action: Are you sure you want to permanently delete record ${donationId}?`)) {
      State.donations = State.donations.filter(d => d.id !== donationId);
      saveDonationsToStorage();
      renderAllViews();
      showToast(`Record ${donationId} deleted from platform database.`, 'info');
    }
  }

  // =========================================================================
  // 11. Details Modal Component
  // =========================================================================
  function showDetailsModal(donationId) {
    const item = State.donations.find(d => d.id === donationId);
    if (!item) return;

    const analysis = getExpiryAnalysis(item.expiryDateTime, item.status);
    const modalBody = document.getElementById('detailsModalBody');

    // Build timeline indicators
    const isAvailable = true;
    const isClaimed = ['Claimed', 'Picked Up', 'Delivered'].includes(item.status);
    const isPickedUp = ['Picked Up', 'Delivered'].includes(item.status);
    const isDelivered = item.status === 'Delivered';

    modalBody.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
        <div>
          <span class="badge ${getStatusBadgeClass(item.status)}">${item.status}</span>
          <span class="badge badge-category" style="margin-left:0.4rem;">${escapeHtml(item.category)}</span>
          <h3 style="font-size:1.4rem; font-weight:800; color:var(--text-main); margin-top:0.4rem;">${escapeHtml(item.title)}</h3>
          <p style="font-size:0.8rem; color:var(--text-muted);">Listing ID: <code>${item.id}</code> • Listed on ${formatDate(item.createdAt)}</p>
        </div>
      </div>

      <div style="background:var(--bg-subtle); padding:1rem; border-radius:var(--radius-md); font-size:0.9rem; line-height:1.6;">
        <p style="margin-bottom:0.5rem;"><strong>Description:</strong> ${escapeHtml(item.description)}</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.85rem; margin-top:0.75rem;">
          <div>📦 <strong>Quantity:</strong> ${item.quantity} ${item.unit}</div>
          <div>🍽️ <strong>Servings:</strong> ~${item.estimatedServings} meals</div>
          <div>🌿 <strong>Dietary:</strong> ${escapeHtml(item.dietary || 'Vegetarian')}</div>
          <div>❄️ <strong>Storage:</strong> ${escapeHtml(item.storage || 'Standard')}</div>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:0.75rem; font-size:0.88rem; border-top:1px solid var(--border-light); padding-top:1rem;">
        <div>
          <strong>📍 Pickup Address:</strong>
          <p style="color:var(--text-muted); margin-top:0.2rem;">${escapeHtml(item.pickupLocation)}</p>
        </div>
        <div>
          <strong>👤 Donor Contact:</strong>
          <p style="color:var(--text-muted); margin-top:0.2rem;">${escapeHtml(item.donorName)} • ${escapeHtml(item.donorContact)}</p>
        </div>
        <div>
          <strong>⏰ Expiry Schedule:</strong>
          <p style="color:${analysis.isExpired ? 'var(--status-expired)' : 'var(--text-muted)'}; margin-top:0.2rem;">
            ${formatDate(item.expiryDateTime)} (${analysis.text})
          </p>
        </div>
      </div>

      <div style="border-top:1px solid var(--border-light); padding-top:1rem;">
        <h4 style="font-size:0.95rem; font-weight:700; margin-bottom:1rem;">Distribution Workflow Pipeline</h4>
        <div class="timeline">
          <div class="timeline-step ${isAvailable ? 'completed' : ''}">
            <div class="timeline-step-dot"></div>
            <h5>1. Donation Listed</h5>
            <p>${formatDate(item.createdAt)} by ${escapeHtml(item.donorName)}</p>
          </div>
          <div class="timeline-step ${isClaimed ? 'completed' : ''}">
            <div class="timeline-step-dot"></div>
            <h5>2. Claimed by NGO</h5>
            <p>${item.claimedBy ? `${escapeHtml(item.claimedBy)} (${formatDate(item.claimedAt)})` : 'Awaiting NGO claim'}</p>
            ${item.claimNotes ? `<p style="font-style:italic; font-size:0.75rem;">Note: ${escapeHtml(item.claimNotes)}</p>` : ''}
          </div>
          <div class="timeline-step ${isPickedUp ? 'completed' : ''}">
            <div class="timeline-step-dot"></div>
            <h5>3. Volunteer Pickup</h5>
            <p>${item.pickedUpAt ? `Picked up by ${item.assignedVolunteer || 'Volunteer'} (${formatDate(item.pickedUpAt)})` : 'Pending pickup coordination'}</p>
          </div>
          <div class="timeline-step ${isDelivered ? 'completed' : ''}">
            <div class="timeline-step-dot"></div>
            <h5>4. Delivered & Distributed</h5>
            <p>${item.deliveredAt ? `Safely delivered to beneficiaries (${formatDate(item.deliveredAt)})` : 'In distribution queue'}</p>
          </div>
        </div>
      </div>
    `;

    openModal('detailsModal');
  }

  // =========================================================================
  // 12. Modal Utility Helpers
  // =========================================================================
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    if (modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove('active');
    } else {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    }
    document.body.style.overflow = '';
  }

  // =========================================================================
  // 13. Event Listeners & Filter Handlers
  // =========================================================================
  function setupEventListeners() {
    // Role Switching Buttons
    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.dataset.role;
        switchRole(role);
      });
    });

    // Nav Links
    document.querySelectorAll('.nav-link[data-nav-role]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const role = link.dataset.navRole;
        switchRole(role);
      });
    });

    // Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    if (mobileBtn && mainNav) {
      mobileBtn.addEventListener('click', () => {
        mainNav.classList.toggle('show-mobile');
      });
    }

    // Donation Form Submit
    const donationForm = document.getElementById('donorForm');
    if (donationForm) {
      donationForm.addEventListener('submit', handleAddDonationForm);
    }

    // NGO Search and Filters
    const ngoSearchInput = document.getElementById('ngoSearchInput');
    const ngoCatSelect = document.getElementById('ngoCategorySelect');
    const ngoUrgencySelect = document.getElementById('ngoUrgencySelect');

    if (ngoSearchInput) {
      ngoSearchInput.addEventListener('input', (e) => {
        State.filters.ngo.search = e.target.value;
        renderNgoView();
      });
    }
    if (ngoCatSelect) {
      ngoCatSelect.addEventListener('change', (e) => {
        State.filters.ngo.category = e.target.value;
        renderNgoView();
      });
    }
    if (ngoUrgencySelect) {
      ngoUrgencySelect.addEventListener('change', (e) => {
        State.filters.ngo.urgency = e.target.value;
        renderNgoView();
      });
    }

    // Donor Filter Tabs
    document.querySelectorAll('.donor-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.donor-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        State.filters.donor.status = btn.dataset.status;
        renderDonorView();
      });
    });

    // Admin Filter Controls
    const adminSearchInput = document.getElementById('adminSearchInput');
    const adminStatusSelect = document.getElementById('adminStatusSelect');

    if (adminSearchInput) {
      adminSearchInput.addEventListener('input', (e) => {
        State.filters.admin.search = e.target.value;
        renderAdminView();
      });
    }
    if (adminStatusSelect) {
      adminStatusSelect.addEventListener('change', (e) => {
        State.filters.admin.status = e.target.value;
        renderAdminView();
      });
    }

    // Reset Sample Data Button
    const resetBtn = document.getElementById('resetDataBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset platform data? This will restore the default sample listings, NGO claims, and volunteer deliveries for demonstration.')) {
          resetToSampleData();
        }
      });
    }

    // Close Modals on click outside
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal.id);
        }
      });
    });

    // Keyboard ESC to close modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });

    // Hash navigation support (e.g. #donor, #ngo, #volunteer, #admin)
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'donor', 'ngo', 'volunteer', 'admin'].includes(hash)) {
        switchRole(hash);
      }
    });
  }

  function resetNgoFilters() {
    State.filters.ngo = { category: 'all', urgency: 'all', search: '' };
    const searchInp = document.getElementById('ngoSearchInput');
    const catSel = document.getElementById('ngoCategorySelect');
    const urgSel = document.getElementById('ngoUrgencySelect');

    if (searchInp) searchInp.value = '';
    if (catSel) catSel.value = 'all';
    if (urgSel) urgSel.value = 'all';

    renderNgoView();
  }

  // =========================================================================
  // 14. Initialization
  // =========================================================================
  function init() {
    initStorage();
    setupEventListeners();
    setDefaultExpiryTime();

    // Check initial hash
    const initialHash = window.location.hash.replace('#', '');
    if (['home', 'donor', 'ngo', 'volunteer', 'admin'].includes(initialHash)) {
      switchRole(initialHash);
    } else {
      switchRole(State.activeRole || 'home');
    }

    // Periodic expiry checking every 60 seconds
    setInterval(() => {
      refreshExpiryStatuses();
      renderAllViews();
    }, 60000);
  }

  // Export public interface for inline event triggers
  window.FoodShareApp = {
    switchRole,
    showDetailsModal,
    openClaimModal,
    confirmClaim,
    acceptDelivery,
    markAsPickedUp,
    markAsDelivered,
    cancelDonation,
    promptDeleteDonation,
    resetSampleData,
    resetNgoFilters,
    closeModal
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
