import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  Button,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWorkById } from '../api/works';

interface WorkDetail {
  id: string;
  description: string;
  amount: number;
  client?: { firstName: string; lastName: string };
  subject?: { firstName: string; lastName: string };
  property?: { address: string; city: string };
  service?: { name: string };
  status?: string;
  acquisitionDate?: string;
  completionDate?: string;
  createdAt: string;
}

export default function WorkDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState<WorkDetail | null>(null);

  useEffect(() => {
    const loadWork = async () => {
      if (id) {
        const data = await fetchWorkById(id);
        setWork(data);
      }
    };
    loadWork();
  }, [id]);

  if (!work) {
    return <Typography>Caricamento...</Typography>;
  }

  return (
    <Box p={2}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Torna indietro
      </Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Dettaglio Pratica
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              md: 6
            }}>
            <Typography variant="subtitle2">Descrizione</Typography>
            <Typography variant="body1" gutterBottom>
              {work.description}
            </Typography>
            <Typography variant="subtitle2">Data acquisizione</Typography>
            <Typography variant="body1" gutterBottom>
              {work.acquisitionDate
                ? format(new Date(work.acquisitionDate), 'EEE d MMMM yyyy', { locale: it })
                : '-'}
            </Typography>
            <Typography variant="subtitle2">Data completamento</Typography>
            <Typography variant="body1" gutterBottom>
              {work.completionDate
                ? format(new Date(work.completionDate), 'EEE d MMMM yyyy', { locale: it })
                : '-'}
            </Typography>
            <Typography variant="subtitle2">Importo</Typography>
            <Typography variant="body1" gutterBottom>
              {work.amount} €
            </Typography>
            <Typography variant="subtitle2">Stato</Typography>
            <Typography variant="body1" gutterBottom>
              {{
                TO_START: 'Da iniziare',
                IN_PROGRESS: 'In corso',
                COMPLETED: 'Completato',
                CANCELED: 'Annullato',
              }[work.status ?? ''] ?? 'Non definito'}
            </Typography>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 6
            }}>
            <Typography variant="subtitle2">Cliente</Typography>
            <Typography variant="body1" gutterBottom>
              {work.client ? `${work.client.firstName} ${work.client.lastName}` : '-'}
            </Typography>
            <Typography variant="subtitle2">Soggetto</Typography>
            <Typography variant="body1" gutterBottom>
              {work.subject ? `${work.subject.firstName} ${work.subject.lastName}` : '-'}
            </Typography>
            <Typography variant="subtitle2">Servizio</Typography>
            <Typography variant="body1" gutterBottom>
              {work.service?.name ?? '-'}
            </Typography>
            <Typography variant="subtitle2">Proprietà</Typography>
            <Typography variant="body1" gutterBottom>
              {work.property ? `${work.property.address}, ${work.property.city}` : '-'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}