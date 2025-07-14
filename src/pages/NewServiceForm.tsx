// src/pages/NewServiceForm.tsx
import { Box, Button, Container, TextField, Typography } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const ServiceSchema = Yup.object().shape({
  description: Yup.string().required('Required'),
  date: Yup.date().required('Required'),
  amount: Yup.number().required('Required').positive(),
});

export default function NewServiceForm() {
  return (
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom>New Service</Typography>
      <Formik
        initialValues={{ description: '', date: '', amount: '' }}
        validationSchema={ServiceSchema}
        onSubmit={(values) => {
          console.log('Submit:', values);
          // Qui puoi fare una chiamata API POST
        }}
      >
        {({ errors, touched, handleChange }) => (
          <Form>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                name="description"
                label="Description"
                onChange={handleChange}
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
              />
              <TextField
                name="date"
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                onChange={handleChange}
                error={touched.date && Boolean(errors.date)}
                helperText={touched.date && errors.date}
              />
              <TextField
                name="amount"
                label="Amount"
                type="number"
                onChange={handleChange}
                error={touched.amount && Boolean(errors.amount)}
                helperText={touched.amount && errors.amount}
              />
              <Button type="submit" variant="contained" color="primary">Submit</Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Container>
  );
}