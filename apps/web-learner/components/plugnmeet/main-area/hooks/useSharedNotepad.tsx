import { useMemo } from 'react';

import { useAppSelector } from '@/store/plugnmeet';
import SharedNotepadElement from '../../shared-notepad';

export const useSharedNotepad = () => {
  const isActiveSharedNotepad = useAppSelector(
    (state) =>
      state.session.currentRoom.metadata?.roomFeatures?.sharedNotePadFeatures
        ?.isActive,
  );

  return useMemo(() => {
    if (isActiveSharedNotepad) {
      return <SharedNotepadElement />;
    }
    return null;
  }, [isActiveSharedNotepad]);
};
