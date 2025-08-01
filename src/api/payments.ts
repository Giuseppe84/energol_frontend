import api from './axiosInstance';

export const fetchPayments = async () => {
  const response = await api.get('/payments');
  return response.data;
};

export const fetchPaymentById = async (id: string) => {
  const response = await api.get(`/payments/${id}`);
  return response.data;
};

export const createOrUpdatePayment = async (payment: {
  id?: string;
  subject: string;
  service: string;
  amount: number;
  status: string;
}) => {
  const response = await api.put('/payments', payment);
  return response.data;
};

export const deletePayment = async (id: string) => {
  const response = await api.delete(`/payments/${id}`);
  return response.data;
};
