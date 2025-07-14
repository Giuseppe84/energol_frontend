// src/components/TwoFAToggle.tsx
import { useEffect, useState } from "react";
import { Switch, FormControlLabel, CircularProgress, Box } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const backendUrl = import.meta.env.VITE_BACKEND_URL;
const token = localStorage.getItem('token');

const TwoFAToggle = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /*
  router.post('/register', register);
  router.post('/login', login);
  router.post('/2fa/setup', authenticate, enable2FA);
  router.post('/2fa/verify', authenticate, verify2FA);
  router.get("/2fa/status", authenticate, get2FAStatus);
  router.get("/2fa/generate", authenticate, generate2FASecret);
  router.post("/2fa/disable", authenticate, disable2FA);
  
  */


  useEffect(() => {
    axios
      .get(`${backendUrl}/auth/2fa/status`, {
     
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        setEnabled(res.data.enabled);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setEnabled(newValue);

    try {
      if (newValue) {
        const res = await axios.get(`${backendUrl}/auth/2fa/generate`, {  headers: {
          Authorization: `Bearer ${token}`
        }});
        navigate("/enable2FA", { state: { qrCode: res.data.qrCode } });
      } else {
        await axios.post(`${backendUrl}/auth/2fa/disable`, {}, {   headers: {
          Authorization: `Bearer ${token}`
        } });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Axios Error:", err.message, err.code, err.config?.url);
      } else {
        console.error("Generic Error:", err);
      }
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box mt={2}>
      <FormControlLabel
        control={<Switch checked={enabled} onChange={handleChange} color="primary" />}
        label="Autenticazione a due fattori (2FA)"
      />
    </Box>
  );
};

export default TwoFAToggle;