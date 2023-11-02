import { useModal } from 'reactik';
import { Box, Button } from '@mui/material';

import { AlertModal } from '../modals/AlertModal';

export const ModalsPage = () => {
  const alertDialog = useModal(AlertModal, {
    // `data` should be type of AlertModalData
    data: {
      confirmText: 'Agree',
      dismissText: 'Disagree',
    },
  });

  const handleAlertOpenRequest = () => {
    // opens the alert modal and waits for result using promise

    // optionally `data` can be passed here, which will override the data
    // passed in `useModal` hook call above
    const data = {
      confirmText: 'Allow',
      dismissText: 'Cancel',
    };

    alertDialog.controls.open(data).then((result) => {
      // `result` here will automatically be typed as AlertModalResult | undefined
      if (result === 'Y') {
        // Clicked Allow
      } else if (result === 'N') {
        // Clicked Cancel
      } else {
        // if undefined, it means modal was dismissed
      }
    });
  };

  return (
    <Box>
      <Button onClick={handleAlertOpenRequest}>
        Request location permissions
      </Button>
    </Box>
  );
};
