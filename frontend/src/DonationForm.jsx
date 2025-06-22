import React, { useState, useEffect } from 'react';
import { getCurrentUserId, getSessionId } from './userService';

function DonationForm() {
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [weight, setWeight] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Always use the user service to get consistent IDs
  const [donorId, setDonorId] = useState(getCurrentUserId());
  const [sessionId, setSessionId] = useState(getSessionId());
  
  // Update IDs if they change (for example, if user switches)
  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentId = getCurrentUserId();
      if (currentId !== donorId) {
        setDonorId(currentId);
      }
      
      const currentSession = getSessionId();
      if (currentSession !== sessionId) {
        setSessionId(currentSession);
      }
    }, 2000); // Check every 2 seconds
    
    return () => clearInterval(intervalId);
  }, [donorId, sessionId]);
  
  const handleSubmit = async (e) => {
    console.log(JSON.stringify({ 
          item, 
          quantity: Number(quantity), 
          weight: Number(weight), 
          pickupTime,
          address,
          donorId
        }))
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!item || !quantity || !weight || !pickupTime) {
      setError('All fields are required.');
      return;
    }
    if (isNaN(quantity) || quantity <= 0) {
      setError('Quantity must be a number > 0.');
      return;
    }
    if (isNaN(weight) || weight <= 0) {
      setError('Weight must be a number > 0.');
      return;
    }
    setLoading(true);
    try {      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
        const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
          'X-Tab-Id': sessionId
        },
        body: JSON.stringify({ 
          item, 
          quantity: Number(quantity), 
          weight: Number(weight), 
          pickupTime,
          address,
          donorId
        })
      });      if (!res.ok) {
        try {
          const text = await res.text();
          const errorData = text ? JSON.parse(text) : {};
          throw new Error(errorData.error || `Status: ${res.status}`);
        } catch (jsonError) {
          throw new Error(`Server error (${res.status})`);
        }
      }
        // More robust handling of the response
      let data;
      
      try {
        // First check if the response has content
        if (res.headers.get('Content-Type')?.includes('application/json')) {
          // If it's JSON content type, try to parse it
          const text = await res.text();
          data = text && text.trim() ? JSON.parse(text) : {};
        } else {
          // Not JSON or empty response
          data = { donationId: Date.now(), message: 'Donation submitted successfully' };
        }
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        // Still mark as success since the request was successful
        data = { donationId: Date.now(), message: 'Donation submitted successfully' };
      }
        setSuccess(true);
      setItem(''); setQuantity(''); setWeight(''); setPickupTime(''); setAddress('');
      
      // Refresh the donations list
      if (window.refreshDonations) {
        window.refreshDonations();
      }
      
      // If you need to trigger impact card with the result
      if (window.onDonationSuccess) {
        window.onDonationSuccess(data);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(`Failed to submit donation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-sage-dark mb-1">Item Name</label>
          <input className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-sage-secondary focus:border-transparent transition-all" 
                 value={item} onChange={e => setItem(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-sage-dark mb-1">Quantity</label>
          <input className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-sage-secondary focus:border-transparent transition-all" 
                 type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-sage-dark mb-1">Weight (lbs)</label>
          <input className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-sage-secondary focus:border-transparent transition-all" 
                 type="number" min="0.01" step="0.01" value={weight} onChange={e => setWeight(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-sage-dark mb-1">Pickup Window</label>
          <input className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-sage-secondary focus:border-transparent transition-all" 
                 type="datetime-local" value={pickupTime} onChange={e => setPickupTime(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-sage-dark mb-1">Pickup Address</label>
          <input className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-sage-secondary focus:border-transparent transition-all" 
                 type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street address for pickup" required />
        </div>
      </div>
      {error && <div className="text-red-500 text-sm mt-3">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg mt-3 border border-green-200">Donation submitted successfully!</div>}
      <button className="mt-4 w-full bg-sage-primary text-white py-3 px-4 rounded-xl hover:bg-green-600 transition-colors duration-200 font-medium shadow-md" 
              type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Donation'}
      </button>
    </form>
  );
}

export default DonationForm;
