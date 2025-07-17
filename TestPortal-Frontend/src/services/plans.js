import axios from 'axios';

export const fetchPlans = async () => {
  const base = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  const url = token ? `${base}/plans/index_for_current_user` : `${base}/plans`;
  const headers = token && url.includes("index_for_current_user")
    ? { Authorization: `Bearer ${token}` }
    : {};

  const response = await axios.get(url, { headers });
  return response.data;
};

  
export const fetchPlanById = async (planId) => {
  const base= import.meta.env.VITE_API_BASE_URL
  const response = await axios.get(`{http://localhost:3000/api/v1}/plans/${planId}`);
  return response.data;
};
