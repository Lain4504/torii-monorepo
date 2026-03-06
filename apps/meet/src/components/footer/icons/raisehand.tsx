import React, { useCallback, useMemo } from 'react';
import {
  NatsMsgClientToServerEvents,
  NatsMsgClientToServerSchema,
} from '@workspace/protocol';
import { create } from '@bufbuild/protobuf';
import clsx from 'clsx';

import { store, useAppSelector } from '@/store';
import { getNatsConn } from '@/helpers/nats';
import { Hand } from 'lucide-react';

const RaiseHandIcon = () => {
  const conn = getNatsConn();

  const { showTooltip, allowRaiseHand } = useMemo(() => {
    const session = store.getState().session;
    return {
      showTooltip: session.userDeviceType === 'desktop',
      allowRaiseHand:
        session.currentRoom.metadata?.roomFeatures?.allowRaiseHand !== false,
    };
  }, []);

  const isActiveRaisehand = useAppSelector(
    (state) => state.bottomIconsActivity.isActiveRaisehand,
  );

  const toggleRaiseHand = useCallback(() => {
    const data = create(NatsMsgClientToServerSchema, {});

    if (!isActiveRaisehand) {
      data.event = NatsMsgClientToServerEvents.REQ_RAISE_HAND;
      data.msg = `${conn.userName} đã giơ tay`;
    } else {
      data.event = NatsMsgClientToServerEvents.REQ_LOWER_HAND;
    }

    conn.sendMessageToSystemWorker(data);
  }, [isActiveRaisehand, conn]);

  if (!allowRaiseHand) {
    return null;
  }

  const wrapperClasses = clsx(
    'raise-hand relative footer-icon cursor-pointer w-10 md:w-11 3xl:w-[52px] h-10 md:h-11 3xl:h-[52px] rounded-xl border-[3px] 3xl:border-4',
    {
      'border-primary/25': isActiveRaisehand,
      'border-transparent': !isActiveRaisehand,
    },
  );

  const innerDivClasses = clsx(
    'footer-icon-bg h-full w-full flex items-center justify-center rounded-lg border border-border shadow-sm transition-all duration-300 hover:bg-muted text-foreground',
    {
      'has-tooltip': showTooltip,
      'bg-muted': isActiveRaisehand,
      'bg-card': !isActiveRaisehand,
    },
  );

  return (
    <div className={wrapperClasses} onClick={toggleRaiseHand}>
      <div className={innerDivClasses}>
        <span className="tooltip">
          {isActiveRaisehand
            ? 'Hạ tay'
            : 'Giơ tay'}
        </span>
        <Hand className={'h-4 md:h-5 w-auto'} />
      </div>
    </div>
  );
};

export default RaiseHandIcon;
