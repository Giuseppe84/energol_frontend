// src/pages/Profile.tsx
import { Box, Typography } from "@mui/material";
import TwoFAToggle from "../components/TwoFAToggle";

const Profile = () => {
  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      <Typography variant="h4" gutterBottom>
        Profilo utente
      </Typography>
      {/* Altri dati profilo */}
      <TwoFAToggle />
    </Box>
  );
};

export default Profile;