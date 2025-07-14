import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material';
import MainLayout from '../layout/MainLayout';

type Property = {
  id: string;
  address: string;
  city: string;
  client: string;
  createdAt: string;
};

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockProperties: Property[] = [
      {
        id: '1',
        address: 'Via Roma 10',
        city: 'Milano',
        client: 'Mario Rossi',
        createdAt: '2025-07-01',
      },
      {
        id: '2',
        address: 'Corso Torino 15',
        city: 'Torino',
        client: 'Giulia Verdi',
        createdAt: '2025-06-20',
      },
    ];

    const found = mockProperties.find(p => p.id === id) || null;
    setProperty(found);
    setLoading(false);
  }, [id]);

  if (loading) return <MainLayout><CircularProgress /></MainLayout>;
  if (!property)
    return (
      <MainLayout>
        <Box mt={4}>
          <Typography variant="h6" color="error">Immobile non trovato.</Typography>
          <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
            Torna indietro
          </Button>
        </Box>
      </MainLayout>
    );

  return (
    <MainLayout>
      <Box mt={4} p={3} component={Paper} maxWidth={600} mx="auto">
        <Typography variant="h4" gutterBottom>
          Dettaglio Immobile
        </Typography>
        <Typography variant="h6">Indirizzo: {property.address}</Typography>
        <Typography variant="body1">Città: {property.city}</Typography>
        <Typography variant="body1">Cliente associato: {property.client}</Typography>
        <Typography variant="body2" color="text.secondary">
          Data creazione: {property.createdAt}
        </Typography>

        <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate(-1)}>
          Torna indietro
        </Button>
      </Box>
    </MainLayout>
  );
}