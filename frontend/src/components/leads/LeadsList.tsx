import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Avatar,
  Box,
  Typography,
  Tooltip,
  TablePagination,
  TableSortLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import type { Lead } from '../../types';
import { LeadStatus, LeadSource } from '../../types';
import { useNavigate } from 'react-router-dom';

interface LeadsListProps {
  leads: Lead[];
  total: number;
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSort: (field: string) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  loading?: boolean;
}

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

const LeadsList: React.FC<LeadsListProps> = ({
  leads,
  total,
  page,
  pageSize,
  sortBy,
  sortOrder,
  onPageChange,
  onPageSizeChange,
  onSort,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const navigate = useNavigate();

  const handleSort = (field: string) => {
    onSort(field);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Loading leads...</Typography>
      </Box>
    );
  }

  if (leads.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No leads found. Create your first lead to get started!
        </Typography>
      </Box>
    );
  }

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'title'}
                  direction={sortBy === 'title' ? sortOrder : 'asc'}
                  onClick={() => handleSort('title')}
                >
                  Title
                </TableSortLabel>
              </TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'status'}
                  direction={sortBy === 'status' ? sortOrder : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'createdAt'}
                  direction={sortBy === 'createdAt' ? sortOrder : 'asc'}
                  onClick={() => handleSort('createdAt')}
                >
                  Created
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {lead.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {lead.company}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.875rem' }}>
                      {lead.contactName}
                    </Typography>
                    {lead.email && (
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {lead.email}
                      </Typography>
                    )}
                    {lead.phone && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {lead.phone}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={statusLabels[lead.status]}
                    color={statusColors[lead.status]}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {sourceLabels[lead.source]}
                  </Typography>
                </TableCell>
                <TableCell>
                  {lead.owner ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        {lead.owner.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {lead.owner.name}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Unassigned
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {formatDate(lead.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/leads/${lead.id}`)}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(lead)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(lead)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Paper>
  );
};

export default LeadsList;