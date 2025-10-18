import api from './axiosInstance';

export const fetchWorks = async () => {
  const response = await api.get('/work');
  return response.data;
};

export const createOrUpdateWork = async (work: {
  id?: string;
  title: string;
  subject: string;
  service: string;
  status: string;
}) => {
  const response = work.id
    ? await api.put(`/work/${work.id}`, work)
    : await api.post('/work', work);
  return response.data;
};

export const deleteWork = async (id: string) => {
  const response = await api.delete(`/work/${id}`);
  return response.data;
};

export const fetchWorkById = async (id: string) => {
  const response = await api.get(`/work/${id}`);
  return response.data;
};

export const fetchUnpaidWorks = async (clientId?: string) => {
  const url = clientId ? `/work/unpaid?clientId=${clientId}` : '/work/unpaid';
  const response = await api.get(url);
  return response.data;
};