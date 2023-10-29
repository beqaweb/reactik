<h1 align="center">Reactik</h1>

**reactik** is a react library that contains utilities/helpers for building react apps faster and writing a clean code.

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/beqaweb/reactik/blob/HEAD/LICENSE)
![npm latest package](https://img.shields.io/badge/npm@latest-v0.0.4-blue)

## Get started

Use your preferred package manager:

```
npm install reactik
yarn add reactik
```

## Documentation

### Modals

Implement modal windows in a very clean way without the need of creating states and callbacks for them at every use.

Provide context for modals with `ModalProvider` component:

```jsx
import { ModalProvider } from 'reactik';

export const App = () => {
  return (
    <ModalProvider>
      <HomePage />
    </ModalProvider>
  );
};
```

Create a modal component. In the following example, `AlertModal` uses `Dialog` component from Material UI:

```jsx
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { ModalProps } from 'reactik';

type AlertModalData = {
  confirmText: string,
  dismissText: string,
};

type AlertModalResult = 'Y' | 'N';

export const AlertModal: React.FC<
  ModalProps<AlertModalData, AlertModalResult>,
> = ({ modalProps, data, close }) => (
  <Dialog
    open={modalProps.open}
    onClose={() => close()}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">
      Use Google's location service?
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        Let Google help apps determine location. This means sending anonymous
        location data to Google, even when no apps are running.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      {/* Pass 'Y' or 'N' (AlertModalResult) to `close` function */}
      <Button onClick={() => close('N')}>{data.dismissText}</Button>
      <Button onClick={() => close('Y')} autoFocus>
        {data.confirmText}
      </Button>
    </DialogActions>
  </Dialog>
);
```

Then use `AlertModal`:

```jsx
import { Box, Button } from '@mui/material';
import { useModal } from 'reactik';

import AlertModal from 'path to AlertModal';

export function HomePage() {
  const alertDialog = useModal(AlertModal, {
    // `data` should be type of AlertModalData
    data: {
      confirmText: 'Agree',
      dismissText: 'Disagree',
    },
  });

  const handleAlertOpenRequest = () => {
    // opens the alert modal and waits for result using promise

    // optionally `data` can be passed here, which will override the data
    // passed in `useModal` hook call above
    const data = {
      confirmText: 'Allow',
      dismissText: 'Cancel',
    };

    alertDialog.controls.open(data).then((result) => {
      // `result` here will automatically be typed as AlertModalResult | undefined
      if (result === 'Y') {
        // Clicked Allow
      } else if (result === 'N') {
        // Clicked Cancel
      } else {
        // if undefined, it means modal was dismissed
      }
    });
  };

  return (
    <Box>
      <Button onClick={handleAlertOpenRequest}>
        Request location permissions
      </Button>
    </Box>
  );
}
```

### Services

```ts
export interface Todo {
  id: string;
  title: string;
}

export class TodoService {
  async getTodos(): Promise<Todo[]> {
    // resolve and return Todo[]
  }
}
```

```jsx
import { createServiceContainer, ServicesProvider } from 'reactik';

import { TodoService } from 'path to TodoService';

// create a service container once.
// services are instantiated at demand,
// when used with serviceContainer.useService hook (see eample below)
export const serviceContainer = createServiceContainer({
  services: {
    todoService: () => new TodoService(),
  },
});

export const App = () => {
  return (
    <ServicesProvider services={serviceContainer.services}>
      <HomePage />
    </ServicesProvider>
  );
};
```

Then use `todoService`:

```jsx
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
} from '@mui/material';

import { serviceContainer } from 'path to serviceContainer';
import { Todo } from 'path to Todo interface';

export function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);

  // service name passed to useService hook is typed,
  // which means you cannot pass any string to it,
  // it will ask you to pass a string that is a key
  // from the services object passed to createServiceContainer above
  const todoService = serviceContainer.useService('todoService');

  useEffect(() => {
    todoService.getTodos().then((items) => {
      setTodos(items);
    });
  }, [todoService]);

  return (
    <Box>
      <Typography variant="h4">Todo list</Typography>
      <List>
        {todos.map((item) => (
          <ListItem key={item.id}>
            <ListItemText>{item.name}</ListItemText>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
```
