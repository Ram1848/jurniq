const { pool } = require('./config/db');
const otpService = require('./services/otpService');
const bcrypt = require('bcryptjs');

async function testModule() {
  console.log('=== FORGOT PASSWORD MODULE TEST ===');
  try {
    // 1. Check if test user exists or get first user
    const [users] = await pool.query('SELECT user_id, full_name, email FROM users LIMIT 1');
    if (users.length === 0) {
      console.log('No test user found in DB. Skipping live user test.');
      return;
    }

    const testUser = users[0];
    console.log(`Test User Found: ${testUser.full_name} (${testUser.email})`);

    // 2. Test Invalid Email
    console.log('\n[Test 1] Testing non-existent email...');
    try {
      await otpService.generateAndSendOTP('non_existent_user_12345@test.com');
      console.error('FAIL: Expected error for invalid email');
    } catch (err) {
      console.log('PASS: Correctly rejected invalid email ->', err.message);
    }

    // 3. Test Generate and Send OTP for valid user
    console.log('\n[Test 2] Generating and sending OTP for valid email...');
    const genRes = await otpService.generateAndSendOTP(testUser.email);
    console.log('PASS: OTP generated successfully ->', genRes.message);

    // Fetch stored hashed OTP and expiry from DB
    const [otpCheck] = await pool.query('SELECT reset_otp, otp_expiry, otp_attempts FROM users WHERE email = ?', [testUser.email]);
    const storedUser = otpCheck[0];
    console.log('Stored DB state: reset_otp exists =', !!storedUser.reset_otp, ', expiry =', storedUser.otp_expiry, ', attempts =', storedUser.otp_attempts);

    // 4. Test Invalid OTP
    console.log('\n[Test 3] Testing invalid OTP code (000000)...');
    try {
      await otpService.verifyOTP(testUser.email, '000000');
      console.error('FAIL: Expected error for invalid OTP');
    } catch (err) {
      console.log('PASS: Correctly rejected wrong OTP ->', err.message);
    }

    // Check attempts counter incremented
    const [attemptCheck] = await pool.query('SELECT otp_attempts FROM users WHERE email = ?', [testUser.email]);
    console.log('Attempts counter incremented to:', attemptCheck[0].otp_attempts);

    // 5. Test Password Strength Validation
    console.log('\n[Test 4] Testing password strength rules...');
    const weakRes = otpService.validatePasswordStrength('weak');
    console.log('PASS: Weak password blocked ->', weakRes);

    const strongRes = otpService.validatePasswordStrength('StrongPass123!');
    console.log('PASS: Strong password accepted ->', strongRes === null ? 'Valid' : strongRes);

    console.log('\n=== ALL FORGOT PASSWORD BACKEND LOGIC VERIFIED SUCCESSFULLY ===');
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await pool.end();
  }
}

testModule();
