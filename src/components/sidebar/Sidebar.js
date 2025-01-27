import React, { Children, useState } from 'react';
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
import Diversity3Icon from '@mui/icons-material/Diversity3';
import { Button } from '@mui/material'; // Added Button component
import { FaTachometerAlt, FaClipboardList, FaFilter, FaChartBar, FaUsers, FaPencilAlt, FaUserCircle, FaRegHandshake } from 'react-icons/fa';
import { AiFillProduct } from 'react-icons/ai';
// import { IoPhonePortrait } from "react-icons/io5";
import { RiLogoutBoxFill, RiFileUploadFill } from 'react-icons/ri';
import { IoIosMail } from "react-icons/io";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { MdOutlineDashboard, MdTableView, MdOutlineAnalytics, MdOutlineGroups2, MdUploadFile, MdLogout } from "react-icons/md";
import { LuPickaxe, LuTableColumnsSplit } from "react-icons/lu";

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
  const [openDealerDash, setOpenDealerDash] = useState(false); // State for Dealer Dash
  const [openUpload, setOpenUpload] = useState(false); // State for Upload dropdown
  const navigate = useNavigate();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const toggleDealerDash = () => {
    setOpenDealerDash((prev) => !prev); // Toggle Dealer Dash dropdown
  };

  const handleUploadClick = () => {
    setOpen(true);
    setOpenUpload(!openUpload); // Toggle Upload dropdown
  };

  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: <MdOutlineDashboard /> },
    { name: 'Orders', to: '/orders', icon: <MdTableView /> },
    { name: 'Sales Data', to: '/salesData', icon: <MdOutlineAnalytics /> },
    {
      name: 'Dealer Dash',
      icon: <MdOutlineAnalytics />,
      onClick: toggleDealerDash, // Add toggle handler
      children: [
        { name: 'Dealers', to: '/dealers', icon: <FaRegHandshake /> },
        { name: 'OBM', to: '/dealertsewise', icon: <Diversity3Icon /> },
        { name: 'Credit Limit', to: '/dealertsewise', icon: <Diversity3Icon /> },
      ],
      // dropdownIcon: < /> 
    },
    { name: 'Extraction', to: '/extraction', icon: <LuPickaxe /> },
    { name: 'Segment', to: '/segment', icon: <LuTableColumnsSplit /> },
    { name: 'Users', to: '/users', icon: <MdOutlineGroups2 /> },
    {
      name: 'Upload',
      icon: <MdUploadFile />,
      onClick: handleUploadClick, // Add click handler for Upload
    },
    {
      name: 'Logout',
      icon: <MdLogout />,
      action: () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
      },
    },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} sx={{ backgroundColor: '#ffffff', color: '#000000', boxShadow: 'none', borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <div style={{ fontSize: '25px', ...(open && { display: 'none' }), marginLeft: '-10px' }}>SA</div>
          <IconButton
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginLeft: 1,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="h6" noWrap component="div" sx={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'gray' }}>
            <Link to="/messages" style={{ color: 'inherit', textDecoration: 'none' }}>
              <IoIosMail style={{ fontSize: '24px' }} />
            </Link>
            <Link to="/profile" style={{ color: 'inherit', textDecoration: 'none' }}>
              <FaUserCircle style={{ fontSize: '24px' }} />
            </Link>
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <div style={{ fontSize: '25px' }}>Siddha Admin</div>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {navItems.map((item, index) => (
            <React.Fragment key={index}>
              <ListItem disablePadding sx={{ display: 'block' }}>
                <Tooltip title={item.name} arrow placement="right">
                  <ListItemButton
                    component={item.action || item.children ? undefined : Link}
                    to={item.to}
                    onClick={item.onClick || item.action}
                    sx={{
                      fontSize: 21,
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
                    <ListItemText primary={item.name} sx={{ opacity: open ? 1 : 0 }} />
                  </ListItemButton>
                </Tooltip>
              </ListItem>
              {item.children && (
                <Collapse in={openDealerDash} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child, childIndex) => (
                      <ListItemButton key={childIndex} component={Link} to={child.to} sx={{ pl: 4 }}>
                        <ListItemIcon>{child.icon}</ListItemIcon>
                        <ListItemText primary={child.name} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
      </Box>
    </Box>
  );
};

export default MiniDrawer;
