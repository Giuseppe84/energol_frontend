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

type Service = {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  days: number;
  createdAt: string;
};

export default function ServicesDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockServices: Service[] = [
      {
        id: '1',
        title: 'Progetto architettonico',
        description: 'Progettazione edificio residenziale',
        category: 'Architettura',
        price: 1500,
        days: 15,
        createdAt: '2025-07-01',
      },
      {
        id: '2',
        title: 'Certificazione energetica',
        description: 'APE per abitazione privata',
        category: 'Energetica',
        price: 250,
        days: 3,
        createdAt: '2025-06-25',
      },
    ];

    const found = mockServices.find(s => s.id === id) || null;
    setService(found);
    setLoading(false);
  }, [id]);

  if (loading) return <MainLayout><CircularProgress /></MainLayout>;
  if (!service)
    return (
      <MainLayout>
        <Box mt={4}>
          <Typography variant="h6" color="error">Servizio non trovato.</Typography>
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
          Dettaglio Servizio
        </Typography>
        <Typography variant="h6">Titolo: {service.title}</Typography>
        <Typography variant="body1">Categoria: {service.category}</Typography>
        <Typography variant="body1">Descrizione: {service.description}</Typography>
        <Typography variant="body1">Prezzo: {service.price} €</Typography>
        <Typography variant="body1">Giorni previsti: {service.days}</Typography>
        <Typography variant="body2" color="text.secondary">
          Data creazione: {service.createdAt}
        </Typography>

        <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate(-1)}>
          Torna indietro
        </Button>
      </Box>
    </MainLayout>
  );
}