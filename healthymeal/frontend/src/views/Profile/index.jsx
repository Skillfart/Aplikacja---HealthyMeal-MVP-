import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Grid, Alert } from '@mui/material';
import { usePreferences } from '../../contexts/PreferencesContext';

const Profile = () => {
  const { preferences, updatePreferences, loading, error } = usePreferences();
  const [formData, setFormData] = useState({
    dietType: preferences?.dietType || 'wszystko',
    maxCarbs: preferences?.maxCarbs || 300,
    excludedProducts: preferences?.excludedProducts?.join(', ') || '',
    allergens: preferences?.allergens?.join(', ') || ''
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const updatedPreferences = {
      ...formData,
      excludedProducts: formData.excludedProducts.split(',').map(item => item.trim()).filter(Boolean),
      allergens: formData.allergens.split(',').map(item => item.trim()).filter(Boolean)
    };

    const success = await updatePreferences(updatedPreferences);
    if (success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profil użytkownika
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Preferencje zostały zaktualizowane
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Typ diety"
                name="dietType"
                value={formData.dietType}
                onChange={handleChange}
                SelectProps={{
                  native: true
                }}
              >
                <option value="wszystko">Wszystko</option>
                <option value="wegetariańska">Wegetariańska</option>
                <option value="wegańska">Wegańska</option>
                <option value="bezglutenowa">Bezglutenowa</option>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Maksymalna ilość węglowodanów (g)"
                name="maxCarbs"
                value={formData.maxCarbs}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Wykluczone produkty (oddzielone przecinkami)"
                name="excludedProducts"
                value={formData.excludedProducts}
                onChange={handleChange}
                helperText="Np.: mleko, jajka, orzechy"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alergeny (oddzielone przecinkami)"
                name="allergens"
                value={formData.allergens}
                onChange={handleChange}
                helperText="Np.: gluten, laktoza"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
              >
                {loading ? 'Zapisywanie...' : 'Zapisz preferencje'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  );
};

export default Profile; 