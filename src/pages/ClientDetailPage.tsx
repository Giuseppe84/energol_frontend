
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material';
import { fetchClientById } from '../api/clients';
import MainLayout from '../layout/MainLayout';

type Client = {
  id: string;
  name: string;
  taxId: string;
  createdAt: string;
  clientSubjects?: {
    subject: {
      firstName: string;
      lastName: string;
    };
    isSamePerson: boolean;
  }[];
};

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClient = async () => {
      try {
        if (!id) return;
        const data = await fetchClientById(id);
        setClient(data);
      } catch (error) {
        console.error('Errore nel caricamento del cliente:', error);
        setClient(null);
      } finally {
        setLoading(false);
      }
    };
    loadClient();
  }, [id]);

  if (loading) return <MainLayout><CircularProgress /></MainLayout>;
  if (!client)
    return (
      <MainLayout>
        <Box mt={4}>
          <Typography variant="h6" color="error">Cliente non trovato.</Typography>
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
          Dettaglio Cliente
        </Typography>
        <Typography variant="h6">Nome: {client.name}</Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Codice Fiscale / P.IVA: {client.taxId}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Data creazione: {client.createdAt}
        </Typography>

        {client.clientSubjects?.map(({ subject, isSamePerson }, index) => (
          <Typography key={index} variant="body1" sx={{ mt: 1 }}>
            Soggetto associato: {subject.firstName} {subject.lastName}
            {isSamePerson && ' (stessa persona)'}
          </Typography>
        ))}

        <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate(-1)}>
          Torna indietro
        </Button>
      </Box>
    </MainLayout>
  );
}