export const fetchPincodeDetails = async (pincode, country) => {
  const API_KEY = import.meta.env.VITE_ZIPCODEBASE_KEY; // best practice
  const API_URL = import.meta.env.VITE_ZIPCODEBASE_URL; // best practice

  const res = await fetch(
    `${API_URL}/search?apikey=${API_KEY}&codes=${pincode}&country=${country}`
  );

  if (!res.ok) {
    throw new Error('Failed to fetch pincode data');
  }

  return res.json();
};