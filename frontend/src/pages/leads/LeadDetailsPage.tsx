import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  IconButton,
  Divider,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Source as SourceIcon,
} from '@mui/icons-material';
import { leadsApi } from '../../api/leads';
import { usersApi } from '../../api/users';
import type { Lead, User, LeadFormData } from '../../types';
import { LeadStatus, LeadSource } from '../../types';
import LeadForm from '../../components/leads/LeadForm';
import { usePermissions } from '../../hooks/usePermissions';

const statusColors: Record<LeadStatus, 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'> = {
  [LeadStatus.NEW]: 'info',
  [LeadStatus.QUALIFIED]: 'secondary',
  [LeadStatus.WON]: 'success',
  [LeadStatus.LOST]: 'error',
};

const statusLabels: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'New',
  [LeadStatus.QUALIFIED]: 'Qualified',
  [LeadStatus.WON]: 'Won',
  [LeadStatus.LOST]: 'Lost',
};

const sourceLabels: Record<LeadSource, string> = {
  [LeadSource.WEBSITE]: 'Website',
  [LeadSource.REFERRAL]: 'Referral',
  [LeadSource.ADS]: 'Ads',
  [LeadSource.EVENT]: 'Event',
  [LeadSource.OTHER]: 'Other',
};

const LeadDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const canUpdate = hasPermission('leads:update');
  const canDelete = hasPermission('leads:delete');

  const fetchLead = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const response = await leadsApi.getLead(id);
      setLead(response.data);
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to fetch lead', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersApi.getUsers({ page: 1, pageSize: 100 });
      // Backend returns { data: { data: [...], pagination: {...} } }
      setUsers(Array.isArray(response.data) ? response.data : (response.data as any).data || []);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    fetchLead();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEdit = () => {
    if (!canUpdate) {
      showSnackbar('You do not have permission to edit leads', 'error');
      return;
    }
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!canDelete) {
      showSnackbar('You do not have permission to delete leads', 'error');
      return;
    }

    if (!lead || !window.confirm(`Are you sure you want to delete "${lead.title}"?`)) {
      return;
    }

    try {
      await leadsApi.deleteLead(lead.id);
      showSnackbar('Lead deleted successfully', 'success');
      navigate('/leads');
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to delete lead', 'error');
    }
  };

  const handleFormSubmit = async (data: LeadFormData) => {
    if (!lead) return;

    try {
      await leadsApi.updateLead(lead.id, data);
      showSnackbar('Lead updated successfully', 'success');
      setFormOpen(false);
      fetchLead();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to update lead', 'error');
      throw error;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!lead) {
    return (
      <Box>
        <Alert severity="error">Lead not found</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/leads')} sx={{ mt: 2 }}>
          Back to Leads
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/leads')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">{lead.title}</Typography>
          <Chip
            label={statusLabels[lead.status]}
            color={statusColors[lead.status]}
            size="medium"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canUpdate && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Contact Name
                    </Typography>
                    <Typography variant="body1">{lead.contactName}</Typography>
                  </Box>
                </Box>
              </Grid>
              {lead.email && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">{lead.email}</Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
              {lead.phone && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1">{lead.phone}</Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Company
                    </Typography>
                    <Typography variant="body1">{lead.company}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SourceIcon color="action" />
                <Typography variant="subtitle2" color="text.secondary">
                  Source
                </Typography>
              </Box>
              <Typography variant="body1">{sourceLabels[lead.source]}</Typography>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PersonIcon color="action" />
                <Typography variant="subtitle2" color="text.secondary">
                  Owner
                </Typography>
              </Box>
              {lead.owner ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {lead.owner.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body2">{lead.owner.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {lead.owner.email}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Unassigned
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Created
              </Typography>
              <Typography variant="body2">{formatDate(lead.createdAt)}</Typography>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                Last Updated
              </Typography>
              <Typography variant="body2">{formatDate(lead.updatedAt)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <LeadForm
        open={formOpen}
        lead={lead}
        users={users}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LeadDetailsPage;