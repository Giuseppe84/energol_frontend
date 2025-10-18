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
  FormHelperText,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MainLayout from '../layout/MainLayout';
import { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { fetchProperties, createOrUpdateProperty, deleteProperty } from '../api/properties';
import { fetchSubjects } from '../api/subjects';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import SubjectSearchModal from '../components/Subjects/SubjectSearchModal';


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
  subjectId: Yup.string().required('Soggetto obbligatorio'),
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
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const navigate = useNavigate();

  // Placeholder clients list - if you have a real list, fetch it and replace this

  const [subjectsList, setSubjectsList] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await fetchSubjects();
           console.log('Soggetti caricati:', response);
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
        console.log('Immobili caricati:', data);
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
    p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subjectsList.find(s => s.id === p.subjectId)?.lastName.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (subjectsList.find(s => s.id === p.subjectId)?.firstName.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <Box>
        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
          <Grid>
            <Typography variant="h5">Immobili</Typography>
          </Grid>
          <Grid>
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
                <TableCell>Soggetto</TableCell>
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
                    {(() => {
                      const subject = subjectsList.find(s => s.id === property.subjectId);
                      return subject ? `${subject.lastName} ${subject.firstName}` : '';
                    })()}
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
                const saved = await createOrUpdateProperty({
                  ...values,
                  clientId: values.subjectId, // Map subjectId to clientId as required by API
                });
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
            {({ values, errors, touched, handleChange }) => (
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
                  <Box display="flex" gap={1} alignItems="center" mt={2}>
                    <TextField
                      label="Soggetto"
                      value={
                        subjectsList.find(s => s.id === values.subjectId)
                          ? `${subjectsList.find(s => s.id === values.subjectId)?.lastName} ${subjectsList.find(s => s.id === values.subjectId)?.firstName}`
                          : ''
                      }
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                    <Button variant="outlined" onClick={() => setSubjectModalOpen(true)}>
                      Cerca
                    </Button>
                  </Box>
                  {touched.subjectId && errors.subjectId && (
                    <FormHelperText error>{errors.subjectId}</FormHelperText>
                  )}
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

        <SubjectSearchModal
          open={subjectModalOpen}
          onClose={() => setSubjectModalOpen(false)}
          onSelect={(subject) => {
            setNewProperty(prev => ({ ...prev, subjectId: subject.id }));
            setSubjectModalOpen(false);
          }}
          clientId={newProperty.id || ''}
        />
      </Box>
    </MainLayout>
  );
}