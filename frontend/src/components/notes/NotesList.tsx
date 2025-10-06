import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '../../api/notes';
import type { Note } from '../../types';
import { format } from 'date-fns';

interface NotesListProps {
  entityType: 'Lead' | 'Project' | 'Task';
  entityId: string;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

const NotesList: React.FC<NotesListProps> = ({
  entityType,
  entityId,
  canCreate = true,
  canEdit = true,
  canDelete = true,
}) => {
  const queryClient = useQueryClient();
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Fetch notes
  const { data, isLoading, error } = useQuery({
    queryKey: ['notes', entityType, entityId],
    queryFn: () => notesApi.getNotes(entityType, entityId),
  });

  const notes = data?.data?.items || [];

  // Create note mutation
  const createMutation = useMutation({
    mutationFn: (content: string) =>
      notesApi.createNote({
        entityType,
        entityId,
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', entityType, entityId] });
      setNewNoteContent('');
      setIsAddingNote(false);
    },
  });

  // Update note mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      notesApi.updateNote(id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', entityType, entityId] });
      setEditingNoteId(null);
      setEditContent('');
    },
  });

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => notesApi.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', entityType, entityId] });
    },
  });

  const handleCreateNote = () => {
    if (newNoteContent.trim()) {
      createMutation.mutate(newNoteContent);
    }
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = () => {
    if (editingNoteId && editContent.trim()) {
      updateMutation.mutate({ id: editingNoteId, content: editContent });
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load notes. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Notes ({notes.length})</Typography>
        {canCreate && !isAddingNote && (
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            size="small"
            onClick={() => setIsAddingNote(true)}
          >
            Add Note
          </Button>
        )}
      </Box>

      {/* Add Note Form */}
      {isAddingNote && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Write a note..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            disabled={createMutation.isPending}
          />
          <Box display="flex" gap={1} mt={2}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleCreateNote}
              disabled={!newNoteContent.trim() || createMutation.isPending}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setIsAddingNote(false);
                setNewNoteContent('');
              }}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
          </Box>
          {createMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Failed to create note. Please try again.
            </Alert>
          )}
        </Paper>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No notes yet. {canCreate && 'Add your first note above.'}
          </Typography>
        </Paper>
      ) : (
        <Box>
          {notes.map((note: Note) => (
            <React.Fragment key={note.id}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Box display="flex" gap={2}>
                  {/* Avatar */}
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {note.author?.name?.charAt(0) || 'U'}
                  </Avatar>

                  {/* Content */}
                  <Box flex={1}>
                    {/* Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                      <Box>
                        <Typography variant="subtitle2">
                          {note.author?.name || 'Unknown User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm')}
                          {note.updatedAt !== note.createdAt && ' (edited)'}
                        </Typography>
                      </Box>

                      {/* Actions */}
                      {editingNoteId !== note.id && (
                        <Box>
                          {canEdit && (
                            <IconButton
                              size="small"
                              onClick={() => handleStartEdit(note)}
                              disabled={updateMutation.isPending}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                          {canDelete && (
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(note.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      )}
                    </Box>

                    {/* Note Content */}
                    {editingNoteId === note.id ? (
                      <Box>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          disabled={updateMutation.isPending}
                        />
                        <Box display="flex" gap={1} mt={1}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={handleSaveEdit}
                            disabled={!editContent.trim() || updateMutation.isPending}
                          >
                            <SaveIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={handleCancelEdit}
                            disabled={updateMutation.isPending}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {note.content}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            </React.Fragment>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default NotesList;