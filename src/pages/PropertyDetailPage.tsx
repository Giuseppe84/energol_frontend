import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import MainLayout from '../layout/MainLayout';
import { fetchPropertyById } from '../api/properties';
import { fetchClients } from '../api/clients';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface Work {
  id: string;
  description: string;
  amount: number;
  paymentStatus?: string;
}

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  clientId: string;
  createdAt: string;
  updatedAt?: string;
  works?: Work[];
  latitude?: number;
  longitude?: number;
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const property = await fetchPropertyById(id);
       
        if (property) setProperty(property);

        const clients = await fetchClients();
        const client = clients.find((c: any) => c.id === property?.clientId);
        if (client) setClientName(`${client.firstName} ${client.lastName}`);
      } catch (error) {
        console.error('Errore nel caricamento della proprietà:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProperty();
  }, [id]);

  const markerIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  if (loading) {
    return (
      <MainLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!property) {
    return (
      <MainLayout>
        <Box mt={4} textAlign="center">
          <Typography variant="h6" color="error">
            Proprietà non trovata
          </Typography>
          <Button variant="contained" onClick={() => navigate('/properties')} sx={{ mt: 2 }}>
            Torna alle proprietà
          </Button>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box mt={4} p={3}>
        <Typography variant="h4" gutterBottom>
          Dettaglio Proprietà
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography><strong>ID:</strong> {property.id}</Typography>
          <Typography><strong>Nome:</strong> {property.name}</Typography>
          <Typography><strong>Indirizzo:</strong> {property.address}</Typography>
          <Typography><strong>Città:</strong> {property.city}</Typography>
          <Typography><strong>Provincia:</strong> {property.province}</Typography>
          <Typography><strong>CAP:</strong> {property.postalCode}</Typography>
          <Typography><strong>Cliente associato:</strong> {clientName}</Typography>
          <Typography><strong>Data creazione:</strong> {new Date(property.createdAt).toLocaleString()}</Typography>
          {property.updatedAt && (
            <Typography><strong>Ultimo aggiornamento:</strong> {new Date(property.updatedAt).toLocaleString()}</Typography>
          )}
        </Paper>

        {property.latitude && property.longitude && (
          <Box mt={3} height={300}>
            <MapContainer
              center={[property.latitude, property.longitude]}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
              />
              <Marker position={[property.latitude, property.longitude]} icon={markerIcon}>
                <Popup>{property.name}</Popup>
              </Marker>
            </MapContainer>
          </Box>
        )}

        <Typography variant="h6" gutterBottom>Lavori associati</Typography>
        <Table component={Paper} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Descrizione</TableCell>
              <TableCell>Importo (€)</TableCell>
              <TableCell>Stato Pagamento</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {property.works?.length ? (
              property.works.map(work => (
                <TableRow key={work.id}>
                  <TableCell>{work.description}</TableCell>
                  <TableCell>{work.amount}</TableCell>
                  <TableCell>{work.paymentStatus ?? '—'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Nessun lavoro associato
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Box mt={3}>
          <Button variant="outlined" onClick={() => navigate('/properties')}>
            Torna alle proprietà
          </Button>
        </Box>
      </Box>
    </MainLayout>
  );
}