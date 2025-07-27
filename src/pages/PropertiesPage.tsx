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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MainLayout from '../layout/MainLayout';
import { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { fetchProperties, createOrUpdateProperty, deleteProperty } from '../api/properties';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Client {
  id: string;
  name: string;
}

interface Property {
  id: string;
  cadastralCode: string;
  address: string;
  city: string;
  subjectId: string;
  sheet: number;
  parcel: number;
  subordinates: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

const PropertySchema = Yup.object().shape({
  address: Yup.string().required('Indirizzo obbligatorio'),
  city: Yup.string().required('Città obbligatoria'),
  client: Yup.mixed().test(
    'client-required',
    'Cliente obbligatorio',
    value => {
      if (!value) return false;
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'object' && value !== null) return !!value.id && !!value.name;
      return false;
    }
  ),
});

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProperty, setNewProperty] = useState<Property>({
    id: '',
    cadastralCode: '',
    address: '',
    city: '',
    subjectId: '',
    sheet: 0,
    parcel: 0,
    subordinates: '',
    latitude: undefined,
    longitude: undefined,
    createdAt: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const navigate = useNavigate();

  // Placeholder clients list - if you have a real list, fetch it and replace this
  const clientsList: Client[] = [
    { id: '1', name: 'Mario Rossi' },
    { id: '2', name: 'Luca Bianchi' },
    { id: '3', name: 'Anna Verdi' },
  ];

  const [subjectsList, setSubjectsList] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await fetch(`/api/subjects`);
        const data = await response.json();
        setSubjectsList(data);
      } catch (error) {
        console.error('Errore nel caricamento dei soggetti:', error);
      }
    };
    loadSubjects();
  }, []);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await fetchProperties();
        setProperties(data);
      } catch (error) {
        console.error('Errore nel caricamento degli immobili:', error);
      }
    };
    loadProperties();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewProperty({
      id: '',
      cadastralCode: '',
      address: '',
      city: '',
      subjectId: '',
      sheet: 0,
      parcel: 0,
      subordinates: '',
      latitude: undefined,
      longitude: undefined,
      createdAt: '',
    });
  };

  const handleEdit = (property: Property) => {
    setNewProperty({ ...property });
    setOpen(true);
  };

  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setPropertyToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;
    try {
      await deleteProperty(propertyToDelete.id);
      setProperties(prev => prev.filter(p => p.id !== propertyToDelete.id));
    } catch (error) {
      console.error('Errore durante l\'eliminazione dell\'immobile:', error);
    }
    handleDeleteCancel();
  };

  const filteredProperties = properties.filter(p =>
    p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof p.client === 'string'
      ? p.client.toLowerCase().includes(searchTerm.toLowerCase())
      : p.client.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <MainLayout>
      <Box>
        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
          <Grid item>
            <Typography variant="h5">Immobili</Typography>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={handleOpen}>
              Aggiungi immobile
            </Button>
          </Grid>
        </Grid>
        <Box mb={2}>
          <TextField
            fullWidth
            label="Cerca immobile"
            variant="outlined"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </Box>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Indirizzo</TableCell>
                <TableCell>Città</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Data creazione</TableCell>
                <TableCell>Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProperties.map(property => (
                <TableRow key={property.id}>
                  <TableCell
                    sx={{ cursor: 'pointer', color: 'primary.main' }}
                    onClick={() => navigate(`/properties/${property.id}`)}
                  >
                    {property.address}
                  </TableCell>
                  <TableCell>{property.city}</TableCell>
                  <TableCell>
                    {typeof property.client === 'string'
                      ? property.client
                      : property.client.name}
                  </TableCell>
                  <TableCell>
                    {property.createdAt
                      ? format(new Date(property.createdAt), 'EEE d MMMM yyyy', { locale: it })
                      : ''}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(property)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(property)} size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{newProperty.id ? 'Modifica Immobile' : 'Nuovo Immobile'}</DialogTitle>
          <Formik
            initialValues={newProperty}
            validationSchema={PropertySchema}
            enableReinitialize
            onSubmit={async (values) => {
              try {
                // Normalize client to object if string matches a client id or name
                let clientValue = values.client;
                if (typeof clientValue === 'string') {
                  const foundClient = clientsList.find(
                    c =>
                      c.id === clientValue ||
                      c.name.toLowerCase() === clientValue.toLowerCase()
                  );
                  if (foundClient) {
                    clientValue = foundClient;
                  }
                }
                const toSave = { ...values, client: clientValue };
                const saved = await createOrUpdateProperty(toSave);
                const updated = values.id
                  ? properties.map(p => (p.id === saved.id ? saved : p))
                  : [...properties, saved];
                setProperties(updated);
                handleClose();
              } catch (error) {
                console.error('Errore nel salvataggio dell\'immobile:', error);
              }
            }}
          >
            {({ values, errors, touched, handleChange, setFieldValue }) => (
              <Form>
                <DialogContent>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Indirizzo"
                    name="address"
                    fullWidth
                    value={values.address}
                    onChange={handleChange}
                    error={touched.address && Boolean(errors.address)}
                    helperText={touched.address && errors.address}
                  />
                  <TextField
                    margin="dense"
                    label="Città"
                    name="city"
                    fullWidth
                    value={values.city}
                    onChange={handleChange}
                    error={touched.city && Boolean(errors.city)}
                    helperText={touched.city && errors.city}
                  />
                  <TextField
                    margin="dense"
                    label="Codice Catastale"
                    name="cadastralCode"
                    fullWidth
                    value={values.cadastralCode}
                    onChange={handleChange}
                  />
                  <TextField
                    margin="dense"
                    label="Foglio"
                    name="sheet"
                    type="number"
                    fullWidth
                    value={values.sheet}
                    onChange={handleChange}
                  />
                  <TextField
                    margin="dense"
                    label="Particella"
                    name="parcel"
                    type="number"
                    fullWidth
                    value={values.parcel}
                    onChange={handleChange}
                  />
                  <TextField
                    margin="dense"
                    label="Subalterni"
                    name="subordinates"
                    fullWidth
                    value={values.subordinates}
                    onChange={handleChange}
                  />
                  <TextField
                    margin="dense"
                    label="Latitudine"
                    name="latitude"
                    type="number"
                    fullWidth
                    value={values.latitude}
                    onChange={handleChange}
                  />
                  <TextField
                    margin="dense"
                    label="Longitudine"
                    name="longitude"
                    type="number"
                    fullWidth
                    value={values.longitude}
                    onChange={handleChange}
                  />
                  <FormControl
                    fullWidth
                    margin="dense"
                    error={touched.client && Boolean(errors.client)}
                  >
                    <InputLabel id="client-label">Cliente</InputLabel>
                    <Select
                      labelId="client-label"
                      id="client"
                      name="client"
                      value={
                        typeof values.client === 'string'
                          ? values.client
                          : values.client?.id || ''
                      }
                      label="Cliente"
                      onChange={e => {
                        const selectedId = e.target.value;
                        const selectedClient = clientsList.find(c => c.id === selectedId);
                        if (selectedClient) {
                          setFieldValue('client', selectedClient);
                        } else {
                          setFieldValue('client', '');
                        }
                      }}
                    >
                      {clientsList.map(client => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.client && errors.client && (
                      <FormHelperText>{errors.client}</FormHelperText>
                    )}
                  </FormControl>
                  <FormControl fullWidth margin="dense">
                    <InputLabel id="subject-label">Soggetto</InputLabel>
                    <Select
                      labelId="subject-label"
                      id="subjectId"
                      name="subjectId"
                      value={values.subjectId}
                      label="Soggetto"
                      onChange={handleChange}
                    >
                      <MenuItem value="">
                        <em>Seleziona soggetto</em>
                      </MenuItem>
                      {subjectsList.map(subject => (
                        <MenuItem key={subject.id} value={subject.id}>
                          {subject.lastName} {subject.firstName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
            Sei sicuro di voler eliminare l'immobile "{propertyToDelete?.address}"?
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