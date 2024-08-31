import { atomWithStorage } from 'jotai/utils';

export const tokenAtom = atomWithStorage<string>('tokenAtom', '');
