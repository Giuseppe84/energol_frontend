

import api from './axiosInstance';

export const fetchProperties = async () => {
  const response = await api.get('/properties');
  return response.data;
};

export const fetchPropertyById = async (id: string) => {
  const response = await api.get(`/properties/${id}`);
  return response.data;
};

export const createOrUpdateProperty = async (property: {
  id?: string;
  cadastralCode: string;
  address: string;
  city: string;
  clientId: string;
}) => {
  const response = await api.put('/properties', property);
  return response.data;
};

export const deleteProperty = async (id: string) => {
  const response = await api.delete(`/properties/${id}`);
  return response.data;
};


export const fetchPropertiesBySubject = async (subjectId: string) => {
  const response = await api.get(`/properties/by-subject/${subjectId}`);
  return response.data;
};


// API to fetch properties by location (latitude, longitude, radius)
export const getPropertiesByLocation = async (
  latitude: number,
  longitude: number,
  radius: number
) => {
  const response = await api.post('/properties/location', 
    {
      latitude,
      longitude,
      radius,
    },
  );
  return response.data;
};