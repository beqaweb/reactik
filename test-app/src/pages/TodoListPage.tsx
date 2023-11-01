import { useEffect, useState } from 'react';
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';

import { serviceContainer } from '../services';
import { Todo } from '../services/TodoService';

export const TodoListPage = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const todoService = serviceContainer.useService('todoService');

  useEffect(() => {
    todoService.getTodoList().then((result) => {
      setTodos(result);
    });
  }, []);

  return (
    <Box>
      <Typography variant="h4">Todo list</Typography>

      <List>
        {todos.map((item) => (
          <ListItem key={item.id}>
            <ListItemText>{item.title}</ListItemText>
          </ListItem>
        ))}
      </List>
      <Divider />
    </Box>
  );
};
