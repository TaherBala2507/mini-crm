import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  IconButton,
  Avatar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { notesApi } from '../../api/notes';
import type { Note, NoteFormData } from '../../types';

interface ProjectNotesProps {
  projectId: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const ProjectNotes: React.FC<ProjectNotesProps> = ({ projectId }) => {
  const queryClient = useQueryClient();
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  // Fetch notes
  const { data: notesData, isLoading } = useQuery({
    queryKey: ['notes', 'Project', projectId],
    queryFn: () => notesApi.getNotes('Project', projectId),
  });

  // Create note mutation
  const createMutation = useMutation({
    mutationFn: (data: NoteFormData) => notesApi.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', 'Project', projectId] });
      setNewNoteContent('');
    },
  });

  // Update note mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NoteFormData> }) =>
      notesApi.updateNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', 'Project', projectId] });
      setEditingNote(null);
      setEditContent('');
    },
  });

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => notesApi.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', 'Project', projectId] });
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    },
  });

  const handleCreateNote = () => {
    if (newNoteContent.trim()) {
      createMutation.mutate({
        entityType: 'Project',
        entityId: projectId,
        content: newNoteContent,
      });
    }
  };

  const handleEditClick = (note: Note) => {
    setEditingNote(note);
    setEditContent(note.content);
  };

  const handleUpdateNote = () => {
    if (editingNote && editContent.trim()) {
      updateMutation.mutate({
        id: editingNote.id,
        data: { content: editContent, entityType: 'Project', entityId: projectId },
      });
    }
  };

  const handleDeleteClick = (note: Note) => {
    setNoteToDelete(note);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (noteToDelete) {
      deleteMutation.mutate(noteToDelete.id);
    }
  };

  const notes = notesData?.data?.items || [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Add Note Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Add Note
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Write a note..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              disabled={createMutation.isPending}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleCreateNote}
              disabled={!newNoteContent.trim() || createMutation.isPending}
            >
              Post Note
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Notes List */}
      <Typography variant="h6" gutterBottom>
        Notes ({notes.length})
      </Typography>

      {notes.length === 0 ? (
        <Alert severity="info">No notes yet. Add your first note above.</Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {notes.map((note) => (
            <Card key={note.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                      {note.author?.name.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {note.author?.name || 'Unknown User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(note.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleEditClick(note)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteClick(note)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {note.content}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Edit Note Dialog */}
      <Dialog
        open={!!editingNote}
        onClose={() => setEditingNote(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Note</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={5}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingNote(null)}>Cancel</Button>
          <Button
            onClick={handleUpdateNote}
            variant="contained"
            disabled={!editContent.trim() || updateMutation.isPending}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Note</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this note? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectNotes;