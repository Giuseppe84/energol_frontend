// src/layouts/MainLayout.tsx
import { IconButton, Menu, MenuItem, Avatar, Box, CssBaseline, Drawer, List, ListItem, ListItemText, AppBar, Toolbar, Typography, ListItemButton } from '@mui/material';
import type { ReactNode } from 'react';
import TwoFAToggle from "../components/TwoFAToggle";
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext'; // se hai un context per logout
import { Link as RouterLink, useLocation } from 'react-router-dom';



const drawerWidth = 240;

const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Clienti', path: '/clients' },
    { label: 'Soggetti', path: '/subjects' },
    { label: 'Pratiche', path: '/works' },
    { label: 'Pagamenti', path: '/payments' },
    { label: 'Servizi', path: '/services' },
   { label: 'Immobili', path: '/properties' },
];

type MainLayoutProps = {
    children: ReactNode;
};



export default function MainLayout({ children }: MainLayoutProps) {
    const location = useLocation();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { logout } = useAuth(); // se hai un context

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
    };

    const handleSettings = () => {
        handleMenuClose();
        // naviga a /settings se vuoi
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                        Portale Lavori
                    </Typography>

                    <Box>
                        <IconButton onClick={handleMenuOpen} color="inherit">
                            <Avatar />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <TwoFAToggle />
                            <MenuItem onClick={handleSettings}>Impostazioni</MenuItem>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <List>
                    {navItems.map((item) => (
                        <ListItem key={item.label} disablePadding>
                            <ListItemButton
                                component={RouterLink}
                                to={item.path}
                                selected={location.pathname === item.path}
                            >
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}
