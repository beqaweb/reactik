import { useEffect, useState } from 'react';

import { serviceContainer } from './services';
import { Todo } from './services/TodoService';

export function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const todoService = serviceContainer.useService('todo');

  useEffect(() => {
    todoService.getTodoList().then((res) => {
      setTodos(res.items);
    });
  }, []);

  return (
    <div>
      <h1>Reactik app</h1>
      <ul>
        {todos.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}
