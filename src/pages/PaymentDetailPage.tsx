import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  CircularProgress,
} from '@mui/material';
import MainLayout from '../layout/MainLayout';
import { fetchPaymentById } from '../api/payments';
import { fetchClients } from '../api/clients';

interface Work {
  id: string;
  description?: string;
  amount?: number;
  paymentStatus?: string;
}

interface WorkPayment {
  workId: string;
  amountPaid: number;
  work: Work;
}

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  clientId: string;
  workPayments: WorkPayment[];
  createdAt: string;
}

export default function PaymentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayment = async () => {
      try {
        const payment = await fetchPaymentById(id!);
  
        if (payment) setPayment(payment);

        const clients = await fetchClients();
        const client = clients.find((c: any) => c.id === payment?.clientId);
        if (client) setClientName(`${client.firstName} ${client.lastName}`);
      } catch (error) {
        console.error('Errore nel caricamento del pagamento:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPayment();
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

  if (!payment) {
    return (
      <MainLayout>
        <Typography variant="h6" color="error" align="center">
          Pagamento non trovato
        </Typography>
        <Box textAlign="center" mt={2}>
          <Button variant="contained" onClick={() => navigate('/payments')}>
            Torna ai pagamenti
          </Button>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box>
        <Typography variant="h5" gutterBottom>Dettaglio Pagamento</Typography>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography><strong>ID:</strong> {payment.id}</Typography>
          <Typography><strong>Cliente:</strong> {clientName}</Typography>
          <Typography><strong>Importo totale:</strong> €{payment.amount}</Typography>
          <Typography><strong>Metodo di pagamento:</strong> {payment.method}</Typography>
          <Typography><strong>Stato pagamento:</strong> {payment.status}</Typography>
          <Typography><strong>Data creazione:</strong> {new Date(payment.createdAt).toLocaleString()}</Typography>
        </Paper>

        <Typography variant="h6" gutterBottom>Lavori associati</Typography>
        <Table component={Paper} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Descrizione</TableCell>
              <TableCell>Importo (€)</TableCell>
              <TableCell>Importo pagato (€)</TableCell>
              <TableCell>Stato</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payment.workPayments?.length ? (
              payment.workPayments.map((wp) => (
                <TableRow key={wp.workId}>
                  <TableCell>{wp.work.description ?? '—'}</TableCell>
                  <TableCell>{wp.work.amount ?? '—'}</TableCell>
                  <TableCell>{wp.amountPaid ?? 0}</TableCell>
                  <TableCell>{wp.work.paymentStatus ?? '—'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">Nessun lavoro associato</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Box mt={3}>
          <Button variant="outlined" onClick={() => navigate('/payments')}>
            Torna ai pagamenti
          </Button>
        </Box>
      </Box>
    </MainLayout>
  );
}