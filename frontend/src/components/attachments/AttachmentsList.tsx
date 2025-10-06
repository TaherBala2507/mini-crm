import React, { useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentsApi } from '../../api/attachments';
import type { Attachment } from '../../types';
import { format } from 'date-fns';

interface AttachmentsListProps {
  entityType: 'Lead' | 'Project' | 'Task';
  entityId: string;
  canUpload?: boolean;
  canDelete?: boolean;
}

const AttachmentsList: React.FC<AttachmentsListProps> = ({
  entityType,
  entityId,
  canUpload = true,
  canDelete = true,
}) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(false);

  // Fetch attachments
  const { data, isLoading, error } = useQuery({
    queryKey: ['attachments', entityType, entityId],
    queryFn: () => attachmentsApi.getAttachments(entityType, entityId),
  });

  const attachments = data?.data?.items || [];

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 1) {
        return await attachmentsApi.uploadAttachment(fileArray[0], entityType, entityId);
      } else {
        // For multiple files, return the first one to match the type
        const result = await attachmentsApi.uploadMultipleAttachments(fileArray, entityType, entityId);
        return { ...result, data: result.data[0] };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', entityType, entityId] });
      setUploadProgress(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: () => {
      setUploadProgress(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => attachmentsApi.deleteAttachment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', entityType, entityId] });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploadProgress(true);
      uploadMutation.mutate(files);
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const blob = await attachmentsApi.downloadAttachment(attachment.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const handleDelete = (id: string, filename: string) => {
    if (window.confirm(`Are you sure you want to delete "${filename}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon />;
    } else if (mimeType === 'application/pdf') {
      return <PdfIcon />;
    } else if (
      mimeType.includes('word') ||
      mimeType.includes('document') ||
      mimeType.includes('text')
    ) {
      return <DocIcon />;
    }
    return <FileIcon />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
        Failed to load attachments. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Attachments ({attachments.length})</Typography>
        {canUpload && (
          <Box>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              disabled={uploadMutation.isPending}
            />
            <Button
              startIcon={<UploadIcon />}
              variant="contained"
              size="small"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
            >
              Upload Files
            </Button>
          </Box>
        )}
      </Box>

      {/* Upload Progress */}
      {uploadProgress && (
        <Box mb={2}>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Uploading files...
          </Typography>
        </Box>
      )}

      {/* Upload Error */}
      {uploadMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to upload files. Please try again.
        </Alert>
      )}

      {/* Attachments List */}
      {attachments.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No attachments yet. {canUpload && 'Upload your first file above.'}
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <List>
            {attachments.map((attachment: Attachment, index: number) => (
              <React.Fragment key={attachment.id}>
                <ListItem>
                  <ListItemIcon>
                    {getFileIcon(attachment.mimeType)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">
                          {attachment.originalName}
                        </Typography>
                        <Chip
                          label={formatFileSize(attachment.size)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        Uploaded by {attachment.uploadedBy?.name || 'Unknown'} on{' '}
                        {format(new Date(attachment.createdAt), 'MMM dd, yyyy HH:mm')}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleDownload(attachment)}
                      sx={{ mr: 1 }}
                    >
                      <DownloadIcon />
                    </IconButton>
                    {canDelete && (
                      <IconButton
                        edge="end"
                        onClick={() => handleDelete(attachment.id, attachment.originalName)}
                        disabled={deleteMutation.isPending}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
                {index < attachments.length - 1 && <Box component="li" sx={{ borderBottom: 1, borderColor: 'divider' }} />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default AttachmentsList;