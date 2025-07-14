

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



interface Property {
  id: string;
  address: string;
  city: string;
  client: string;
  createdAt: string;
}

const PropertySchema = Yup.object().shape({
  address: Yup.string().required('Indirizzo obbligatorio'),
  city: Yup.string().required('Città obbligatoria'),
  client: Yup.string().required('Cliente obbligatorio'),
});

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProperty, setNewProperty] = useState<Property>({
    id: '',
    address: '',
    city: '',
    client: '',
    createdAt: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const navigate = useNavigate();


  useEffect(() => {
    setProperties([
      {
        id: '1',
        address: 'Via Roma 10',
        city: 'Milano',
        client: 'Mario Rossi',
        createdAt: '2025-07-01',
      },
      {
        id: '2',
        address: 'Corso Torino 15',
        city: 'Torino',
        client: 'Giulia Verdi',
        createdAt: '2025-06-20',
      },
    ]);
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewProperty({
      id: '',
      address: '',
      city: '',
      client: '',
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

  const handleDeleteConfirm = () => {
    if (propertyToDelete) {
      setProperties(prev => prev.filter(p => p.id !== propertyToDelete.id));
    }
    handleDeleteCancel();
  };

  const filteredProperties = properties.filter(p =>
    p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client.toLowerCase().includes(searchTerm.toLowerCase())
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
                  <TableCell>{property.client}</TableCell>
                  <TableCell>{property.createdAt}</TableCell>
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
            onSubmit={(values) => {
              if (values.id) {
                setProperties(prev => prev.map(p => (p.id === values.id ? { ...p, ...values } : p)));
              } else {
                const newEntry = {
                  ...values,
                  id: (properties.length + 1).toString(),
                  createdAt: new Date().toISOString().split('T')[0],
                };
                setProperties([...properties, newEntry]);
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