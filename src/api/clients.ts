import api from './axiosInstance';

export const fetchClients = async () => {
  const response = await api.get('/clients');
  return response.data;
};

export const fetchClientById = async (id: string) => {
  const response = await api.get(`/clients/${id}`);
  return response.data;
};

export const createOrUpdateClient = async (client: {
  id?: string;
  taxId: string;
  vatNumber?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}) => {
  const response = client.id
    ? await api.put(`/clients/${client.id}`, client)
    : await api.post('/clients', client);
  return response.data;
};

export const deleteClient = async (id: string) => {
  const response = await api.delete(`/clients/${id}`);
  return response.data;
};