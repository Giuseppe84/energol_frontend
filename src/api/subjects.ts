// src/api/subjects.ts
import api from './axiosInstance';


export const createOrUpdateSubject = async (subject: {
  taxId: string;
  firstName: string;
  lastName: string;
  clientId: string;
}) => {
  const response = await api.put('/subjects', subject);
  return response.data;
};

export const fetchSubjects = async () => {
  const response = await api.get('/subjects');
  return response.data;
};

export const fetchSubjectById = async (id: string) => {
  const response = await api.get(`/subjects/${id}`);
  return response.data;
};