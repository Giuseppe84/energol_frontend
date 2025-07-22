import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchSubjectById } from '../api/subjects';
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
  clientSubjects: {
    client: {
      firstName: string;
      lastName: string;
    };
    isSamePerson: boolean;
  }[];
  createdAt: string;
};

export default function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubject = async () => {
      try {
        if (!id) return;
        const data = await fetchSubjectById(id);
        setSubject(data);
      } catch (error) {
        console.error('Errore nel caricamento del soggetto:', error);
        setSubject(null);
      } finally {
        setLoading(false);
      }
    };
    loadSubject();
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
        {subject.clientSubjects.map(({ client, isSamePerson }, index) => (
          <Typography key={index} variant="body1" sx={{ mb: 1 }}>
            Cliente associato: {client.firstName} {client.lastName}
            {isSamePerson && ' (stessa persona)'}
          </Typography>
        ))}
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