// src/components/AddPost.js
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, IconButton } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';

const AddPost = ({ onCancel }) => {
    const [price, setPrice] = useState(1);
    const [visibility, setVisibility] = useState('Public');

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5">Add Post</Typography>
            <TextField
                label="Details of post..."
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                margin="normal"
            />
            <Button variant="contained" startIcon={<ImageIcon />} sx={{ mt: 2 }}>
                Add Media
            </Button>
            <FormControl component="fieldset" sx={{ mt: 2 }}>
                <FormLabel component="legend">Visibility</FormLabel>
                <RadioGroup row value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                    <FormControlLabel value="Public" control={<Radio />} label="Public" />
                    <FormControlLabel value="Private" control={<Radio />} label="Private" />
                </RadioGroup>
            </FormControl>
            <TextField
                label="Price"
                fullWidth
                variant="outlined"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                sx={{ mt: 2 }}
                InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button variant="outlined" onClick={onCancel}>Cancel</Button>
                <Button variant="contained" color="primary">Post</Button>
            </Box>
        </Box>
    );
};

export default AddPost;
