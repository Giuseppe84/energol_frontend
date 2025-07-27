

import api from './axiosInstance';

export const fetchServices = async () => {
  const response = await api.get('/services');
  return response.data;
};

export const fetchServiceById = async (id: string) => {
  const response = await api.get(`/services/${id}`);
  return response.data;
};

export const createOrUpdateService = async (service: {
  id?: string;
  title: string;
  description: string;
  category: string;
  amount: number;
  days: number;
}) => {
  const response = await api.put('/services', service);
  return response.data;
};

export const deleteService = async (id: string) => {
  const response = await api.delete(`/services/${id}`);
  return response.data;
};