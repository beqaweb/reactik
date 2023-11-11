import { useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { useServiceHandler } from 'reactik';

import { serviceContainer } from '../services';

export const TodoListPage = () => {
  const todoService = serviceContainer.useService('todoService');
  const userService = serviceContainer.useService('userService');

  const { invoke: invokeWatchTodoList, state: todoListState } =
    useServiceHandler(todoService.watchTodoList);

  const { invoke: invokeGetUsers, state: userListState } = useServiceHandler(
    userService.getUsers,
  );

  useEffect(() => {
    return invokeWatchTodoList('');
  }, [invokeWatchTodoList]);

  useEffect(() => {
    return invokeGetUsers();
  }, [invokeGetUsers]);

  if (todoListState.isLoading || userListState.isLoading) {
    return (
      <Box>
        <CircularProgress />
      </Box>
    );
  }

  console.log(todoListState);

  return (
    <Box>
      <Typography variant="h4">Todo list</Typography>

      <List>
        {todoListState.result?.map((item) => (
          <ListItem key={item.id}>
            <ListItemText>✅ {item.title}</ListItemText>
          </ListItem>
        ))}
      </List>

      <Divider />

      <List>
        {userListState.result?.response?.data.map((item) => (
          <ListItem key={item.id}>
            <ListItemText>
              User: {item.first_name + ' ' + item.last_name}
            </ListItemText>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
