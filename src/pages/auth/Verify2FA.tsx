// src/pages/auth/Verify2FA.tsx
import { Box, TextField, Button, Typography } from "@mui/material";
import { Formik, Form, Field } from "formik";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const token = localStorage.getItem('token');
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Verify2FA = () => {
  const navigate = useNavigate();

  return (
    <Box maxWidth={400} mx="auto" mt={4}>
      <Typography variant="h6" mb={2}>
        Inserisci il codice di 6 cifre
      </Typography>
      <Formik
        initialValues={{ token: "" }}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await axios.post(
              `${backendUrl}/auth/2fa/verify`,
              { token: values.token },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );
            alert("2FA abilitata!");
            navigate("/");
          } catch (err) {
            alert("Codice non valido");
            console.error(err);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Field
              as={TextField}
              name="token"
              label="Codice"
              fullWidth
              variant="outlined"
              margin="normal"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
            >
              Verifica
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default Verify2FA;