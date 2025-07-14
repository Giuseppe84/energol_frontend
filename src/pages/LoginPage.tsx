import {
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const LoginSchema = Yup.object().shape({
  email: Yup.string().required('Username obbligatorio'),
  password: Yup.string().required('Password obbligatoria'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [twoFA, setTwoFA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handle2FAVerification = async (token: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${backendUrl}/auth/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tempToken}`,
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Errore verifica 2FA');
      }

      const data = await response.json();
      login(data.token); // login finale
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={10}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!twoFA ? (
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setError('');
            try {
              const response = await fetch(`${backendUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
              });

              const data = await response.json();
console.log('Login response:', data);
              if (!response.ok) {
                throw new Error(data.message || 'Errore login');
              }

              if (data.user.twoFactorEnabled) {
                setTempToken(data.token);
                setTwoFA(true);
              } else {
                login(data.token); // login normale
                navigate('/');
              }
            } catch (err: any) {
              setError(err.message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, handleChange, errors, touched }) => (
            <Form>
              <TextField
                label="Email"
                name="email"
                fullWidth
                margin="normal"
                value={values.email}
                onChange={handleChange}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                fullWidth
                margin="normal"
                value={values.password}
                onChange={handleChange}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
              />
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
                Login
              </Button>
            </Form>
          )}
        </Formik>
      ) : (
        <Formik
          initialValues={{ token: '' }}
          onSubmit={async ({ token }) => {
            await handle2FAVerification(token);
          }}
        >
          {({ values, handleChange }) => (
            <Form>
              <TextField
                label="Codice 2FA"
                name="token"
                fullWidth
                margin="normal"
                value={values.token}
                onChange={handleChange}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Verifica'}
              </Button>
            </Form>
          )}
        </Formik>
      )}
    </Box>
  );
}