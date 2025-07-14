

import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MainLayout from '../layout/MainLayout';
import { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

interface Payment {
  id: string;
  subject: string;
  service: string;
  amount: number;
  status: string;
  createdAt: string;
}

const PaymentSchema = Yup.object().shape({
  subject: Yup.string().required('Soggetto obbligatorio'),
  service: Yup.string().required('Servizio obbligatorio'),
  amount: Yup.number().required('Importo obbligatorio'),
  status: Yup.string().required('Stato obbligatorio'),
});

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPayment, setNewPayment] = useState<Payment>({
    id: '',
    subject: '',
    service: '',
    amount: 0,
    status: '',
    createdAt: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  useEffect(() => {
    setPayments([
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
    ]);
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewPayment({
      id: '',
      subject: '',
      service: '',
      amount: 0,
      status: '',
      createdAt: '',
    });
  };

  const handleEdit = (payment: Payment) => {
    setNewPayment({ ...payment });
    setOpen(true);
  };

  const handleDeleteClick = (payment: Payment) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setPaymentToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (paymentToDelete) {
      setPayments(prev => prev.filter(p => p.id !== paymentToDelete.id));
    }
    handleDeleteCancel();
  };

  const filteredPayments = payments.filter(p =>
    p.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <Box>
        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
          <Grid item>
            <Typography variant="h5">Pagamenti</Typography>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={handleOpen}>
              Aggiungi pagamento
            </Button>
          </Grid>
        </Grid>
        <Box mb={2}>
          <TextField
            fullWidth
            label="Cerca pagamento"
            variant="outlined"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </Box>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Soggetto</TableCell>
                <TableCell>Servizio</TableCell>
                <TableCell>Importo (€)</TableCell>
                <TableCell>Stato</TableCell>
                <TableCell>Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map(payment => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.subject}</TableCell>
                  <TableCell>{payment.service}</TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell>{payment.status}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(payment)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(payment)} size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{newPayment.id ? 'Modifica Pagamento' : 'Nuovo Pagamento'}</DialogTitle>
          <Formik
            initialValues={newPayment}
            validationSchema={PaymentSchema}
            enableReinitialize
            onSubmit={(values) => {
              if (values.id) {
                setPayments(prev => prev.map(p => (p.id === values.id ? { ...p, ...values } : p)));
              } else {
                const newEntry = {
                  ...values,
                  id: (payments.length + 1).toString(),
                  createdAt: new Date().toISOString().split('T')[0],
                };
                setPayments([...payments, newEntry]);
              }
              handleClose();
            }}
          >
            {({ values, errors, touched, handleChange }) => (
              <Form>
                <DialogContent>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Soggetto"
                    name="subject"
                    fullWidth
                    value={values.subject}
                    onChange={handleChange}
                    error={touched.subject && Boolean(errors.subject)}
                    helperText={touched.subject && errors.subject}
                  />
                  <TextField
                    margin="dense"
                    label="Servizio"
                    name="service"
                    fullWidth
                    value={values.service}
                    onChange={handleChange}
                    error={touched.service && Boolean(errors.service)}
                    helperText={touched.service && errors.service}
                  />
                  <TextField
                    margin="dense"
                    label="Importo"
                    name="amount"
                    type="number"
                    fullWidth
                    value={values.amount}
                    onChange={handleChange}
                    error={touched.amount && Boolean(errors.amount)}
                    helperText={touched.amount && errors.amount}
                  />
                  <TextField
                    margin="dense"
                    label="Stato"
                    name="status"
                    fullWidth
                    value={values.status}
                    onChange={handleChange}
                    error={touched.status && Boolean(errors.status)}
                    helperText={touched.status && errors.status}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose}>Annulla</Button>
                  <Button type="submit" variant="contained">Salva</Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </Dialog>

        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Conferma eliminazione</DialogTitle>
          <DialogContent>
            Sei sicuro di voler eliminare il pagamento di "{paymentToDelete?.subject}"?
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Annulla</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Elimina
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}