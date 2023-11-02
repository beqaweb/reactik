import { Route, Routes } from 'react-router-dom';

import { ModalsPage } from './pages/ModalsPage';
import { TodoListPage } from './pages/TodoListPage';

export function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <ModalsPage />
            <TodoListPage />
          </>
        }
      />
      <Route path="/modals" element={<ModalsPage />} />
      <Route path="/todos" element={<TodoListPage />} />
    </Routes>
  );
}
