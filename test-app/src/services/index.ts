import { createServiceContainer } from 'reactik';

import { FriendService } from './FriendService';

export const serviceContainer = createServiceContainer({
  services: {
    friendService: () => new FriendService(),
  },
});
