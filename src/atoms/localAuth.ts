import { atomWithStorage } from 'jotai/utils';

export const localAuth = atomWithStorage<boolean>('isAuthenticated', false);
