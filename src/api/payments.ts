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
  paymentMethod?: string;
  paymentStatus?: string;
}) => {
  let response;
  if (payment.id) {
    response = await api.put(`/payments/${payment.id}`, payment);
  } else {
    response = await api.post('/payments', payment);
  }
  return response.data;
};

export const deletePayment = async (id: string) => {
  const response = await api.delete(`/payments/${id}`);
  return response.data;
};

export const createOrUpdateService = async (service: {
  id?: string;
  name: string;
  description: string;
  amount: number;
}) => {
  let response;
  if (service.id) {
    response = await api.put(`/services/${service.id}`, service);
  } else {
    response = await api.post('/services', service);
  }
  return response.data;
};
