import axios from 'axios';
import { handleUnauthorized } from '../utils/handleUnauthorized';

export const createSubscription = async (planId) => {
  const token = localStorage.getItem('token');
  const base= import.meta.env.VITE_API_BASE_URL
  const response = await axios.post(
    `${base}/subscriptions`,
    { plan_id: planId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const fetchSubscriptions = async () => {
  const token = localStorage.getItem('token'); // Assuming you're storing the token here
  const base= import.meta.env.VITE_API_BASE_URL
  try {
    const response = await axios.get(`${base}/subscriptions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
        handleUnauthorized();
      } else {
        console.error('Error fetching subscriptions:', error);
      }
    throw error;
  }
};

export const cancelSubscription = async (id) => {
  const token = localStorage.getItem('token');
  await axios.delete(`http://localhost:3000/api/v1/subscriptions/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
