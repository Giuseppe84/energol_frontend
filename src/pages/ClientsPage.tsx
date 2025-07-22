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
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MainLayout from '../layout/MainLayout';
import { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { fetchClients, createOrUpdateClient, } from '../api/clients';
import { fetchSubjects } from '../api/subjects';
type Client = {
  id: string;
  firstName: string;
  lastName: string;
  taxId: string;
  vatNumber?: string;
  email: string;
  phone?: string;
  createdAt: string;
  clientSubjects?: {
    subject: {
      id: string;
      firstName: string;
      lastName: string;
    };
    isSamePerson: boolean;
  }[];
};

const ClientSchema = Yup.object().shape({
  firstName: Yup.string().required('Il nome è obbligatorio'),
  lastName: Yup.string().required('Il cognome è obbligatorio'),
  taxId: Yup.string().required('Il codice fiscale è obbligatorio'),
  vatNumber: Yup.string().nullable(),
  email: Yup.string().email('Email non valida').required('L\'email è obbligatoria'),
  phone: Yup.string().nullable(),
});

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [newClient, setNewClient] = useState<Client>({ id: '', firstName: '', lastName: '', taxId: '', vatNumber: '', email: '', phone: '', createdAt: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const [availableSubjects, setAvailableSubjects] = useState<{ id: string; firstName: string; lastName: string; }[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await fetchClients();
        console.log('Fetched clients:', data);
        setClients(data);
      } catch (error) {
        console.error('Errore nel caricamento dei clienti:', error);
      }
    };
    loadClients();
  }, []);

  useEffect(() => {
    if (open) {
      setLoadingSubjects(true);
      fetchSubjects()
        .then(data => {
          setAvailableSubjects(data);
          if (newClient.clientSubjects) {
            setSelectedSubjectIds(newClient.clientSubjects.map(cs => cs.subject.id));
          } else {
            setSelectedSubjectIds([]);
          }
        })
        .finally(() => setLoadingSubjects(false));
    }
  }, [open, newClient]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewClient({ id: '', firstName: '', lastName: '', taxId: '', vatNumber: '', email: '', phone: '', createdAt: '' });
    setSelectedSubjectIds([]);
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
    (client.firstName?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
    (client.lastName?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
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
                <TableCell>Soggetti associati</TableCell>
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
                  {`${client.firstName} ${client.lastName}`}
                  </TableCell>
                  <TableCell>{client.taxId}</TableCell>
                  <TableCell>{client.createdAt}</TableCell>
                  <TableCell>
                    {client.clientSubjects?.map(({ subject, isSamePerson }, i) => (
                      <Typography key={i} variant="body2">
                        {subject.firstName} {subject.lastName}
                        {isSamePerson && ' (stessa persona)'}
                      </Typography>
                    ))}
                  </TableCell>
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
            onSubmit={async (values) => {
              try {
                const { firstName, lastName, email, phone, taxId, vatNumber, id } = values;
                const saved = await createOrUpdateClient({ firstName, lastName, email, phone, taxId, vatNumber, id });
                const updated = values.id
                  ? clients.map(c => (c.id === saved.id ? saved : c))
                  : [...clients, saved];
                setClients(updated);
                handleClose();
              } catch (err) {
                console.error('Errore nel salvataggio del cliente:', err);
              }
            }}
          >
            {({ values, errors, touched, handleChange }) => (
              <Form>
                <DialogContent>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Nome"
                    name="firstName"
                    fullWidth
                    value={values.firstName}
                    onChange={handleChange}
                    error={touched.firstName && Boolean(errors.firstName)}
                    helperText={touched.firstName && errors.firstName}
                  />
                  <TextField
                    margin="dense"
                    label="Cognome"
                    name="lastName"
                    fullWidth
                    value={values.lastName}
                    onChange={handleChange}
                    error={touched.lastName && Boolean(errors.lastName)}
                    helperText={touched.lastName && errors.lastName}
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
                  <TextField
                    margin="dense"
                    label="Partita IVA"
                    name="vatNumber"
                    fullWidth
                    value={values.vatNumber}
                    onChange={handleChange}
                    error={touched.vatNumber && Boolean(errors.vatNumber)}
                    helperText={touched.vatNumber && errors.vatNumber}
                  />
                  <TextField
                    margin="dense"
                    label="Email"
                    name="email"
                    fullWidth
                    value={values.email}
                    onChange={handleChange}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                  <TextField
                    margin="dense"
                    label="Telefono"
                    name="phone"
                    fullWidth
                    value={values.phone}
                    onChange={handleChange}
                    error={touched.phone && Boolean(errors.phone)}
                    helperText={touched.phone && errors.phone}
                  />
                  <Autocomplete
                    multiple
                    options={availableSubjects}
                    getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                    value={availableSubjects.filter(subj => selectedSubjectIds.includes(subj.id))}
                    onChange={(event, newValue) => setSelectedSubjectIds(newValue.map(v => v.id))}
                    loading={loadingSubjects}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Soggetti associati"
                        placeholder="Seleziona soggetti"
                        margin="dense"
                        fullWidth
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingSubjects ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
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
            Sei sicuro di voler eliminare il cliente "{clientToDelete ? `${clientToDelete.firstName} ${clientToDelete.lastName}` : ''}"?
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