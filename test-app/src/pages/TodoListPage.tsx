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

  const [invokeWatchTodoList, todoListState] = useServiceHandler(
    todoService.watchTodoList,
  );

  const [invokeGetUsers, userListState] = useServiceHandler(
    userService.getUsers,
  );

  const [invokeGetFirstUser, firstUserState] = useServiceHandler(
    userService.getFirstUser,
  );

  // useEffect(() => {
  //   return invokeWatchTodoList('');
  // }, [invokeWatchTodoList]);

  // useEffect(() => {
  //   return invokeGetUsers();
  // }, [invokeGetUsers]);

  // useEffect(() => {
  //   return invokeGetFirstUser();
  // }, [invokeGetFirstUser]);

  // console.log(firstUserState);

  if (todoListState.isLoading || userListState.isLoading) {
    return (
      <Box>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4">Todo list</Typography>

      <List>
        {todoListState.response?.map((item) => (
          <ListItem key={item.id}>
            <ListItemText>✅ {item.title}</ListItemText>
          </ListItem>
        ))}
      </List>

      <Divider />

      <List>
        {userListState.response?.data.map((item) => (
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
