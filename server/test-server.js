// Test server connections and endpoints
const http = require('http');

// Define tests for various endpoints
const testDonationsPost = () => {
  console.log('Testing POST /api/donations...');

  const data = JSON.stringify({
    item: 'Test Apples',
    quantity: 10,
    weight: 5,
    pickupTime: new Date().toISOString(),
    address: '123 Test St',
    donorId: 'test-user-123'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/donations',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'X-User-Id': 'test-user-123'
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log(`Status Code: ${res.statusCode}`);
      try {
        const parsedData = JSON.parse(responseData);
        console.log('Response (parsed):', parsedData);
      } catch (e) {
        console.log('Response could not be parsed as JSON:');
        console.log(responseData);
        console.log('Error:', e.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.write(data);
  req.end();
};

// Define tests for AI impact endpoint
const testAiImpactPost = () => {
  console.log('Testing POST /api/ai/impact...');

  const data = JSON.stringify({
    lbs: 11.02,
    donorId: 'test-user-123'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/ai/impact',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'X-User-Id': 'test-user-123'
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log(`Status Code: ${res.statusCode}`);
      try {
        const parsedData = JSON.parse(responseData);
        console.log('Response (parsed):', parsedData);
      } catch (e) {
        console.log('Response could not be parsed as JSON:');
        console.log(responseData);
        console.log('Error:', e.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.write(data);
  req.end();
};

// Check if server is running
const checkServerStatus = () => {
  console.log('Checking if server is running...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    console.log(`Server responded with status: ${res.statusCode}`);
    console.log('Server appears to be running.');
    
    // If server is running, run the tests
    setTimeout(testDonationsPost, 1000);
    setTimeout(testAiImpactPost, 2000);
  });
  
  req.on('error', (error) => {
    console.error('Server does not appear to be running:', error.message);
    console.log('Make sure to start the server with: node server.js');
  });
  
  req.end();
};

// Start the tests
console.log('Server API Testing Tool');
console.log('======================');
checkServerStatus();