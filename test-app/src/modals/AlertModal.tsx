import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { ModalProps } from 'reactik';

type AlertModalData = {
  confirmText: string;
  dismissText: string;
};

type AlertModalResult = boolean;

export const AlertModal = ({
  modalProps,
  data,
  close,
}: ModalProps<AlertModalData, AlertModalResult>) => {
  return (
    <Dialog
      open={modalProps.open}
      onClose={() => close()}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Use Google's location service?
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Let Google help apps determine location. This means sending anonymous
          location data to Google, even when no apps are running.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => close(false)}>{data.dismissText}</Button>
        <Button onClick={() => close(true)} autoFocus>
          {data.confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
