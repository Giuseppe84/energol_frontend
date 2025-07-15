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
import { createOrUpdateSubject, fetchSubjects } from '../api/subjects';


type Subject = {
    id: string;
    firstName: string;
    lastName: string;
    taxId: string;
    client: { firstName: string; lastName: string } | string;
    createdAt: string;
};

const SubjectSchema = Yup.object().shape({
    firstName: Yup.string().required('Il nome è obbligatorio'),
    lastName: Yup.string().required('Il cognome è obbligatorio'),
    taxId: Yup.string().required('Il codice fiscale è obbligatorio'),
    client: Yup.string().required('Il cliente è obbligatorio'),
});



export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [open, setOpen] = useState(false);
    const [newSubject, setNewSubject] = useState<Subject>({
        id: '',
        firstName: '',
        lastName: '',
        taxId: '',
        client: '',
        createdAt: '',
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

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setNewSubject({
            id: '',
            firstName: '',
            lastName: '',
            taxId: '',
            client: '',
            createdAt: '',
        });
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

    const handleDeleteConfirm = () => {
        if (subjectToDelete) {
            setSubjects(prev => prev.filter(s => s.id !== subjectToDelete.id));
        }
        handleDeleteCancel();
    };

    const filteredSubjects = subjects.filter(subject =>
        subject.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.taxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.client.firstName.toLowerCase().includes(searchTerm.toLowerCase())||
        subject.client.lastName.toLowerCase().includes(searchTerm.toLowerCase())
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
                                <TableCell>Cliente</TableCell>
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
                                    <TableCell>{subject.client.firstName} {subject.client.lastName}</TableCell>
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
                        onSubmit={async(values) => {
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
                                        clientId: 'ID_DEL_CLIENT_CORRETTO', // da ottenere dinamicamente
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
                                        label="Cliente"
                                        name="client"
                                        fullWidth
                                        value={values.client}
                                        onChange={handleChange}
                                        error={touched.client && Boolean(errors.client)}
                                        helperText={touched.client && errors.client}
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
