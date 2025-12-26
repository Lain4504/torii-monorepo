import { useEffect } from 'react';

import { useAppDispatch } from '@/store/plugnmeet';
import { setActiveSidePanel } from '@/store/plugnmeet/slices/bottomIconsActivitySlice';

export const useCloseSidePanelsOnShow = (
  shouldShow: boolean,
  isRecorder: boolean | undefined,
) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (shouldShow && !isRecorder) {
      const timeout = setTimeout(() => {
        dispatch(setActiveSidePanel(null));
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [shouldShow, isRecorder, dispatch]);
};
