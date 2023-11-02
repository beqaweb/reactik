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

  const [invokeWatchTodoList, todoListState] = useServiceHandler(
    todoService.watchTodoList,
  );

  useEffect(() => {
    return invokeWatchTodoList('');
  }, [invokeWatchTodoList]);

  if (todoListState.isLoading) {
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
    </Box>
  );
};
