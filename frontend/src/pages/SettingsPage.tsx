import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Alert } from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import OrganizationSettings from '../components/settings/OrganizationSettings';
import UserProfile from '../components/settings/UserProfile';
import ChangePassword from '../components/settings/ChangePassword';
import { usePermissions } from '../hooks/usePermissions';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { hasPermission } = usePermissions();

  const canManageOrganization = hasPermission('organization:update');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      {/* Page Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your organization settings, profile, and security preferences.
        </Typography>
      </Box>

      {/* Info Alert for users without organization permissions */}
      {!canManageOrganization && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You don't have permission to modify organization settings. You can only update your
          personal profile and password.
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="settings tabs">
          {canManageOrganization && (
            <Tab
              icon={<BusinessIcon />}
              iconPosition="start"
              label="Organization"
              id="settings-tab-0"
              aria-controls="settings-tabpanel-0"
            />
          )}
          <Tab
            icon={<PersonIcon />}
            iconPosition="start"
            label="Profile"
            id={`settings-tab-${canManageOrganization ? 1 : 0}`}
            aria-controls={`settings-tabpanel-${canManageOrganization ? 1 : 0}`}
          />
          <Tab
            icon={<LockIcon />}
            iconPosition="start"
            label="Security"
            id={`settings-tab-${canManageOrganization ? 2 : 1}`}
            aria-controls={`settings-tabpanel-${canManageOrganization ? 2 : 1}`}
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {canManageOrganization && (
        <TabPanel value={activeTab} index={0}>
          <OrganizationSettings />
        </TabPanel>
      )}

      <TabPanel value={activeTab} index={canManageOrganization ? 1 : 0}>
        <UserProfile />
      </TabPanel>

      <TabPanel value={activeTab} index={canManageOrganization ? 2 : 1}>
        <ChangePassword />
      </TabPanel>
    </Box>
  );
};

export default SettingsPage;