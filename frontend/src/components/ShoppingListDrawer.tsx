'use client';

import React from 'react';
import { Drawer, List, ListItem, ListItemText, Typography, Button } from '@mui/material';

interface ShoppingListDrawerProps {
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const ShoppingListDrawer: React.FC<ShoppingListDrawerProps> = ({ isDrawerOpen, setIsDrawerOpen }) => {
  return (
    <Drawer anchor="right" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
      <div style={{ width: 300, padding: '16px' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Saved Recommendations
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="Example Item 1" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Example Item 2" />
          </ListItem>
        </List>
        <Button variant="contained" color="error" onClick={() => setIsDrawerOpen(false)}>
          Close
        </Button>
      </div>
    </Drawer>
  );
};

export default ShoppingListDrawer;
