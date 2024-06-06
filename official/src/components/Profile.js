// src/components/Profile.js
import React from 'react';
import { Box, TextField, Button, IconButton, Avatar, Typography, Grid } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ShareIcon from '@mui/icons-material/Share';

const Profile = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 56, height: 56 }}>
                    <IconButton component="label">
                        <PhotoCamera />
                        <input hidden accept="image/*" type="file" />
                    </IconButton>
                </Avatar>
                <Typography variant="h6" sx={{ ml: 2 }}>
                    adityatech
                </Typography>
            </Box>
            <TextField
                label="Bio"
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                placeholder="Upto 75 characters..."
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Typography variant="body1">My Official Link:</Typography>
                <TextField
                    variant="outlined"
                    value="official.me/adityaraj"
                    sx={{ ml: 1, flex: 1 }}
                    InputProps={{
                        readOnly: true,
                    }}
                />
                <IconButton sx={{ ml: 1 }}>
                    <FileCopyIcon />
                </IconButton>
                <IconButton>
                    <ShareIcon />
                </IconButton>
            </Box>
            <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField label="Name" fullWidth variant="outlined" value="adityatech" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label="Email" fullWidth variant="outlined" value="adityarajbenn@gmail.com" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label="Twitter" fullWidth variant="outlined" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label="Facebook" fullWidth variant="outlined" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label="Instagram" fullWidth variant="outlined" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label="LinkedIn" fullWidth variant="outlined" />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Profile;
