import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Divider,
} from '@mui/material';
import {
  Dashboard,
  People,
  Business,
  Assignment,
  Person,
  Security,
} from '@mui/icons-material';
import { usePermissions } from '../../hooks/usePermissions';

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

interface NavItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  permission?: string | string[]; // Can be a single permission or array of permissions (any match)
}

const navItems: NavItem[] = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Leads', icon: <People />, path: '/leads', permission: ['lead.view.all', 'lead.view.own'] },
  { text: 'Projects', icon: <Business />, path: '/projects', permission: 'project.view' },
  { text: 'Tasks', icon: <Assignment />, path: '/tasks', permission: 'task.view' },
  { text: 'Users', icon: <Person />, path: '/users', permission: 'user.view' },
  { text: 'Roles', icon: <Security />, path: '/roles', permission: 'role.manage' },
];

const Sidebar: React.FC<SidebarProps> = ({ drawerWidth, mobileOpen, onDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = usePermissions();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (mobileOpen) {
      onDrawerToggle();
    }
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Business color="primary" />
          <ListItemText
            primary="Mini CRM"
            primaryTypographyProps={{ fontWeight: 'bold', variant: 'h6' }}
          />
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => {
          // Check permission if required
          if (item.permission) {
            const hasRequiredPermission = Array.isArray(item.permission)
              ? item.permission.some((perm) => hasPermission(perm))
              : hasPermission(item.permission);
            
            if (!hasRequiredPermission) {
              return null;
            }
          }

          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;