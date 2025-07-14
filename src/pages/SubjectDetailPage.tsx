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

type Subject = {
  id: string;
  firstName: string;
  lastName: string;
  taxId: string;
  client: string;
  createdAt: string;
};

export default function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dati mock, sostituisci con API reale
    const mockSubjects: Subject[] = [
      {
        id: '1',
        firstName: 'Luca',
        lastName: 'Bianchi',
        taxId: 'BNCLCU90E10H501P',
        client: 'Mario Rossi',
        createdAt: '2025-07-01',
      },
      {
        id: '2',
        firstName: 'Sara',
        lastName: 'Verdi',
        taxId: 'VRDSRA85C45H501R',
        client: 'Giulia Verdi',
        createdAt: '2025-06-20',
      },
    ];

    const foundSubject = mockSubjects.find(s => s.id === id) || null;
    setSubject(foundSubject);
    setLoading(false);
  }, [id]);

  if (loading) return <MainLayout><CircularProgress /></MainLayout>;
  if (!subject)
    return (
      <MainLayout>
        <Box mt={4}>
          <Typography variant="h6" color="error">Soggetto non trovato.</Typography>
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
          Dettaglio Soggetto
        </Typography>
        <Typography variant="h6">Nome: {subject.firstName} {subject.lastName}</Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Codice Fiscale: {subject.taxId}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Cliente associato: {subject.client}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Data creazione: {subject.createdAt}
        </Typography>

        <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate(-1)}>
          Torna indietro
        </Button>
      </Box>
    </MainLayout>
  );
}