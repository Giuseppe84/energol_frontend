

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
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MainLayout from '../layout/MainLayout';
import { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';



interface Work {
  id: string;
  title: string;
  subject: string;
  service: string;
  status: string;
  createdAt: string;
}

const WorkSchema = Yup.object().shape({
  title: Yup.string().required('Il titolo è obbligatorio'),
  subject: Yup.string().required('Il soggetto è obbligatorio'),
  service: Yup.string().required('Il servizio è obbligatorio'),
  status: Yup.string().required('Lo stato è obbligatorio'),
});

const statusOptions = ['attiva', 'completata', 'in attesa'];

export default function WorksPage() {
    const navigate = useNavigate();
  const [works, setWorks] = useState<Work[]>([]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newWork, setNewWork] = useState<Work>({
    id: '',
    title: '',
    subject: '',
    service: '',
    status: '',
    createdAt: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workToDelete, setWorkToDelete] = useState<Work | null>(null);

  useEffect(() => {
    setWorks([
      {
        id: '1',
        title: 'Pratica APE villa bifamiliare',
        subject: 'Mario Rossi',
        service: 'Certificazione energetica',
        status: 'attiva',
        createdAt: '2025-07-01',
      },
      {
        id: '2',
        title: 'Pratica ristrutturazione appartamento',
        subject: 'Giulia Verdi',
        service: 'Progetto architettonico',
        status: 'completata',
        createdAt: '2025-06-25',
      },
    ]);
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewWork({
      id: '',
      title: '',
      subject: '',
      service: '',
      status: '',
      createdAt: '',
    });
  };

  const handleEdit = (work: Work) => {
    setNewWork({ ...work });
    setOpen(true);
  };

  const handleDeleteClick = (work: Work) => {
    setWorkToDelete(work);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setWorkToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (workToDelete) {
      setWorks(prev => prev.filter(w => w.id !== workToDelete.id));
    }
    handleDeleteCancel();
  };

  const filteredWorks = works.filter(w =>
    w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <Box>
        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
          <Grid item>
            <Typography variant="h5">Pratiche</Typography>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={handleOpen}>
              Aggiungi pratica
            </Button>
          </Grid>
        </Grid>
        <Box mb={2}>
          <TextField
            fullWidth
            label="Cerca pratica"
            variant="outlined"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </Box>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Titolo</TableCell>
                <TableCell>Soggetto</TableCell>
                <TableCell>Servizio</TableCell>
                <TableCell>Stato</TableCell>
                <TableCell>Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWorks.map(work => (
                <TableRow key={work.id}>
                 <TableCell
  sx={{ cursor: 'pointer', color: 'primary.main' }}
  onClick={() => navigate(`/works/${work.id}`)}
>
  {work.title}
</TableCell>
                  <TableCell>{work.subject}</TableCell>
                  <TableCell>{work.service}</TableCell>
                  <TableCell>{work.status}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(work)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(work)} size="small">
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
          <DialogTitle>{newWork.id ? 'Modifica Pratica' : 'Nuova Pratica'}</DialogTitle>
          <Formik
            initialValues={newWork}
            validationSchema={WorkSchema}
            enableReinitialize
            onSubmit={(values) => {
              if (values.id) {
                setWorks(prev => prev.map(w => (w.id === values.id ? { ...w, ...values } : w)));
              } else {
                const newEntry = {
                  ...values,
                  id: (works.length + 1).toString(),
                  createdAt: new Date().toISOString().split('T')[0],
                };
                setWorks([...works, newEntry]);
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
                    label="Titolo"
                    name="title"
                    fullWidth
                    value={values.title}
                    onChange={handleChange}
                    error={touched.title && Boolean(errors.title)}
                    helperText={touched.title && errors.title}
                  />
                  <TextField
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
                    label="Stato"
                    name="status"
                    select
                    fullWidth
                    value={values.status}
                    onChange={handleChange}
                    error={touched.status && Boolean(errors.status)}
                    helperText={touched.status && errors.status}
                  >
                    {statusOptions.map(option => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
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
            Sei sicuro di voler eliminare la pratica "{workToDelete?.title}"?
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