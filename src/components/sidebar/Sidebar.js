import React, { Children, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { FaTachometerAlt, FaClipboardList, FaFilter, FaChartBar, FaUsers, FaPencilAlt,FaUserTie, FaUserCircle,FaRegHandshake ,FaChevronDown} from 'react-icons/fa';
import { AiFillProduct } from 'react-icons/ai';
// import { IoPhonePortrait } from "react-icons/io5";
import { RiLogoutBoxFill, RiFileUploadFill } from 'react-icons/ri';
import { IoIosMail } from "react-icons/io";
import { Dialog, DialogTitle, DialogContent, DialogActions,  TextField,Alert } from '@mui/material';
import { MdOutlineDashboard  ,MdTableView,MdOutlineAnalytics,MdOutlineGroups2, MdUploadFile ,MdLogout,MdOutlineBusinessCenter } from "react-icons/md";
import { LuPickaxe, LuTableColumnsSplit } from "react-icons/lu";
import { TbTransactionRupee } from "react-icons/tb";
import config from "../../config.dev.json";
import axios from 'axios';

const backend_url = config.backend_url; 

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
// const UploadModal = ({ open, onClose, title }) => {
//   const [file, setFile] = useState(null);
//   const [message, setmessage] = useState('');

//   const handleUpload = async () => {
//     if (!file) {
//       setmessage("Please select a file.");
//       return;
//     }
//     let url = "";
//     try {
//       if (title === "Tally Transaction") {
//         url = `${backend_url}/tally-transaction/add-tally-transaction`;
//       } else if (title === "Extraction Data") {
//         url = `${backend_url}/extractionData/addExtraction`;
//       } else {
//         setmessage("Incorrect file type");
//         return;
//       }

//       const formData = new FormData();
//       formData.append("file", file);

//       await axios.post(url, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       setmessage("File uploaded successfully!");
//     } catch (err) {
//       console.log(err);
//       setmessage("An error occurred while uploading.");
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose}>
//       <DialogTitle>Upload {title}</DialogTitle>
//       <DialogContent>
//         <TextField
//           fullWidth
//           type="file"
//           onChange={(e) => setFile(e.target.files[0])} // Correct file selection
//           inputProps={{ accept: '.csv, .xml' }}
//           sx={{ my: 2 }}
//         />
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose}>Cancel</Button>
//         <Button variant="contained" onClick={handleUpload}>Upload</Button>
//       </DialogActions>
//       {message && (
//         <Alert severity={message === "File uploaded successfully!" ? "success" : "error"} onClose={() => setmessage('')}>
//           {message}
//         </Alert>
//       )}
//     </Dialog>
//   );
// };

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

  const location = useLocation()
  const handleUploadClick = () => {
    console.log(location)
    if (location.pathname === "/tally-transaction") { 
      setOpen(true); 
    }
    if(setOpen){
      setOpenUpload(!openUpload); // Toggle the dropdown
    }
    if(!setOpen){
      setOpenUpload(false); // Close the dropdown
    }
  };
  // // upload and extract
  // const [openUploadModal, setOpenUploadModal] = useState(false);

  // // Handlers for Open/Close Modals
  // const handleUploadOpen = () => setOpenUploadModal(true);
  // const handleUploadClose = () => setOpenUploadModal(false);

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
        { name: 'Credit Limit', to: '/dealer-credit-limit', icon: <Diversity3Icon /> },
      ],
      // dropdownIcon: < /> 
    },
    { name: 'Extraction', to: '/extraction', icon: <LuPickaxe /> },
    { name: 'Tally Transaction', to:'/tally-transaction', icon:<TbTransactionRupee/> ,onClick:handleUploadClick},
    { name: 'Segment', to: '/segment', icon: <LuTableColumnsSplit /> },
    { name: 'Users', to: '/users', icon: <MdOutlineGroups2 /> },
    { name: 'Employees', to: '/employees', icon: <MdOutlineBusinessCenter />  },
    // { name: 'Employees', to: '/employees', icon: <FaUserTie /> },
    // { name: 'Model', to: '/model', icon: <IoPhonePortrait /> },
    // {
    //   name: 'Upload',
    //   icon: < MdUploadFile />,
    //   onClick: handleUploadClick, // Add click handler to toggle dropdown
    // },
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
