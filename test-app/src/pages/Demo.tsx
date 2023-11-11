import { useCallback, useEffect, useRef } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useServiceHandler } from 'reactik';

import { serviceContainer } from '../services';

const FileUpload = () => {
  const fileService = serviceContainer.useService('fileService');
  const { invoke: uploadFile, state: uploadState } = useServiceHandler(
    fileService.uploadFile,
  );

  useEffect(() => {}, []);

  return <Box></Box>;
};

export const Demo = () => {
  return (
    <Box>
      <FileUpload />
    </Box>
  );
};
