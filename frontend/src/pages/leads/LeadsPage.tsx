import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  ViewList as ListIcon,
  ViewModule as PipelineIcon,
} from '@mui/icons-material';
import { leadsApi } from '../../api/leads';
import { usersApi } from '../../api/users';
import type { Lead, LeadFilters as LeadFiltersType, LeadFormData, User } from '../../types';
import LeadsList from '../../components/leads/LeadsList';
import LeadForm from '../../components/leads/LeadForm';
import LeadFilters from '../../components/leads/LeadFilters';
import { usePermissions } from '../../hooks/usePermissions';

type ViewMode = 'list' | 'pipeline';

const LeadsPage: React.FC = () => {
  const { hasPermission } = usePermissions();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [filters, setFilters] = useState<LeadFiltersType>({
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const canCreate = hasPermission('lead.create');
  const canUpdate = hasPermission('lead.edit.all') || hasPermission('lead.edit.own');
  const canDelete = hasPermission('lead.delete.all') || hasPermission('lead.delete.own');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await leadsApi.getLeads(filters);
      setLeads(response.data);
      setTotal(response.meta?.total || 0);
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to fetch leads', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await usersApi.getUsers({ page: 1, pageSize: 100 });
      // Backend returns { data: { data: [...], pagination: {...} } }
      setUsers(Array.isArray(response.data) ? response.data : (response.data as any).data || []);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCreateClick = () => {
    setSelectedLead(null);
    setFormOpen(true);
  };

  const handleEditClick = (lead: Lead) => {
    if (!canUpdate) {
      showSnackbar('You do not have permission to edit leads', 'error');
      return;
    }
    setSelectedLead(lead);
    setFormOpen(true);
  };

  const handleDeleteClick = (lead: Lead) => {
    if (!canDelete) {
      showSnackbar('You do not have permission to delete leads', 'error');
      return;
    }
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedLead(null);
  };

  const handleFormSubmit = async (data: LeadFormData) => {
    try {
      if (selectedLead) {
        await leadsApi.updateLead(selectedLead.id, data);
        showSnackbar('Lead updated successfully', 'success');
      } else {
        await leadsApi.createLead(data);
        showSnackbar('Lead created successfully', 'success');
      }
      handleFormClose();
      fetchLeads();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to save lead', 'error');
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;

    try {
      await leadsApi.deleteLead(leadToDelete.id);
      showSnackbar('Lead deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
      fetchLeads();
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to delete lead', 'error');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setLeadToDelete(null);
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page: page + 1 });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters({ ...filters, page: 1, pageSize });
  };

  const handleSort = (field: string) => {
    const isAsc = filters.sortBy === field && filters.sortOrder === 'asc';
    setFilters({
      ...filters,
      sortBy: field,
      sortOrder: isAsc ? 'desc' : 'asc',
    });
  };

  const handleFilterChange = (newFilters: LeadFiltersType) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Leads</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="list">
              <ListIcon sx={{ mr: 1 }} />
              List
            </ToggleButton>
            <ToggleButton value="pipeline">
              <PipelineIcon sx={{ mr: 1 }} />
              Pipeline
            </ToggleButton>
          </ToggleButtonGroup>
          {canCreate && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
            >
              Create Lead
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <LeadFilters
            filters={filters}
            users={users}
            onFilterChange={handleFilterChange}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          {viewMode === 'list' ? (
            <LeadsList
              leads={leads}
              total={total}
              page={(filters.page || 1) - 1}
              pageSize={filters.pageSize || 10}
              sortBy={filters.sortBy || 'createdAt'}
              sortOrder={filters.sortOrder || 'desc'}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSort={handleSort}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              loading={loading}
            />
          ) : (
            <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography color="text.secondary">
                Pipeline view coming soon...
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      <LeadForm
        open={formOpen}
        lead={selectedLead}
        users={users}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Lead</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the lead "{leadToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

export default LeadsPage;