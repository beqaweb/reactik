import { useEffect, useState } from 'react';
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

  const getTodoList = useServiceHandler(todoService.getTodoList);

  useEffect(() => {
    getTodoList.invoke();
  }, [getTodoList.invoke]);

  console.log(getTodoList);

  if (getTodoList.state.isLoading) {
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
        {getTodoList.state.response?.map((item) => (
          <ListItem key={item.id}>
            <ListItemText>✅ {item.title}</ListItemText>
          </ListItem>
        ))}
      </List>
      <Divider />
    </Box>
  );
};
