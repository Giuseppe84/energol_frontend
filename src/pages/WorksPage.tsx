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
import SubjectSearchModal from '../components/Subjects/SubjectSearchModal';
import ClientSearchModal from '../components/Clients/ClientSearchModal';
import { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { fetchWorks, createOrUpdateWork, deleteWork } from '../api/works';
import { fetchClients } from '../api/clients';
import { fetchSubjectsByClient } from '../api/subjects';
import { fetchPropertiesBySubject } from '../api/properties';
import { fetchServices } from '../api/services';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';



interface Work {
  id: string;
  description: string;
  acquisitionDate: string;
  completionDate: string;
  status: 'TO_START' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  amount: number;
  clientId: string;
  propertyId: string;
  serviceId: string;
  subjectId: string;
  createdAt: string;
}




const WorkSchema = Yup.object().shape({
  description: Yup.string().required('La descrizione è obbligatoria'),
  acquisitionDate: Yup.string().nullable(),
  completionDate: Yup.string()
    .nullable()
    .when('status', {
      is: 'COMPLETED',
      then: schema =>
        schema.required('La data di completamento è obbligatoria')
          .test(
            'is-after-acquisition',
            'La data di completamento deve essere successiva alla data di acquisizione',
            function (value) {
              const { acquisitionDate } = this.parent;
              return !value || !acquisitionDate || new Date(value) >= new Date(acquisitionDate);
            }
          ),
      otherwise: schema => schema.nullable(),
    }),
  status: Yup.string().oneOf(['TO_START', 'IN_PROGRESS', 'COMPLETED', 'CANCELED']),
  amount: Yup.number().required('L\'importo è obbligatorio').min(0),
  clientId: Yup.string().required('Il cliente è obbligatorio'),
  propertyId: Yup.string().required('La proprietà è obbligatoria'),
  serviceId: Yup.string().required('Il servizio è obbligatorio'),
  subjectId: Yup.string().required('Il soggetto è obbligatorio'),
});


export default function WorksPage() {
  const navigate = useNavigate();
  const [works, setWorks] = useState<Work[]>([]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newWork, setNewWork] = useState<Work>({
    id: '',
    description: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    completionDate: '',
    status: 'TO_START',
    amount: 0,
    clientId: '',
    propertyId: '',
    serviceId: '',
    subjectId: '',
    createdAt: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workToDelete, setWorkToDelete] = useState<Work | null>(null);

  interface Subject {
    id: string;
    firstName: string;
    lastName: string;
    taxId: string;
  }

  interface Property {
    id: string;
    address: string;
    city: string;
  }

  interface Service {
    id: string;
    name: string;
    amount?: number;
  }

  interface Client {
    id: string;
    firstName: string;
    lastName: string;
    taxId: string;
  }

  const [clients, setClients] = useState<Client[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [selectedSubjectName, setSelectedSubjectName] = useState('');

  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [selectedClientName, setSelectedClientName] = useState('');

  // Funzione per aggiornare la descrizione in base a soggetto, proprietà e servizio
  const updateDescription = (subjectId: string, propertyId: string, serviceId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    const property = properties.find(p => p.id === propertyId);
    const service = services.find(s => s.id === serviceId);

    if (subject && property && service) {
      return `${subject.lastName} ${subject.firstName} - ${service.name} presso ${property.address}, ${property.city}`;
    }
    return '';
  };

  const handleSubjectSelect = (subject: any) => {
    setNewWork(prev => {
      const desc = updateDescription(subject.id, prev.propertyId, '');
      return { ...prev, subjectId: subject.id, serviceId: '', description: desc };
    });
    setSelectedSubjectName(`${subject.firstName} ${subject.lastName}`);
    setSubjectModalOpen(false);
  };

  const handleClientSelect = (client: any) => {
    setNewWork(prev => ({
      ...prev,
      clientId: client.id,
      subjectId: '',
      serviceId: '',
    }));
    setSelectedClientName(`${client.firstName} ${client.lastName}`);
    setSelectedSubjectName('');
    setClientModalOpen(false);
    setSubjects([]);
    setProperties([]);
  };
  useEffect(() => {
    const loadServices = async () => {
      const data = await fetchServices();
      setServices(data);
    };
    loadServices();
  }, []);

  useEffect(() => {
    const loadWorks = async () => {
      try {
        const data = await fetchWorks();
        setWorks(data);
      } catch (error) {
        console.error('Errore nel caricamento delle pratiche:', error);
      }
    };
    loadWorks();
  }, []);

  useEffect(() => {
    const loadClients = async () => {
      const data = await fetchClients();
      setClients(data);
    };
    loadClients();
  }, []);

  // Carica i soggetti quando cambia il clientId
  useEffect(() => {
    if (newWork.clientId) {
      fetchSubjectsByClient(newWork.clientId).then(setSubjects);
    } else {
      setSubjects([]);
    }
  }, [newWork.clientId]);

  // Carica le proprietà quando cambia il subjectId
  useEffect(() => {
    if (newWork.subjectId) {
      fetchPropertiesBySubject(newWork.subjectId).then(setProperties);
    } else {
      setProperties([]);
    }
  }, [newWork.subjectId]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewWork({
      id: '',
      description: '',
      acquisitionDate: new Date().toISOString().split('T')[0],
      completionDate: '',
      status: 'TO_START',
      amount: 0,
      clientId: '',
      propertyId: '',
      serviceId: '',
      subjectId: '',
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

  const handleDeleteConfirm = async () => {
    if (!workToDelete) return;
    try {
      await deleteWork(workToDelete.id);
      setWorks(prev => prev.filter(w => w.id !== workToDelete.id));
    } catch (error) {
      console.error('Errore durante l\'eliminazione della pratica:', error);
    }
    handleDeleteCancel();
  };

  const filteredWorks = works.filter(w =>
    (w.description?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
    (w.subjectId?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
    (w.serviceId?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <Box>
        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
          <Grid>
            <Typography variant="h5">Pratiche</Typography>
          </Grid>
          <Grid>
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
                <TableCell>Descrizione</TableCell>
                <TableCell>Data acquisizione</TableCell>
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
                    {work.description}
                  </TableCell>
                  <TableCell>
                    {work.acquisitionDate
                      ? format(new Date(work.acquisitionDate), "EEE d MMMM yyyy", { locale: it })
                      : ''}
                  </TableCell>
                  <TableCell>
                    {{
                      TO_START: 'Da iniziare',
                      IN_PROGRESS: 'In corso',
                      COMPLETED: 'Completato',
                      CANCELED: 'Annullato',
                    }[work.status] ?? 'N/A'}
                  </TableCell>
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
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth={false}
          PaperProps={{ style: { width: 600, maxWidth: '100%' } }}
        >
          <DialogTitle>{newWork.id ? 'Modifica Pratica' : 'Nuova Pratica'}</DialogTitle>
          <Formik
            initialValues={newWork}
            validationSchema={WorkSchema}
            enableReinitialize
            onSubmit={async (values, { setTouched, validateForm }) => {
              setTouched({
                acquisitionDate: true,
                completionDate: true,
              });

              const errors = await validateForm();
              if (Object.keys(errors).length > 0) {
                return;
              }

              try {
                await createOrUpdateWork({
                  id: values.id || undefined,
                  title: values.description,
                  subject: values.subjectId,
                  service: values.serviceId,
                  status: values.status,
                });
                const refreshedWorks = await fetchWorks();
                setWorks(refreshedWorks);
                handleClose();
              } catch (error) {
                console.error('Errore durante il salvataggio della pratica:', error);
              }
            }}
          >
            {({ values, errors, touched, handleChange, setFieldValue }) => (
              <Form>
                <DialogContent>
                  <TextField
                    select
                    margin="dense"
                    label="Servizio"
                    name="serviceId"
                    fullWidth
                    value={values.serviceId}
                    onChange={async e => {
                      handleChange(e);
                      const serviceId = e.target.value;
                      const selectedService = services.find(s => s.id === serviceId);
                      if (selectedService) {
                        setFieldValue('amount', selectedService.amount ?? 0);
                      }
                      // Only update description for new work or if propertyId is set (i.e. this field is being changed)
                      if (!newWork.id || values.propertyId) {
                        const desc = updateDescription(values.subjectId, values.propertyId, serviceId);
                        setFieldValue('description', desc);
                      }
                    }}
                    error={touched.serviceId && Boolean(errors.serviceId)}
                    helperText={touched.serviceId && errors.serviceId}
                  >
                    {services.map(service => (
                      <MenuItem key={service.id} value={service.id}>
                        {service.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Box mt={2}>
                    <Typography variant="subtitle2">Cliente</Typography>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => setClientModalOpen(true)}
                      disabled={Boolean(newWork.id)}
                    >
                      {selectedClientName ||
                        (() => {
                          const client = clients.find(c => c.id === newWork.clientId);
                          return client ? `${client.firstName} ${client.lastName} - CF: ${client.taxId}` : 'Seleziona cliente';
                        })()}
                    </Button>
                  </Box>
                  <Box mt={2}>
                    <Typography variant="subtitle2">Soggetto</Typography>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => setSubjectModalOpen(true)}
                      disabled={Boolean(newWork.id)}
                    >
                      {selectedSubjectName ||
                        (() => {
                          const subj = subjects.find(s => s.id === values.subjectId);
                          return subj
                            ? `${subj.firstName} ${subj.lastName} - CF: ${subj.taxId}`
                            : 'Seleziona soggetto';
                        })()
                      }
                    </Button>
                  </Box>
                  <TextField
                    select
                    margin="dense"
                    label="Proprietà"
                    name="propertyId"
                    fullWidth
                    value={values.propertyId}
                    onChange={e => {
                      handleChange(e);
                      const propertyId = e.target.value;
                      // Only update description for new work or if serviceId is set (i.e. this field is being changed)
                      if (!newWork.id || values.serviceId) {
                        const desc = updateDescription(values.subjectId, propertyId, values.serviceId);
                        setFieldValue('description', desc);
                      }
                    }}
                    error={touched.propertyId && Boolean(errors.propertyId)}
                    helperText={touched.propertyId && errors.propertyId}
                  >
                    {properties.map(property => (
                      <MenuItem key={property.id} value={property.id}>
                        {property.address} - {property.city}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    margin="dense"
                    label="Descrizione"
                    name="description"
                    fullWidth
                    multiline
                    rows={4}
                    value={values.description}
                    onChange={handleChange}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                  />
                  <Grid container spacing={2}>
                    <Grid
                      size={{
                        xs: 12,
                        sm: 6
                      }}>
                      <TextField
                        margin="dense"
                        label="Data acquisizione"
                        name="acquisitionDate"
                        type="date"
                        fullWidth
                        value={values.acquisitionDate}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        error={touched.acquisitionDate && Boolean(errors.acquisitionDate)}
                        helperText={touched.acquisitionDate && errors.acquisitionDate}
                      />
                    </Grid>
                    <Grid
                      size={{
                        xs: 12,
                        sm: 6
                      }}>
                      <TextField
                        select
                        margin="dense"
                        label="Stato"
                        name="status"
                        fullWidth
                        value={values.status}
                        onChange={handleChange}
                      >
                        <MenuItem value="TO_START">Da iniziare</MenuItem>
                        <MenuItem value="IN_PROGRESS">In corso</MenuItem>
                        <MenuItem value="COMPLETED">Completato</MenuItem>
                        <MenuItem value="CANCELED">Annullato</MenuItem>
                      </TextField>
                    </Grid>
                    {values.status === 'COMPLETED' && (
                      <Grid
                        size={{
                          xs: 12,
                          sm: 6
                        }}>
                        <TextField
                          margin="dense"
                          label="Data completamento"
                          name="completionDate"
                          type="date"
                          fullWidth
                          value={values.completionDate}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                          error={touched.completionDate && Boolean(errors.completionDate)}
                          helperText={touched.completionDate && errors.completionDate}
                        />
                      </Grid>
                    )}
                    <Grid size={12}>
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
                        InputProps={{
                          startAdornment: <span style={{ marginRight: 4 }}>€</span>,
                        }}
                      />
                    </Grid>
                  </Grid>
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
            Sei sicuro di voler eliminare la pratica "{workToDelete?.description}"?
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Annulla</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Elimina
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <SubjectSearchModal
        clientId={newWork.clientId}
        open={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        onSelect={handleSubjectSelect}
      />
      <ClientSearchModal
        open={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onSelect={handleClientSelect}
      />
    </MainLayout>
  );
}