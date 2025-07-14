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
import { useNavigate } from 'react-router-dom';

type Client = {
  id: string;
  name: string;
  taxId: string;
  createdAt: string;
};

const ClientSchema = Yup.object().shape({
  name: Yup.string().required('Il nome è obbligatorio'),
  taxId: Yup.string().required('Il codice fiscale è obbligatorio'),
});

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [newClient, setNewClient] = useState<Client>({ id: '', name: '', taxId: '', createdAt: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    // dati mock
    setClients([
      { id: '1', name: 'Mario Rossi', taxId: 'RSSMRA80A01H501U', createdAt: '2025-07-01' },
      { id: '2', name: 'Giulia Verdi', taxId: 'VRDGLI85C45H501R', createdAt: '2025-06-20' },
      { id: '3', name: 'Alessandro Bianchi', taxId: 'BNCLSN90E10H501P', createdAt: '2025-06-10' },
    ]);
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewClient({ id: '', name: '', taxId: '', createdAt: '' });
  };

  const handleEdit = (client: Client) => {
    setNewClient({ ...client });
    setOpen(true);
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setClientToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (clientToDelete) {
      setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
    }
    handleDeleteCancel();
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.taxId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <Box>
        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
          <Grid item>
            <Typography variant="h5">Clienti</Typography>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={handleOpen}>
              Aggiungi cliente
            </Button>
          </Grid>
        </Grid>
        <Box mb={2}>
          <TextField
            fullWidth
            label="Cerca cliente"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Codice Fiscale / P.IVA</TableCell>
                <TableCell>Data creazione</TableCell>
                <TableCell>Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell
                    sx={{ cursor: 'pointer', color: 'primary.main' }}
                    onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    {client.name}
                  </TableCell>
                  <TableCell>{client.taxId}</TableCell>
                  <TableCell>{client.createdAt}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(client)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(client)} size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{newClient.id ? 'Modifica Cliente' : 'Nuovo Cliente'}</DialogTitle>
          <Formik
            initialValues={newClient}
            validationSchema={ClientSchema}
            enableReinitialize
            onSubmit={(values) => {
              if (values.id) {
                setClients((prev) =>
                  prev.map((c) => (c.id === values.id ? { ...c, ...values } : c))
                );
              } else {
                const newEntry = {
                  ...values,
                  id: (clients.length + 1).toString(),
                  createdAt: new Date().toISOString().split('T')[0],
                };
                setClients([...clients, newEntry]);
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
                    label="Nome"
                    name="name"
                    fullWidth
                    value={values.name}
                    onChange={handleChange}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                  />
                  <TextField
                    margin="dense"
                    label="Codice Fiscale / P.IVA"
                    name="taxId"
                    fullWidth
                    value={values.taxId}
                    onChange={handleChange}
                    error={touched.taxId && Boolean(errors.taxId)}
                    helperText={touched.taxId && errors.taxId}
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
            Sei sicuro di voler eliminare il cliente "{clientToDelete?.name}"?
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