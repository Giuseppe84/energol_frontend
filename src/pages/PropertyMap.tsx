import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getPropertiesByLocation } from '../api/properties';
import CitySearch from '../components/CitySearch';
import MainLayout from '../layout/MainLayout';

const markerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const FlyToLocation: React.FC<{ position: [number, number] | null }> = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      const currentCenter = map.getCenter();
      const distance = map.distance(currentCenter, L.latLng(position[0], position[1]));

      // Muovi la mappa solo se la distanza dal centro è significativa
      if (distance > 10) {
        const currentZoom = map.getZoom();
        map.flyTo(position, currentZoom, { animate: true, duration: 1.5 });
      }
    }
  }, [position, map]);

  return null;
};

const PropertyMap: React.FC = () => {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [cityFilter, setCityFilter] = useState<string>('');
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPosition([latitude, longitude]);
        const res = await getPropertiesByLocation(latitude, longitude, 5000);
        setProperties(res);
      },
      async (err) => {
        console.warn("Geolocalizzazione non disponibile, uso posizione di default");
        const latitude = 45.4642; // Milano centro ad esempio
        const longitude = 9.19;
        setUserPosition([latitude, longitude]);
        const res = await getPropertiesByLocation(latitude, longitude, 5000);
        setProperties(res);
      }
    );
  }, []);

  const MapEventHandler = () => {
    const map = useMapEvents({
      moveend: async () => {
        const center = map.getCenter();
        const newPosition: [number, number] = [center.lat, center.lng];
        setUserPosition(newPosition);
        const res = await getPropertiesByLocation(center.lat, center.lng, 5000);
        setProperties(res);
      },
    });
    return null;
  };

  const handleCityChange = async (cityName: string, lat: number, lng: number) => {
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!latNum || !lngNum || Number.isNaN(latNum) || Number.isNaN(lngNum)) return;

    setCityFilter(cityName);
    setUserPosition([latNum, lngNum]);

    try {
      const res = await getPropertiesByLocation(latNum, lngNum, 5000);
      setProperties(res);
    } catch (error) {
      console.error("Errore nel caricamento delle proprietà:", error);
    }
  };

  if (!userPosition) return <p>Caricamento mappa...</p>;

  const filteredProperties = cityFilter
    ? properties.filter(prop => prop.city.toLowerCase().includes(cityFilter.toLowerCase()))
    : properties;

  return (
     <MainLayout>
    <div style={{ height: '100vh', width: '100%' }}>
      <div style={{ padding: '10px', backgroundColor: 'white', zIndex: 1000 }}>
        <CitySearch onChange={handleCityChange} />
      </div>
      <MapContainer center={userPosition} zoom={13} style={{ height: 'calc(100% - 50px)', width: '100%' }} whenCreated={mapInstance => { mapRef.current = mapInstance; }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <FlyToLocation position={userPosition} />
        {filteredProperties.map((prop) => (
          <Marker key={prop.id} position={[prop.latitude, prop.longitude]} icon={markerIcon}>
            <Popup>{`${prop.address}, ${prop.city}`}</Popup>
          </Marker>
        ))}
        <MapEventHandler />
      </MapContainer>
    </div>
    </MainLayout>
  );
};

export default PropertyMap;
