import { forwardRef } from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import { Route, Routes, Link, LinkProps } from 'react-router-dom';

import { ModalsPage } from './pages/ModalsPage';
import { TodoListPage } from './pages/TodoListPage';
import { Main } from './pages/Main';
import { FileUploadPage } from './pages/FileUploadPage';

const LinkBehavior = forwardRef<
  HTMLAnchorElement,
  Omit<LinkProps, 'to'> & { href: LinkProps['to'] }
>((props, ref) => {
  const { href, ...other } = props;
  return <Link {...other} ref={ref} to={href} />;
});

const theme = createTheme({
  components: {
    MuiLink: {
      defaultProps: {
        component: LinkBehavior,
        to: '',
      } as LinkProps,
    },
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: LinkBehavior,
      },
    },
  },
});

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/" element={<Main />}>
          <Route path="/modals" element={<ModalsPage />} />
          <Route path="/todos" element={<TodoListPage />} />
          <Route path="/upload" element={<FileUploadPage />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}
