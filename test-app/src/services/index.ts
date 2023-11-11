import { createServiceContainer } from 'reactik';

import { TodoService } from './TodoService';
import { UserService } from './UserService';
import { FileService } from './FileService';

export const serviceContainer = createServiceContainer({
  services: {
    todoService: () => new TodoService(),
    userService: () => new UserService(),
    fileService: () => new FileService(),
  },
  reused: ['todoService'],
});
