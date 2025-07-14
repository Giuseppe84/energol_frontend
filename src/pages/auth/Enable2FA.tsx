// src/pages/auth/Enable2FA.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
  
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const token = localStorage.getItem('token');

const Enable2FA = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${backendUrl}/auth/2fa/generate`, {    headers: {
          Authorization: `Bearer ${token}`
        }})
      .then((res) => setQrCode(res.data.qrCode))
      .catch((err) => console.error(err));
  }, []);

  return (
    <Box textAlign="center" mt={4}>
      <Typography variant="h5">Abilita Autenticazione a 2 Fattori</Typography>
      {qrCode && (
        <>
          <img src={qrCode} alt="QR Code" style={{ marginTop: 16 }} />
          <Typography variant="body1" mt={2}>
            Scansiona con Google Authenticator e clicca su "Verifica"
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(`/verify2fa`)}
            sx={{ mt: 2 }}
          >
            Verifica
          </Button>
        </>
      )}
    </Box>
  );
};

export default Enable2FA;
