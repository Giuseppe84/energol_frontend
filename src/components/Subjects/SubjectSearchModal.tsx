import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  DialogActions,
  Button,
} from '@mui/material';
import { fetchSubjectsByClient } from '../../api/subjects';

export interface Subject {
  id: string;
  firstName: string;
  lastName: string;
  taxId?: string;
}

interface SubjectSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (subject: Subject) => void;
  clientId: string;
}

export default function SubjectSearchModal({
  open,
  onClose,
  onSelect,
  clientId,
}: SubjectSearchModalProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState('');
console.log('SubjectSearchModal rendered with clientId:', clientId);
  useEffect(() => {
    if (open && clientId) {
      fetchSubjectsByClient(clientId).then(setSubjects);
    } else {
      setSubjects([]);
    }
  }, [open, clientId]);

  const filtered = subjects.filter(s =>
    `${s.lastName} ${s.firstName}`.toLowerCase().includes(search.toLowerCase()) ||
    (s.taxId || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Seleziona Soggetto</DialogTitle>
      <DialogContent>
        <TextField
          value={search}
          onChange={e => setSearch(e.target.value)}
          label="Cerca..."
          fullWidth
          margin="dense"
        />
        <List>
          {filtered.map(s => (
            <ListItem key={s.id} component="button" onClick={() => { onSelect(s); onClose(); }}>
              <ListItemText primary={`${s.lastName} ${s.firstName}`} secondary={s.taxId} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
      </DialogActions>
    </Dialog>
  );
}