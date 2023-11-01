import { createServiceContainer } from 'reactik';

import { TodoService } from './TodoService';

export const serviceContainer = createServiceContainer({
  services: {
    todoService: () => new TodoService(),
  },
});
