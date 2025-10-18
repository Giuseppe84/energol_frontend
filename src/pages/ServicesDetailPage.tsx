import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import MainLayout from '../layout/MainLayout';
import { fetchServiceById } from '../api/services';

interface Work {
  id: string;
  description: string;
  amount: number;
  paymentStatus?: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  amount: number;
  createdAt: string;
  updatedAt?: string;
  works?: Work[];
}

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadService = async () => {
      try {
        const found = await fetchServiceById(id!);
       
        setService(found ?? null);
      } catch (error) {
        console.error('Errore nel caricamento del servizio:', error);
      } finally {
        setLoading(false);
      }
    };
    loadService();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!service) {
    return (
      <MainLayout>
        <Typography variant="h6" color="error" align="center">
          Servizio non trovato
        </Typography>
        <Box textAlign="center" mt={2}>
          <Button variant="contained" onClick={() => navigate('/services')}>
            Torna ai servizi
          </Button>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box>
        <Typography variant="h5" gutterBottom>Dettaglio Servizio</Typography>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography><strong>ID:</strong> {service.id}</Typography>
          <Typography><strong>Nome:</strong> {service.name}</Typography>
          <Typography><strong>Descrizione:</strong> {service.description}</Typography>
          <Typography><strong>Prezzo:</strong> €{service.amount}</Typography>
          <Typography><strong>Creato il:</strong> {new Date(service.createdAt).toLocaleString()}</Typography>
          {service.updatedAt && (
            <Typography><strong>Aggiornato il:</strong> {new Date(service.updatedAt).toLocaleString()}</Typography>
          )}
        </Paper>

        <Typography variant="h6" gutterBottom>Lavori associati</Typography>
        <Table component={Paper} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Importo (€)</TableCell>
              <TableCell>Stato Pagamento</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {service.works?.length ? (
              service.works.map(work => (
                <TableRow key={wosrk.id}>
                  <TableCell>{work.description}</TableCell>
                  <TableCell>{work.amount}</TableCell>
                  <TableCell>{work.paymentStatus ?? '—'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Nessun lavoro associato
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Box mt={3}>
          <Button variant="outlined" onClick={() => navigate('/services')}>
            Torna ai servizi
          </Button>
        </Box>
      </Box>
    </MainLayout>
  );
}