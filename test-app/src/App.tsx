import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Divider,
  Button,
} from '@mui/material';
import { useModal } from 'reactik';

import { serviceContainer } from './services';
import { Friend } from './services/FriendService';
import { AlertModal } from './modals/AlertModal';

function nameToChildren(name: string) {
  return name.split(' ').map((item) => item[0]);
}

export function App() {
  const alertDialog = useModal(AlertModal, {
    data: {
      confirmText: 'Agree',
      dismissText: 'Disagree',
    },
  });

  const [todos, setTodos] = useState<Friend[]>([]);

  const friendService = serviceContainer.useService('friendService');

  useEffect(() => {
    friendService.getFriendList().then((res) => {
      setTodos(res.items);
    });
  }, []);

  const handleAlertOpen = useCallback(() => {
    alertDialog.controls.open().then((result) => {
      console.log(result);
    });
  }, [alertDialog.controls]);

  return (
    <Box>
      <Typography variant="h4">Reactik app</Typography>
      <List>
        {todos.map((item) => (
          <ListItem key={item.id}>
            <ListItemAvatar>
              <Avatar>{nameToChildren(item.name)}</Avatar>
            </ListItemAvatar>
            <ListItemText>{item.name}</ListItemText>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Button onClick={handleAlertOpen}>Open alert dialog</Button>
    </Box>
  );
}
