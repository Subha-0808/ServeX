async function runTests() {
  const BASE = 'http://localhost:5000/api';
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 0. Reset database to initial seed data before tests run
    await fetch(`${BASE}/donations/reset`, { method: 'POST' });

    // 1. Health Check
    const health = await fetch(`${BASE}/health`).then(r => r.json());
    assert(health.status === 'healthy', 'Health check returns healthy');

    // 2. Login as Priya Nair (Volunteer + Donor)
    const loginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'priya.nair@foodshare.in', password: 'vol123' })
    }).then(r => r.json());
    assert(loginRes.success && loginRes.roles.includes('Volunteer') && loginRes.roles.includes('Donor'),
      'Priya Nair can login with multi-roles: Volunteer + Donor');

    const priyaId = loginRes.user.id;
    const priyaToken = loginRes.token;

    // 3. Unauthorized access check: Priya (Volunteer + Donor) tries to claim a donation (NGO only)
    const unauthorizedClaim = await fetch(`${BASE}/donations/FS-1001/claim`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${priyaToken}`,
        'x-user-id': priyaId
      },
      body: JSON.stringify({ ngoName: 'Fake NGO', notes: 'Unauthorized attempt' })
    });
    assert(unauthorizedClaim.status === 403, `Priya is denied NGO claim with 403 Forbidden (got ${unauthorizedClaim.status})`);

    // 4. Authorized access check: Priya (Volunteer) CAN pick up a claimed donation (FS-1002)
    const authorizedPickup = await fetch(`${BASE}/donations/FS-1002/pickup`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': priyaId
      },
      body: JSON.stringify({ volunteerName: 'Priya Nair', notes: 'Picked up on scooter' })
    }).then(r => r.json());
    assert(authorizedPickup.success === true, 'Priya (Volunteer role) successfully marks pickup');

    // 5. Authorized access check: Priya (Donor role) CAN list a new donation
    const authorizedCreate = await fetch(`${BASE}/donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': priyaId
      },
      body: JSON.stringify({
        title: '30 Sandwiches & Juices',
        category: 'Cooked Meals',
        quantity: 30,
        unit: 'meals',
        pickupLocation: 'Priya Kitchen, Indiranagar',
        donorName: 'Priya Nair',
        donorContact: '+91 97890 12345',
        expiryDateTime: new Date(Date.now() + 10 * 3600 * 1000).toISOString()
      })
    }).then(r => r.json());
    assert(authorizedCreate.success === true, 'Priya (Donor role) successfully creates a donation');

    // 6. Test Safe Add-Role: Priya adds 'NGO' role to her existing account
    const addRoleRes = await fetch(`${BASE}/auth/add-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': priyaId
      },
      body: JSON.stringify({ role: 'NGO' })
    }).then(r => r.json());
    assert(addRoleRes.success && addRoleRes.roles.includes('NGO') && addRoleRes.roles.includes('Volunteer') && addRoleRes.roles.includes('Donor'),
      'Priya can add NGO role without creating a duplicate account');

    // 7. Security: Verify regular user CANNOT add 'Admin' role
    const adminAttempt = await fetch(`${BASE}/auth/add-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': priyaId
      },
      body: JSON.stringify({ role: 'Admin' })
    });
    assert(adminAttempt.status === 400 || adminAttempt.status === 403, 'Self-assigning Admin role is strictly blocked');

    // 8. Register a new user with multiple roles (Donor + Volunteer)
    const regRes = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test MultiUser',
        email: `test-${Date.now()}@foodshare.in`,
        phone: '+91 99999 11111',
        password: 'testpassword',
        roles: ['Donor', 'Volunteer']
      })
    }).then(r => r.json());
    assert(regRes.success && regRes.roles.length === 2 && regRes.roles.includes('Donor') && regRes.roles.includes('Volunteer'),
      'Registration with multiple roles succeeds and assigns both roles');

    // 9. Unauthenticated request without headers is blocked on protected routes
    const unauthCreate = await fetch(`${BASE}/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Hacked Donation', quantity: 10, pickupLocation: 'X', donorName: 'X', donorContact: 'X', expiryDateTime: new Date().toISOString() })
    });
    assert(unauthCreate.status === 401, `Unauthenticated POST /donations rejected with 401 (got ${unauthCreate.status})`);

    // 10. Admin login and permissions check
    const adminLogin = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@foodshare.in', password: 'admin123' })
    }).then(r => r.json());
    assert(adminLogin.success && adminLogin.roles.includes('Admin'),
      'Admin account (FoodShare Administrator) can login and possesses Admin role');

    // Reset database back to clean seed
    await fetch(`${BASE}/donations/reset`, { method: 'POST' });

    console.log(`\n================================`);
    console.log(`TOTAL: ${passed} Passed, ${failed} Failed`);
    console.log(`================================`);
  } catch (err) {
    console.error('Test run error:', err);
  }
}

runTests();
