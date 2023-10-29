import { useEffect, useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
} from '@mui/material';

import { serviceContainer } from './services';
import { Friend } from './services/FriendService';

function nameToChildren(name: string) {
  return name.split(' ').map((item) => item[0]);
}

export function App() {
  const [todos, setTodos] = useState<Friend[]>([]);

  const friendService = serviceContainer.useService('friendService');

  useEffect(() => {
    friendService.getFriendList().then((res) => {
      setTodos(res.items);
    });
  }, []);

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
    </Box>
  );
}
