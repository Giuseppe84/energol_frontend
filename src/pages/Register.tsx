import React from 'react';
import { Box, Button, TextField, Typography, Container } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required('Il nome è obbligatorio'),
  email: Yup.string().email('Email non valida').required('L\'email è obbligatoria'),
  password: Yup.string().min(6, 'Minimo 6 caratteri').required('La password è obbligatoria'),
  roleName: Yup.string().oneOf(['USER'], 'Ruolo non valido').required('Il ruolo è obbligatorio'),
});

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (values: any, { setSubmitting, setErrors }: any) => {
    try {
      const response = await fetch(`${backendUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        navigate('/login');
      } else {
        const data = await response.json();
        setErrors({ email: data.message || 'Registrazione fallita' });
      }
    } catch (error) {
      console.error('Errore durante la registrazione:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Registrazione
        </Typography>
        <Formik
          initialValues={{ name: '', email: '', password: '', roleName: 'USER' }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <Field
                as={TextField}
                name="name"
                label="Nome"
                fullWidth
                margin="normal"
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />
              <Field
                as={TextField}
                name="email"
                label="Email"
                fullWidth
                margin="normal"
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
              />
              <Field
                as={TextField}
                name="password"
                type="password"
                label="Password"
                fullWidth
                margin="normal"
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                sx={{ mt: 2 }}
              >
                Registrati
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default RegisterPage;