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

type Work = {
  id: string;
  title: string;
  subject: string;
  service: string;
  status: string;
  createdAt: string;
};

export default function WorkDetailPage() {

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock, sostituisci con chiamata API reale
    const mockWorks: Work[] = [
      {
        id: '1',
        title: 'Pratica APE villa bifamiliare',
        subject: 'Mario Rossi',
        service: 'Certificazione energetica',
        status: 'attiva',
        createdAt: '2025-07-01',
      },
      {
        id: '2',
        title: 'Pratica ristrutturazione appartamento',
        subject: 'Giulia Verdi',
        service: 'Progetto architettonico',
        status: 'completata',
        createdAt: '2025-06-25',
      },
    ];

    const foundWork = mockWorks.find(w => w.id === id) || null;
    setWork(foundWork);
    setLoading(false);
  }, [id]);

  if (loading) return <MainLayout><CircularProgress /></MainLayout>;
  if (!work)
    return (
      <MainLayout>
        <Box mt={4}>
          <Typography variant="h6" color="error">Pratica non trovata.</Typography>
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
          Dettaglio Pratica
        </Typography>
        <Typography variant="h6">Titolo: {work.title}</Typography>
        <Typography variant="body1">Soggetto: {work.subject}</Typography>
        <Typography variant="body1">Servizio: {work.service}</Typography>
        <Typography variant="body1">Stato: {work.status}</Typography>
        <Typography variant="body2" color="text.secondary">
          Data creazione: {work.createdAt}
        </Typography>

        <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate(-1)}>
          Torna indietro
        </Button>
      </Box>
    </MainLayout>
  );
}