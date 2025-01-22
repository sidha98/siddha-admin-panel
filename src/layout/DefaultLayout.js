import React, { useState } from 'react';
import { AppContent, Sidebar } from '../components/index';
import { styled } from '@mui/material/styles';

const Wrapper = styled('div')(({ theme, open, drawerWidth }) => ({
  display: 'flex',
  alignItems: 'stretch', // Ensure the wrapper spans full height for consistency
  transition: theme.transitions.create(['margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  marginLeft: open ? `${drawerWidth}px` : 0,
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0, // Override margin for smaller screens
    transition: theme.transitions.create(['margin'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
}));

const DefaultLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const drawerWidth = 240; // Match your drawerWidth in Sidebar

  return (
    <div>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <Wrapper open={sidebarOpen} drawerWidth={drawerWidth} >
        <div className="body flex-grow-1">
          <AppContent />
        </div>
      </Wrapper>
    </div>
  );
};

export default DefaultLayout;
