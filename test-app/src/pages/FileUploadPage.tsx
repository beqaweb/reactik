import { useCallback } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useServiceHandler } from 'reactik';

import { serviceContainer } from '../services';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export const FileUploadPage = () => {
  const fileService = serviceContainer.useService('fileService');

  const { invoke: invokeUploadFile, state: fileUploadState } =
    useServiceHandler(fileService.uploadFile);

  const handleFileUpload = useCallback(
    (file: File) => {
      return invokeUploadFile(file);
    },
    [invokeUploadFile],
  );

  if (fileUploadState.isLoading) {
    return (
      <Box>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4">File upload</Typography>

      <Box sx={{ py: 2 }}>
        <Button component="label" variant="contained">
          Choose a file
          <VisuallyHiddenInput
            type="file"
            onChange={(ev) => {
              if (ev.currentTarget.files && ev.currentTarget.files[0]) {
                handleFileUpload(ev.currentTarget.files[0]);
              }
            }}
          />
        </Button>
      </Box>
    </Box>
  );
};
