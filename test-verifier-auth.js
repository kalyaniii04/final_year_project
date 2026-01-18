import axios from 'axios';

const API_BASE = 'http://localhost:5000';

// Test verifier authentication flow
async function testVerifierAuth() {
  try {
    console.log('🧪 Testing Verifier Authentication...\n');

    // Step 1: Get nonce
    console.log('1️⃣ Getting nonce...');
    const nonceResponse = await axios.post(`${API_BASE}/auth/verifier/nonce`, {
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    });
    const nonce = nonceResponse.data.nonce;
    console.log('✅ Nonce received:', nonce);

    // Step 2: Simulate signature verification (in real app, this would be done with ethers.js)
    console.log('\n2️⃣ Simulating wallet signature verification...');
    const loginResponse = await axios.post(`${API_BASE}/auth/verifier/login`, {
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      signature: '0x1234567890abcdef' // Dummy signature for testing
    });

    console.log('✅ Login response:', loginResponse.data);

    if (loginResponse.data.token) {
      console.log('\n🎉 Verifier authentication successful!');
      console.log('JWT Token:', loginResponse.data.token);

      // Step 3: Test protected route
      console.log('\n3️⃣ Testing protected verify route...');
      const verifyResponse = await axios.get(`${API_BASE}/verify/test-certificate-id`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      console.log('✅ Protected route accessible:', verifyResponse.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testVerifierAuth();