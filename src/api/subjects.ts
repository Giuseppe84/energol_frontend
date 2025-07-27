// src/api/subjects.ts
import api from './axiosInstance';


export const createOrUpdateSubject = async (subject: {
  id?: string;
  taxId: string;
  firstName: string;
  lastName: string;
  clientId: string;
  isSamePerson?: boolean;
  email?: string;
  phone?: string;
}) => {
  const response = subject.id
    ? await api.put(`/subjects/${subject.id}`, subject)
    : await api.post('/subjects', subject);
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
export const assignSubjectToClient = async (clientId: string, subjectId: string, isSamePerson = false) => {
  const response = await api.post(`/clients/${clientId}/assign-subject/${subjectId}`, { isSamePerson });
  return response.data;
};

export const deleteSubject = async (id: string) => {
  const response = await api.delete(`/subjects/${id}`);
  return response.data;
};

export const fetchSubjectsByClient = async (clientId: string) => {
  const response = await api.get(`/subjects/client/${clientId}`);
  return response.data;
};