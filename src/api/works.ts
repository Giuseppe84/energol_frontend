import api from './axiosInstance';

export const fetchWorks = async () => {
  const response = await api.get('/works');
  return response.data;
};

export const createOrUpdateWork = async (work: {
  id?: string;
  title: string;
  subject: string;
  service: string;
  status: string;
}) => {
  const response = await api.put('/works', work);
  return response.data;
};

export const deleteWork = async (id: string) => {
  const response = await api.delete(`/works/${id}`);
  return response.data;
};