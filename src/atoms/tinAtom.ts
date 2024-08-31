import { atomWithStorage } from 'jotai/utils';

export const tinAtom = atomWithStorage<string>('inn', '');
