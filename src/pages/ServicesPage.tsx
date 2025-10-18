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
import { fetchServices, createOrUpdateService, deleteService } from '../api/services';


interface Service {
    id: string;
    name: string;
    description: string;
    amount: number;
    createdAt: string;
}

const ServiceSchema = Yup.object().shape({
    name: Yup.string().required('Il nome è obbligatorio'),
    description: Yup.string().required('La descrizione è obbligatoria'),
    amount: Yup.number().required('Prezzo obbligatorio'),
});

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newService, setNewService] = useState<Service>({
        id: '',
        name: '',
        description: '',
        amount: 0,
        createdAt: '',
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
      const loadServices = async () => {
        try {
          const data = await fetchServices();
          setServices(data);
        } catch (error) {
          console.error('Errore nel caricamento dei servizi:', error);
        }
      };
      loadServices();
    }, []);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setNewService({ id: '', name: '', description: '', amount: 0, createdAt: '' });
    };

    const handleEdit = (service: Service) => {
        setNewService({ ...service });
        setOpen(true);
    };

    const handleDeleteClick = (service: Service) => {
        setServiceToDelete(service);
        setDeleteDialogOpen(true);
    };

    const handleDeleteCancel = () => {
        setServiceToDelete(null);
        setDeleteDialogOpen(false);
    };

    const handleDeleteConfirm = async () => {
      if (!serviceToDelete) return;
      try {
        await deleteService(serviceToDelete.id);
        setServices(prev => prev.filter(s => s.id !== serviceToDelete.id));
      } catch (error) {
        console.error('Errore durante l\'eliminazione del servizio:', error);
      }
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    };

    const filteredServices = services.filter(s =>
        (s.name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        (s.description?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
    );

    return (
        <MainLayout>
            <Box>
                <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                    <Grid>
                        <Typography variant="h5">Servizi</Typography>
                    </Grid>
                    <Grid>
                        <Button variant="contained" color="primary" onClick={handleOpen}>
                            Aggiungi servizio
                        </Button>
                    </Grid>
                </Grid>
                <Box mb={2}>
                    <TextField
                        fullWidth
                        label="Cerca servizio"
                        variant="outlined"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nome</TableCell>
                                <TableCell>Descrizione</TableCell>
                                <TableCell>Prezzo</TableCell>
                                <TableCell>Azioni</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredServices.map(service => (
                                <TableRow key={service.id}>
                                    <TableCell
                                        sx={{ cursor: 'pointer', color: 'primary.main' }}
                                        onClick={() => navigate(`/services/${service.id}`)}
                                    >
                                        {service.name}
                                    </TableCell>
                                    <TableCell>{service.description}</TableCell>
                                    <TableCell>{service.amount}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleEdit(service)} size="small">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteClick(service)} size="small">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Dialog aggiunta/modifica */}
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>{newService.id ? 'Modifica Servizio' : 'Nuovo Servizio'}</DialogTitle>
                    <Formik
                        initialValues={newService}
                        validationSchema={ServiceSchema}
                        enableReinitialize
                        onSubmit={async (values) => {
                          try {
                            // Map 'amount' for API compatibility
                            const saved = await createOrUpdateService(values );
                            const updated = values.id
                              ? services.map(s => (s.id === saved.id ? saved : s))
                              : [...services, saved];
                            setServices(updated);
                            handleClose();
                          } catch (error) {
                            console.error('Errore nel salvataggio del servizio:', error);
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
                                        name="name"
                                        fullWidth
                                        value={values.name}
                                        onChange={handleChange}
                                        error={touched.name && Boolean(errors.name)}
                                        helperText={touched.name && errors.name}
                                    />
                                    <TextField
                                        margin="dense"
                                        label="Descrizione"
                                        name="description"
                                        fullWidth
                                        value={values.description}
                                        onChange={handleChange}
                                        error={touched.description && Boolean(errors.description)}
                                        helperText={touched.description && errors.description}
                                    />
                                    <TextField
                                        margin="dense"
                                        label="Prezzo (€)"
                                        name="amount"
                                        type="number"
                                        fullWidth
                                        value={values.amount}
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

                {/* Dialog conferma eliminazione */}
                <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
                    <DialogTitle>Conferma eliminazione</DialogTitle>
                    <DialogContent>
                        Sei sicuro di voler eliminare il servizio "{serviceToDelete?.name}"?
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
