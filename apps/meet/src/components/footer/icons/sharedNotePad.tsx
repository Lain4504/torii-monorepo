import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { store, useAppDispatch, useAppSelector } from '../../../store';
import { updateIsActiveSharedNotePad } from '../../../store/slices/bottomIconsActivitySlice';
import { SharedNotepadIconSVG } from '../../../assets/Icons/SharedNotepadIconSVG';
const SharedNotePadIcon = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { showTooltip } = useMemo(() => {
    const session = store.getState().session;
    return {
      showTooltip: session.userDeviceType === 'desktop',
    };
  }, []);

  const isActiveSharedNotePad = useAppSelector(
    (state) => state.bottomIconsActivity.isActiveSharedNotePad,
  );
  const sharedNotepadStatus = useAppSelector(
    (state) =>
      state.session.currentRoom.metadata?.roomFeatures?.sharedNotePadFeatures
        ?.isActive,
  );

  useEffect(() => {
    dispatch(updateIsActiveSharedNotePad(!!sharedNotepadStatus));
  }, [sharedNotepadStatus, dispatch]);

  return (
    sharedNotepadStatus && (
      <div
        className={`sharedNotePad hidden md:block relative footer-icon cursor-pointer w-11 3xl:w-[52px] h-11 3xl:h-[52px] rounded-xl border-[3px] 3xl:border-4 ${isActiveSharedNotePad ? 'border-primary/25' : 'border-transparent'}`}
        onClick={() =>
          dispatch(updateIsActiveSharedNotePad(!isActiveSharedNotePad))
        }
      >
        <div
          className={`footer-icon-bg h-full w-full flex items-center justify-center rounded-lg border border-border shadow-sm transition-all duration-300 hover:bg-muted text-foreground ${showTooltip ? 'has-tooltip' : ''
            } ${isActiveSharedNotePad ? 'bg-muted' : 'bg-card'}`}
        >
          <span className="tooltip">
            {isActiveSharedNotePad
              ? t('footer.icons.hide-shared-notepad')
              : t('footer.icons.show-shared-notepad')}
          </span>
          <SharedNotepadIconSVG />
        </div>
      </div>
    )
  );
};

export default SharedNotePadIcon;
