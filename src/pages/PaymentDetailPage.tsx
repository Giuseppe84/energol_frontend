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


type Payment = {
  id: string;
  subject: string;
  service: string;
  amount: number;
  status: string;
  createdAt: string;
};

export default function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockPayments: Payment[] = [
      {
        id: '1',
        subject: 'Mario Rossi',
        service: 'Certificazione energetica',
        amount: 250,
        status: 'pagato',
        createdAt: '2025-07-01',
      },
      {
        id: '2',
        subject: 'Giulia Verdi',
        service: 'Progetto architettonico',
        amount: 1500,
        status: 'in sospeso',
        createdAt: '2025-06-20',
      },
    ];

    const found = mockPayments.find(p => p.id === id) || null;
    setPayment(found);
    setLoading(false);
  }, [id]);

  if (loading) return <MainLayout><CircularProgress /></MainLayout>;
  if (!payment)
    return (
      <MainLayout>
        <Box mt={4}>
          <Typography variant="h6" color="error">Pagamento non trovato.</Typography>
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
          Dettaglio Pagamento
        </Typography>
        <Typography variant="h6">Soggetto: {payment.subject}</Typography>
        <Typography variant="body1">Servizio: {payment.service}</Typography>
        <Typography variant="body1">Importo: {payment.amount} €</Typography>
        <Typography variant="body1">Stato: {payment.status}</Typography>
        <Typography variant="body2" color="text.secondary">
          Data creazione: {payment.createdAt}
        </Typography>

        <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate(-1)}>
          Torna indietro
        </Button>
      </Box>
    </MainLayout>
  );
}