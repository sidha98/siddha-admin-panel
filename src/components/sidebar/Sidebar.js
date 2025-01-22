import React, { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import { Button } from '@mui/material'; // Added Button component
import { FaTachometerAlt, FaClipboardList, FaFilter, FaChartBar, FaUsers, FaPencilAlt, FaUserCircle,FaRegHandshake } from 'react-icons/fa';
import { AiFillProduct } from 'react-icons/ai';
// import { IoPhonePortrait } from "react-icons/io5";
import { RiLogoutBoxFill, RiFileUploadFill } from 'react-icons/ri';
import { IoIosMail } from "react-icons/io";
import { Dialog, DialogTitle, DialogContent, DialogActions,  TextField } from '@mui/material';
import { MdOutlineDashboard  ,MdTableView,MdOutlineAnalytics,MdOutlineGroups2, MdUploadFile ,MdLogout} from "react-icons/md";
import { LuPickaxe,LuTableColumnsSplit } from "react-icons/lu";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  })
);
const UploadModal = ({ open, onClose, title }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          type="file"
          // inputProps={{ accept: '.csv, .xlsx, .xls' }}
          sx={{ my: 2 }}
        />
        <TextField
          fullWidth
          label="Description"
          multiline
          rows={3}
          sx={{ my: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained">Upload</Button>
      </DialogActions>
    </Dialog>
  );
};

const MiniDrawer = ({ open, setOpen }) => {
  const theme = useTheme();
  // const [open, setOpen] = React.useState(false);
  const [openUpload, setOpenUpload] = useState(false); // State for managing the dropdown
  const navigate = useNavigate();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleUploadClick = () => {
    setOpen(true)
    setOpenUpload(!openUpload); // Toggle the dropdown
  };

  // const navItems = [
  //   { name: 'Dashboard', to: '/dashboard', icon: <FaTachometerAlt /> },
  //   { name: 'Orders', to: '/orders', icon: <FaClipboardList /> },
  //   { name: 'Sales Data', to: '/salesData', icon: <FaChartBar /> },
  //   { name: 'Dealers', to: '/dealers', icon: <FaPencilAlt /> },
  //   { name: 'Extraction', to: '/extraction', icon: <FaFilter /> },
  //   { name: 'Segment', to: '/segment', icon: <AiFillProduct /> },
  //   { name: 'Users', to: '/users', icon: <FaUsers /> },
  //   // { name: 'Model', to: '/model', icon: <IoPhonePortrait /> },
  //   {
  //     name: 'Upload',
  //     icon: <RiFileUploadFill />,
  //     onClick: handleUploadClick, // Add click handler to toggle dropdown
  //   },
  //   // { name: 'Profile', to: '/profile', icon: <FaUserCircle /> },
  //   {
  //     name: 'Logout',
  //     icon: <RiLogoutBoxFill />,
  //     action: () => {
  //       localStorage.removeItem('isAuthenticated'); 
  //       navigate('/login'); 
  //     },
  //   },
  // ];
  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: <MdOutlineDashboard  /> },
    { name: 'Orders', to: '/orders', icon: <MdTableView /> },
    { name: 'Sales Data', to: '/salesData', icon: <MdOutlineAnalytics /> },
    { name: 'Dealers', to: '/dealers', icon: <FaRegHandshake /> },
    { name: 'Extraction', to: '/extraction', icon: <LuPickaxe/> },
    { name: 'Segment', to: '/segment', icon: <LuTableColumnsSplit /> },
    { name: 'Users', to: '/users', icon: <MdOutlineGroups2 /> },
    // { name: 'Model', to: '/model', icon: <IoPhonePortrait /> },
    {
      name: 'Upload',
      icon: < MdUploadFile />,
      onClick: handleUploadClick, // Add click handler to toggle dropdown
    },
    // { name: 'Profile', to: '/profile', icon: <FaUserCircle /> },
    {
      name: 'Logout',
      icon: <MdLogout />,
      action: () => {
        localStorage.removeItem('isAuthenticated'); 
        navigate('/login'); 
      },
    },
  ];

  // upload and extract
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openExtractModal, setOpenExtractModal] = useState(false);

  // Handlers for Open/Close Modals
  const handleUploadOpen = () => setOpenUploadModal(true);
  const handleUploadClose = () => setOpenUploadModal(false);

  const handleExtractOpen = () => setOpenExtractModal(true);
  const handleExtractClose = () => setOpenExtractModal(false);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}
      sx={{
        backgroundColor: '#ffffff', // Set background to white
        color: '#000000', // Set text color to black
        boxShadow: 'none', // Optional: remove shadow for a flat appearance
        borderBottom: '1px solid #e0e0e0', // Optional: subtle border for separation
      }}>
        <Toolbar>
        <div style={{fontSize:"25px",
          ...(open && { display: 'none' }),
          marginLeft:"-10px"
        }}>SA</div>
          <IconButton
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginLeft:1,
              // marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
            </IconButton>          
          {/* This Box ensures the spacing */}
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="h6" noWrap component="div" sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px', // Adds spacing between the icons
            color: 'gray', // Sets the color to gray
          }}>
          <Link to="/messages" style={{ color: 'inherit', textDecoration: 'none' }}>
            <IoIosMail style={{ fontSize: '24px' }} />
          </Link>
        
          {/* User Profile Icon with Link */}
          <Link to="/profile" style={{ color: 'inherit', textDecoration: 'none' }}>
            <FaUserCircle style={{ fontSize: '24px' }} />
          </Link>
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
        <div style={{fontSize:"25px"}}>Siddha Admin</div>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {navItems.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
              <Tooltip title={item.name} arrow placement="right">
                <ListItemButton
                  component={item.action ? undefined : Link} // Only add Link for navigation
                  to={item.to} // Use 'to' only if navigation is present
                  onClick={item.onClick || item.action} // Use onClick for dropdown toggle or logout action
                  sx={{
                    fontSize:21,
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.name}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </Tooltip>
              {/* Show dropdown for Upload */}
              {item.name === 'Upload' && (
                <Collapse in={openUpload} timeout="auto" unmountOnExit >
                  <List component="div" disablePadding sx={{...(!open && { display: 'none' })}}>
                  <ListItemButton component="div" sx={{ px: 2.5 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleUploadOpen} // Open upload modal
                  >
                    Tally Transaction
                  </Button>
                </ListItemButton>
                <ListItemButton component="div" sx={{ px: 2.5 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleExtractOpen} // Open extraction modal
                  >
                    Extraction Data
                  </Button>
                </ListItemButton>
                  </List>
                  <UploadModal
                      open={openUploadModal}
                      onClose={handleUploadClose}
                      title="Upload Tally Transaction"
                      
                    />
                    <UploadModal
                      open={openExtractModal}
                      onClose={handleExtractClose}
                      title="Upload Extraction Data"
                    />
                </Collapse>
                
              )}
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {/* Main content goes here */}
      </Box>
    </Box>
  );
};

export default MiniDrawer;
