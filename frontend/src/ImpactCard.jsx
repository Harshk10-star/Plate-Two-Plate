import { useEffect, useState } from 'react';
import { kgToLbs } from './utils';

function ImpactCard({ latestDonation }) {
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  console.log('Latest donation:', latestDonation);
  

  
  return (
    <div className="bg-sage-light border-l-4 border-sage-primary rounded-xl shadow-md p-5 mb-6">
      <div className="flex items-center mb-3">
        <span className="text-sage-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <div className="font-bold text-lg ml-2 text-sage-dark">
          You saved {latestDonation.lbs || latestDonation.weight} lbs of food!
        </div>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
}

export default ImpactCard;
