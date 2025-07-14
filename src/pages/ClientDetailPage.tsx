
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

type Client = {
  id: string;
  name: string;
  taxId: string;
  createdAt: string;
};

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Qui puoi chiamare API reali per il cliente
    // Per ora usiamo dati mock:
    const mockClients: Client[] = [
      { id: '1', name: 'Mario Rossi', taxId: 'RSSMRA80A01H501U', createdAt: '2025-07-01' },
      { id: '2', name: 'Giulia Verdi', taxId: 'VRDGLI85C45H501R', createdAt: '2025-06-20' },
      { id: '3', name: 'Alessandro Bianchi', taxId: 'BNCLSN90E10H501P', createdAt: '2025-06-10' },
    ];

    const foundClient = mockClients.find(c => c.id === id) || null;
    setClient(foundClient);
    setLoading(false);
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

        <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate(-1)}>
          Torna indietro
        </Button>
      </Box>
    </MainLayout>
  );
}