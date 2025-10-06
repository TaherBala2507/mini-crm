import React, { useState } from 'react';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { projectsApi } from '../../api/projects';
import { usersApi } from '../../api/users';
import type { Project, User } from '../../types';

interface ProjectMembersProps {
  projectId: string;
  project: Project;
}

const ProjectMembers: React.FC<ProjectMembersProps> = ({ projectId, project }) => {
  const queryClient = useQueryClient();
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<User | null>(null);

  // Fetch all users
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers(),
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: (userId: string) => projectsApi.addMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setAddMemberDialogOpen(false);
      setSelectedUserId('');
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => projectsApi.removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setRemoveMemberDialogOpen(false);
      setMemberToRemove(null);
    },
  });

  const handleAddMember = () => {
    if (selectedUserId) {
      addMemberMutation.mutate(selectedUserId);
    }
  };

  const handleRemoveMemberClick = (member: User) => {
    setMemberToRemove(member);
    setRemoveMemberDialogOpen(true);
  };

  const handleRemoveMemberConfirm = () => {
    if (memberToRemove) {
      removeMemberMutation.mutate(memberToRemove.id);
    }
  };

  const users = Array.isArray(usersData?.data) ? usersData.data : [];
  const members = project.members || [];
  const memberIds = members.map((m) => m.id);
  const availableUsers = users.filter((user) => !memberIds.includes(user.id));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Team Members ({members.length})</Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setAddMemberDialogOpen(true)}
          disabled={availableUsers.length === 0}
        >
          Add Member
        </Button>
      </Box>

      {members.length === 0 ? (
        <Alert severity="info">No team members yet. Add members to collaborate on this project.</Alert>
      ) : (
        <List>
          {members.map((member) => (
            <ListItem
              key={member.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  color="error"
                  onClick={() => handleRemoveMemberClick(member)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {member.name.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={member.name}
                secondary={
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {member.email}
                    </Typography>
                    {member.roles && member.roles.length > 0 && (
                      <Chip label={member.roles[0].name} size="small" variant="outlined" />
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Add Member Dialog */}
      <Dialog
        open={addMemberDialogOpen}
        onClose={() => setAddMemberDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Team Member</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {availableUsers.length === 0 ? (
              <Alert severity="info">All users are already members of this project.</Alert>
            ) : (
              <FormControl fullWidth>
                <InputLabel>Select User</InputLabel>
                <Select
                  value={selectedUserId}
                  label="Select User"
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  {availableUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body1">{user.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddMember}
            variant="contained"
            disabled={!selectedUserId || addMemberMutation.isPending}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <Dialog
        open={removeMemberDialogOpen}
        onClose={() => setRemoveMemberDialogOpen(false)}
      >
        <DialogTitle>Remove Team Member</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove {memberToRemove?.name} from this project?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveMemberDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRemoveMemberConfirm}
            color="error"
            variant="contained"
            disabled={removeMemberMutation.isPending}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectMembers;