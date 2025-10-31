import React, { useState } from 'react';
import axios from 'axios';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Box, Typography } from '@mui/material';

interface CitySearchGeoNamesProps {
  onChange: (cityName: string, lat: number, lng: number) => void;
}

const CitySearchGeoNames: React.FC<CitySearchGeoNamesProps> = ({ onChange }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const handleInputChange = async (event: React.SyntheticEvent, value: string) => {
    setQuery(value);

    if (value.length > 2) {
      try {
        const response = await axios.get('http://api.geonames.org/postalCodeSearchJSON', {
          params: {
            placename_startsWith: value,
            maxRows: 10,
            username: 'giuseppe84',
            country: 'IT',
          },
        });

        const results = (response.data.postalCodes || []).map((item: any) => ({
          postalCode: item.postalCode,
          placeName: item.placeName,
          adminName1: item.adminName1, // Regione
          adminName2: item.adminName2, // Provincia
          adminCode1: item.adminCode1,
          adminCode2: item.adminCode2,
          ISO3166_2: item.ISO3166_2,
          countryCode: item.countryCode,
          lat: item.lat,
          lng: item.lng,
        }));

        setSuggestions(results);
      } catch (error) {
        console.error(error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (event: React.SyntheticEvent, value: any | null) => {
    if (value) {
      setQuery(`${value.placeName}, ${value.adminName2}, ${value.adminName1}`);
      onChange(value.placeName, parseFloat(value.lat), parseFloat(value.lng));
    }
  };

  return (
    <Autocomplete
      freeSolo
      options={suggestions}
      getOptionLabel={(option) =>
        `${option.placeName} (${option.postalCode}), ${option.adminName2}, ${option.adminName1}`
      }
      inputValue={query}
      onInputChange={handleInputChange}
      onChange={handleSelect}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Cerca comune"
          variant="outlined"
          fullWidth
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={`${option.placeName}-${option.postalCode}`}>
          <Box display="flex" alignItems="center">
            <LocationOnIcon color="primary" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {option.placeName} ({option.postalCode})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {option.adminName2 ? `${option.adminName2}, ` : ''}
                {option.adminName1}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Lat: {option.lat}, Lng: {option.lng} • {option.countryCode}
              </Typography>
            </Box>
          </Box>
        </li>
      )}
    />
  );
};

export default CitySearchGeoNames;