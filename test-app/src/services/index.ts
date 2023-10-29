import { createServiceContainer } from 'reactik';

import { TodoService } from './TodoService';

export const serviceContainer = createServiceContainer({
  services: {
    todo: () => new TodoService(),
  },
});
