import { createServiceContainer } from 'reactik';

import { TodoService } from './TodoService';
import { UserService } from './UserService';

export const serviceContainer = createServiceContainer({
  services: {
    todoService: () => new TodoService(),
    userService: () => new UserService(),
  },
  reused: [],
});
