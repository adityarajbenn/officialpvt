// src/components/Header.js
import React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AddBoxIcon from '@mui/icons-material/AddBox';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Header = ({ onAddPostClick }) => {
    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" color="inherit">
                    <HomeIcon />
                </IconButton>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                    My Profile
                </Typography>
                <IconButton color="inherit" onClick={onAddPostClick}>
                    <AddBoxIcon />
                </IconButton>
                <IconButton color="inherit">
                    <NotificationsIcon />
                </IconButton>
                <IconButton color="inherit">
                    <AccountCircleIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
