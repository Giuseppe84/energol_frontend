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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
  Checkbox,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MainLayout from '../layout/MainLayout';
import { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { fetchPayments, createOrUpdatePayment, deletePayment } from '../api/payments';
import { fetchClients } from '../api/clients';
import { fetchUnpaidWorks } from '../api/works';


interface WorkSelection {
  id: string;
  description?: string;
  amount?: number;
  amountPaid?: number;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: string;
  clientId: string;
  works: WorkSelection[];
}

const PaymentSchema = Yup.object().shape({
  amount: Yup.number().required('Importo obbligatorio'),
  paymentMethod: Yup.string().required('Metodo di pagamento obbligatorio'),
  paymentStatus: Yup.string().required('Stato pagamento obbligatorio'),
});

const updateAmountFromWorks = (
  selectedWorks: WorkSelection[],
  setFieldValue: any,
  setNewPayment: React.Dispatch<React.SetStateAction<Payment>>
) => {
  const total = selectedWorks.reduce((sum, w) => sum + Number(w.amountPaid || w.amount || 0), 0);
  setFieldValue('amount', total);
  setNewPayment(prev => ({ ...prev, amount: total }));
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPayment, setNewPayment] = useState<Payment>({
    id: '',
    amount: 0,
    status: '',
    createdAt: '',
    paymentMethod: '',
    paymentStatus: '',
    clientId: '',
    works: [],
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [clients, setClients] = useState<any[]>([]);

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [unpaidWorks, setUnpaidWorks] = useState<any[]>([]);
  // Remove selectedWorkIds, now we use works array
  const navigate = useNavigate();

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const data = await fetchPayments();
        setPayments(data);
      } catch (error) {
        console.error('Errore nel caricamento dei pagamenti:', error);
      }
    };
    loadPayments();

    const loadClients = async () => {
      try {
        const clientsData = await fetchClients();
        setClients(clientsData);
      } catch (error) {
        console.error('Errore nel caricamento dei clienti:', error);
      }
    };
    loadClients();
  }, []);

  const handleOpen = () => {
    setSelectedClientId('');
    setUnpaidWorks([]);
    setNewPayment({
      id: '',
      amount: 0,
      status: '',
      createdAt: '',
      paymentMethod: '',
      paymentStatus: '',
      clientId: '',
      works: [],
    });
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setNewPayment({
      id: '',
      amount: 0,
      status: '',
      createdAt: '',
      paymentMethod: '',
      paymentStatus: '',
      clientId: '',
      works: [],
    });
    setSelectedClientId('');
    setUnpaidWorks([]);
  };

  const handleEdit = async (payment: Payment) => {
    setNewPayment({
      ...payment,
      paymentMethod: payment.paymentMethod ?? '',
      paymentStatus: payment.paymentStatus ?? '',
      clientId: payment.clientId ?? '',
      works: payment.works ?? [],
    });
    setSelectedClientId(payment.clientId || '');
    if (payment.clientId) {
      const worksData = await fetchUnpaidWorks(payment.clientId);
      setUnpaidWorks(worksData);
    }
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

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return;
    try {
      await deletePayment(paymentToDelete.id);
      setPayments(prev => prev.filter(p => p.id !== paymentToDelete.id));
    } catch (error) {
      console.error('Errore durante l\'eliminazione del pagamento:', error);
    }
    handleDeleteCancel();
  };

  const filteredPayments = payments.filter(p => {
    // Filtra per nome cliente
    const client = clients.find(c => c.id === p.clientId);
    const clientName = client ? `${client.firstName} ${client.lastName}`.toLowerCase() : '';
    const term = searchTerm.toLowerCase();
    return clientName.includes(term);
  });

  // Funzione per caricare i lavori non pagati di un cliente, includendo amountPaid, paymentStatus, amountToPay
  const loadUnpaidWorks = async (clientId: string) => {
    if (clientId) {
      try {
        const worksData = await fetchUnpaidWorks(clientId);
        const worksWithAmountPaid = worksData.map((work: any) => ({
          ...work,
          amountPaid: work.amountPaid ?? 0,
          paymentStatus: work.paymentStatus ?? 'PENDING',
          amountToPay: Math.max((work.amount ?? 0) - (work.amountPaid ?? 0), 0),
        }));
        console.log('Lavori non pagati caricati:', worksWithAmountPaid);
        setUnpaidWorks(worksWithAmountPaid);
      } catch (error) {
        setUnpaidWorks([]);
        console.error('Errore nel caricamento dei lavori non pagati:', error);
      }
    } else {
      setUnpaidWorks([]);
    }
  };

  // Effetto per caricare i lavori non pagati quando cambia il cliente selezionato
  useEffect(() => {
    loadUnpaidWorks(selectedClientId);
  }, [selectedClientId]);

  // Funzione per salvare il pagamento (creazione o aggiornamento)
  const savePayment = async (values: Payment) => {
    try {
      const payload = {
        isRefund: false,
        paymentMethod: values.paymentMethod,
        paymentStatus: values.paymentStatus,
        clientId: values.clientId,
        workPayments: values.works.map(w => ({
          workId: w.id,
          amountPaid: w.amountPaid ?? 0,
        })),
      };

      const saved = await createOrUpdatePayment(payload);
      const updated = values.id
        ? payments.map(p => (p.id === saved.id ? saved : p))
        : [...payments, saved];
      setPayments(updated);
      handleClose();
    } catch (error) {
      console.error('Errore nel salvataggio del pagamento:', error);
    }
  };

  return (
    <MainLayout>
      <Box>
        <Grid container >
          <Grid size={8}>
            <Typography variant="h5">Pagamenti</Typography>
          </Grid>
          <Grid size={8}>
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
                <TableCell>Cliente</TableCell>
                <TableCell>Importo (€)</TableCell>
                <TableCell>Metodo</TableCell>
                <TableCell>Stato</TableCell>
                <TableCell>Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map(payment => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {clients.find(c => c.id === payment.clientId)?.firstName ?? '—'}
                  </TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>{payment.paymentStatus}</TableCell>
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
            initialValues={{
              ...newPayment,
              clientId: selectedClientId,
              works: newPayment.works || [],
            }}
            validationSchema={PaymentSchema}
            enableReinitialize
            onSubmit={(values, { setSubmitting }) => {
              savePayment(values).finally(() => setSubmitting(false));
            }}
          >
            {({ values, errors, touched, handleChange, setFieldValue }) => (
              <Form>
                <DialogContent>
                  {!newPayment.id && (
                    <>
                      <TextField
                        select
                        margin="dense"
                        label="Cliente"
                        name="clientId"
                        fullWidth
                        value={selectedClientId}
                        onChange={e => {
                          const clientId = e.target.value;
                          setSelectedClientId(clientId);
                          setFieldValue('clientId', clientId);
                          setNewPayment(prev => ({ ...prev, works: [] }));
                          setFieldValue('works', []);
                          setFieldValue('amount', 0);
                        }}
                      >
                        {clients.map(client => (
                          <MenuItem key={client.id} value={client.id}>
                            {client.firstName} {client.lastName} - CF: {client.taxId}
                          </MenuItem>
                        ))}
                      </TextField>
                    </>
                  )}
                  {unpaidWorks.length > 0 && (
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Seleziona</TableCell>
                            <TableCell>Descrizione</TableCell>
                            <TableCell>Importo (€)</TableCell>
                             <TableCell>Importo pagato</TableCell>
                            <TableCell>Importo da saldare</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {unpaidWorks.map(work => {
                            const existingWork = newPayment.works.find(w => w.id === work.id);
                            const isChecked = !!existingWork;

                            return (
                              <TableRow key={work.id}>
                                <TableCell>
                                  <Checkbox
                                    checked={isChecked}
                                    onChange={() => {
                                      let updatedWorks;
                                      if (isChecked) {
                                        updatedWorks = newPayment.works.filter(w => w.id !== work.id);
                                      } else {
                                        const amountToPay = Math.max((work.amount ?? 0) - (work.amountPaid ?? 0), 0);
                                        updatedWorks = [...newPayment.works, { ...work, amountPaid: amountToPay, amountToPay }];
                                      }
                                      setNewPayment(prev => ({ ...prev, works: updatedWorks }));
                                      setFieldValue('works', updatedWorks);
                                      updateAmountFromWorks(updatedWorks, setFieldValue, setNewPayment);
                                    }}
                                  />
                                </TableCell>
                                <TableCell>{work.description}</TableCell>
                                <TableCell>{work.amount}</TableCell>
                                <TableCell>{work.amountPaid}</TableCell>
                                <TableCell>
                                  {isChecked && (
                                    <TextField
                                      type="number"
                                      size="small"
                                      value={existingWork?.amountPaid ?? Math.max((work.amount ?? 0) - (work.amountPaid ?? 0), 0)}
                                      onChange={(e) => {
                                        const value = parseFloat(e.target.value);
                                        const updatedWorks = newPayment.works.map(w => {
                                          if (w.id === work.id) {
                                            const newAmountPaid = value;
                                            const newAmountToPay = Math.max((work.amount ?? 0) - newAmountPaid, 0);
                                            return { ...w, amountPaid: newAmountPaid, amountToPay: newAmountToPay };
                                          }
                                          return w;
                                        });
                                        setNewPayment(prev => ({ ...prev, works: updatedWorks }));
                                        setFieldValue('works', updatedWorks);
                                        updateAmountFromWorks(updatedWorks, setFieldValue, setNewPayment);
                                      }}
                                    />
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  <TextField
                    select
                    margin="dense"
                    label="Metodo di pagamento"
                    name="paymentMethod"
                    fullWidth
                    value={values.paymentMethod}
                    onChange={handleChange}
                    error={touched.paymentMethod && Boolean(errors.paymentMethod)}
                    helperText={touched.paymentMethod && errors.paymentMethod}
                  >
                    <MenuItem value="BANK_TRANSFER">Bonifico</MenuItem>
                    <MenuItem value="CASH">Contanti</MenuItem>
                    <MenuItem value="CREDIT_CARD">Carta di credito</MenuItem>
                  </TextField>

                  <TextField
                    select
                    margin="dense"
                    label="Stato pagamento"
                    name="paymentStatus"
                    fullWidth
                    value={values.paymentStatus}
                    onChange={handleChange}
                    error={touched.paymentStatus && Boolean(errors.paymentStatus)}
                    helperText={touched.paymentStatus && errors.paymentStatus}
                  >
                    <MenuItem value="PENDING">In sospeso</MenuItem>
                    <MenuItem value="PARTIALLY_PAID">Parzialmente pagato</MenuItem>
                    <MenuItem value="PAID">Pagato</MenuItem>
                    <MenuItem value="REFUNDED">Rimborsato</MenuItem>
                    <MenuItem value="NO_AMOUNT">Nessun importo</MenuItem>
                  </TextField>

                  <TextField
                    margin="dense"
                    label="Importo"
                    name="amount"
                    type="number"
                    fullWidth
                    value={newPayment.works.reduce((sum, w) => sum + (w.amountPaid ?? 0), 0)}
                    onChange={handleChange}
                    error={touched.amount && Boolean(errors.amount)}
                    helperText={touched.amount && errors.amount}
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
            Sei sicuro di voler eliminare il pagamento?
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