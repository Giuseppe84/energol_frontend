

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  ListItemButton,
} from "@mui/material";
import { fetchClients } from "../../api/clients";

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  // ...other properties
};

interface ClientSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (client: Client) => void;
}

const ClientSearchModal: React.FC<ClientSearchModalProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchClients()
        .then((data: Client[]) => {
          setClients(data);
          setFilteredClients(data);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  useEffect(() => {
    if (!search) {
      setFilteredClients(clients);
    } else {
      const s = search.toLowerCase();
      setFilteredClients(
        clients.filter(
          (c) =>
            c.firstName.toLowerCase().includes(s) ||
            c.lastName.toLowerCase().includes(s) ||
            c.email.toLowerCase().includes(s)
        )
      );
    }
  }, [search, clients]);

  const handleSelect = (client: Client) => {
    onSelect(client);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Seleziona un cliente</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Cerca per nome, cognome o email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          margin="normal"
        />
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", margin: 24 }}>
            <CircularProgress />
          </div>
        ) : (
          <List>
            {filteredClients.map((client: Client) => (
              <ListItem
                key={client.id}
                disablePadding
              >
                <ListItemButton onClick={() => handleSelect(client)}>
                  <ListItemText
                    primary={`${client.firstName} ${client.lastName}`}
                    secondary={client.email}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {!loading && filteredClients.length === 0 && (
              <ListItem>
                <ListItemText primary="Nessun cliente trovato." />
              </ListItem>
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientSearchModal;