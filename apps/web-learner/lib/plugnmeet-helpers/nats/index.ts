import { Dispatch } from 'react';
import { NatsSubjects } from '@workspace/protocol';
import { once } from 'es-toolkit';

import ConnectNats from './ConnectNats';
import { IErrorPageProps } from '@/components/plugnmeet/extra-pages/Error';
import { IConnectLivekit } from '../livekit/types';
import { roomConnectionStatus } from '@/components/plugnmeet/app/helper';

let conn: ConnectNats | undefined = undefined;

export const startNatsConn = once(
  async (
    natsWSUrl: string[],
    token: string,
    roomId: string,
    userId: string,
    subjects: NatsSubjects,
    errorState: Dispatch<IErrorPageProps>,
    roomConnectionStatusState: Dispatch<roomConnectionStatus>,
    setCurrentMediaServerConn: Dispatch<IConnectLivekit>,
  ) => {
    conn = new ConnectNats(
      natsWSUrl,
      token,
      roomId,
      userId,
      subjects,
      errorState,
      roomConnectionStatusState,
      setCurrentMediaServerConn,
    );
    await conn.openConn();
  },
);

export const getNatsConn = () => {
  return conn as ConnectNats;
};
