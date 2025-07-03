import axios from 'axios';

const API_BASE_URL = 'https://bekidtracker-backend.onrender.com/api/vnpay';

export const getAllTransactions = async () => {
  const response = await axios.get(`${API_BASE_URL}/all`);
  return response.data.transactions;
};