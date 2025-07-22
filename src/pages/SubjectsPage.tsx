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
    Autocomplete,
    FormControlLabel,
    Switch,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MainLayout from '../layout/MainLayout';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { createOrUpdateSubject, fetchSubjects, deleteSubject } from '../api/subjects';
import { fetchClients } from '../api/clients';


type Subject = {
    id: string;
    firstName: string;
    lastName: string;
    taxId: string;
    email?: string;
    phone?: string;
    isSamePerson?: boolean;
    clientSubjects?: {
        client: {
            firstName: string;
            lastName: string;
        };
        isSamePerson: boolean;
    }[];

    createdAt: string;
};

const SubjectSchema = Yup.object().shape({
    firstName: Yup.string().required('Il nome è obbligatorio'),
    lastName: Yup.string().required('Il cognome è obbligatorio'),
    taxId: Yup.string().required('Il codice fiscale è obbligatorio'),
});



export default function SubjectsPage() {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [open, setOpen] = useState(false);
    const [newSubject, setNewSubject] = useState<Subject>({
        id: '',
        firstName: '',
        lastName: '',
        taxId: '',
        email: '',
        phone: '',
        createdAt: '',
        isSamePerson: false,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
    const navigate = useNavigate();
    useEffect(() => {
        const loadSubjects = async () => {
            try {
                const data = await fetchSubjects();
                console.log('Fetched subjects:', data);
                setSubjects(data);
            } catch (error) {
                console.error('Errore nel caricamento dei soggetti:', error);
            }
        };
        loadSubjects();
    }, []);

    useEffect(() => {
      const loadClients = async () => {
        const result = await fetchClients();
        setClients(result);
      };
      loadClients();
    }, []);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setNewSubject({
            id: '',
            firstName: '',
            lastName: '',
            taxId: '',
            email: '',
            phone: '',
            createdAt: '',
            isSamePerson: false,
        });
        setSelectedClient(null);
    };

    const handleEdit = (subject: Subject) => {
        setNewSubject({ ...subject });
        setOpen(true);
    };

    const handleDeleteClick = (subject: Subject) => {
        setSubjectToDelete(subject);
        setDeleteDialogOpen(true);
    };

    const handleDeleteCancel = () => {
        setSubjectToDelete(null);
        setDeleteDialogOpen(false);
    };

    const handleDeleteConfirm = async () => {
        if (subjectToDelete) {
            try {
                await deleteSubject(subjectToDelete.id);
                setSubjects(prev => prev.filter(s => s.id !== subjectToDelete.id));
            } catch (error) {
                console.error('Errore durante l\'eliminazione del soggetto:', error);
            }
        }
        handleDeleteCancel();
    };

    const filteredSubjects = subjects.filter(subject =>
        subject.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.taxId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MainLayout>
            <Box>
                <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                    <Grid item>
                        <Typography variant="h5">Soggetti</Typography>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" color="primary" onClick={handleOpen}>
                            Aggiungi soggetto
                        </Button>
                    </Grid>
                </Grid>
                <Box mb={2}>
                    <TextField
                        fullWidth
                        label="Cerca soggetto"
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
                                <TableCell>Codice Fiscale</TableCell>
                                <TableCell>Clienti associati</TableCell>
                                <TableCell>Data creazione</TableCell>
                                <TableCell>Azioni</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredSubjects.map(subject => (
                                <TableRow key={subject.id}>
                                    <TableCell
                                        sx={{ cursor: 'pointer', color: 'primary.main' }}
                                        onClick={() => navigate(`/subjects/${subject.id}`)}
                                    >
                                        {subject.firstName} {subject.lastName}
                                    </TableCell>
                                    <TableCell>{subject.taxId}</TableCell>

                                    <TableCell>
                                      {subject.clientSubjects?.map(({ client, isSamePerson }, index) => (
                                        <Typography key={index} variant="body2">
                                          {client.firstName} {client.lastName}
                                          {isSamePerson && ' (stessa persona)'}
                                        </Typography>
                                      ))}
                                    </TableCell>

                                    <TableCell>{subject.createdAt}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleEdit(subject)} size="small">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteClick(subject)} size="small">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Dialog aggiungi/modifica */}
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>{newSubject.id ? 'Modifica Soggetto' : 'Nuovo Soggetto'}</DialogTitle>
                    <Formik
                        initialValues={newSubject}
                        validationSchema={SubjectSchema}
                        enableReinitialize
                        onSubmit={async (values) => {
                            if (values.id) {
                                setSubjects(prev =>
                                    prev.map(s => (s.id === values.id ? { ...s, ...values } : s))
                                );
                            } else {
                                try {
                                    const payload = {
                                        firstName: values.firstName,
                                        lastName: values.lastName,
                                        taxId: values.taxId,
                                        email: values.email,
                                        phone: values.phone,
                                        clientId: selectedClient?.id || '',
                                        isSamePerson: values.isSamePerson
                                    };

                                    await createOrUpdateSubject(payload);
                                    handleClose();
                                    // Ricarica o aggiorna lo stato
                                } catch (error) {
                                    console.error('Errore durante il salvataggio del soggetto:', error);
                                }
                                setSubjects([...subjects, { ...values, id: String(subjects.length + 1), createdAt: new Date().toISOString() }]);
                            }
                            handleClose();
                        }}
                    >
                        {({ values, errors, touched, handleChange }) => (
                            <Form>
                                <DialogContent>
                                  <Autocomplete
                                    options={clients}
                                    getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                                    onChange={(event, value) => {
                                      setSelectedClient(value);
                                      if (value) {
                                        setNewSubject(prev => ({
                                          ...prev,
                                          firstName: value.firstName,
                                          lastName: value.lastName,
                                          email: value.email,
                                          phone: value.phone,
                                          taxId: value.taxId,
                                          isSamePerson: true
                                        }));
                                      } else {
                                        setNewSubject(prev => ({
                                          ...prev,
                                          isSamePerson: false
                                        }));
                                      }
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Associa cliente esistente" margin="dense" fullWidth />}
                                  />
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        checked={newSubject.isSamePerson}
                                        onChange={(e) => {
                                          const useClient = e.target.checked;
                                          setNewSubject((prev) => ({
                                            ...prev,
                                            isSamePerson: useClient,
                                            firstName: useClient ? selectedClient?.firstName || '' : '',
                                            lastName: useClient ? selectedClient?.lastName || '' : '',
                                            email: useClient ? selectedClient?.email || '' : '',
                                            phone: useClient ? selectedClient?.phone || '' : '',
                                            taxId: useClient ? selectedClient?.taxId || '' : '',
                                          }));
                                        }}
                                        disabled={!selectedClient}
                                      />
                                    }
                                    label="Usa i dati del cliente selezionato"
                                    sx={{ mt: 1, mb: 2 }}
                                  />
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
                                        label="Codice Fiscale"
                                        name="taxId"
                                        fullWidth
                                        value={values.taxId}
                                        onChange={handleChange}
                                        error={touched.taxId && Boolean(errors.taxId)}
                                        helperText={touched.taxId && errors.taxId}
                                    />
                                    <TextField
                                        margin="dense"
                                        label="Email"
                                        name="email"
                                        fullWidth
                                        value={values.email}
                                        onChange={handleChange}
                                    />
                                    <TextField
                                        margin="dense"
                                        label="Telefono"
                                        name="phone"
                                        fullWidth
                                        value={values.phone}
                                        onChange={handleChange}
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
                        Sei sicuro di voler eliminare il soggetto "{subjectToDelete?.firstName} {subjectToDelete?.lastName}"?
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
