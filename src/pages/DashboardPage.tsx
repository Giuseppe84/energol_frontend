

import { Box, Typography, Grid, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from 'react';

import MainLayout from "../layout/MainLayout";



interface Activity {
  id: number;
  description: string;
  date: string;
  status: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    clients: 0,
    activeWorks: 0,
    pendingPayments: 0,
  });

  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Simulazione caricamento dati statistici
    setStats({
      clients: 14,
      activeWorks: 5,
      pendingPayments: 3,
    });

    // Simulazione dati attività recenti
    setActivities([
      { id: 1, description: 'Pratica #123 aggiornata', date: '2025-07-14', status: 'Completata' },
      { id: 2, description: 'Nuovo cliente aggiunto', date: '2025-07-13', status: 'In corso' },
      { id: 3, description: 'Pagamento #456 in sospeso', date: '2025-07-12', status: 'Da pagare' },
    ]);
  }, []);

  return (
    <MainLayout>
      <Typography variant="h4" gutterBottom>
        Benvenuto nel Portale Lavori
      </Typography>

      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} sm={4} >
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Clienti</Typography>
            <Typography variant="h4">{stats.clients}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Pratiche attive</Typography>
            <Typography variant="h4">{stats.activeWorks}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} >
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Pagamenti da ricevere</Typography>
            <Typography variant="h4">{stats.pendingPayments}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Attività recenti
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small" aria-label="attività recenti">
            <TableHead>
              <TableRow>
                <TableCell>Descrizione</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>{activity.description}</TableCell>
                  <TableCell>{activity.date}</TableCell>
                  <TableCell>{activity.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Azioni rapide
        </Typography>
        <Grid container spacing={2}>
          <Grid item >
            <Button variant="contained" color="primary">Nuova pratica</Button>
          </Grid>
          <Grid item >
            <Button variant="contained" color="secondary">Aggiungi cliente</Button>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
}