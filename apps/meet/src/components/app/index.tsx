import React, { useEffect, useMemo, useState } from 'react';
import ErrorPage, { IErrorPageProps } from '@/components/extra-pages/Error';
import Loading from '@/components/extra-pages/Loading';
import Footer from '@/components/footer';
import Header from '@/components/header';
import MainArea from '@/components/main-area';
import Landing from '@/components/landing';
import DummyAudio from '@/components/app/dummyAudio';
import Login from '@/components/extra-pages/Login'
import { store, useAppDispatch } from '@/store';
import { addServerVersion, addToken } from '@/store/slices/sessionSlice';
import AudioNotification from '@/components/app/audioNotification';
import useKeyboardShortcuts from '@/helpers/hooks/useKeyboardShortcuts';
import useClientCustomization from '@/helpers/hooks/useClientCustomization';
import useWatchWindowSize from '@/helpers/hooks/useWatchWindowSize';
import useWatchVisibilityChange from '@/helpers/hooks/useWatchVisibilityChange';
import useThemeSettings from '@/helpers/hooks/useThemeSettings';
import { IConnectLivekit } from '@/helpers/livekit/types';
import { isUserRecorder } from '@/helpers/utils';
import { startNatsConn } from '@/helpers/nats';
import { InfoToOpenConn, roomConnectionStatus, verifyToken } from '@/components/app/helper';
import { loadBodyPix } from '@/components/virtual-background/helpers/utils';
import { setActiveSidePanel } from '@/store/slices/bottomIconsActivitySlice';

const App = () => {
  const dispatch = useAppDispatch();

  // we'll require making ready virtual background
  // elements as early as possible.
  loadBodyPix(true).then();

  const [loading, setLoading] = useState<boolean>(true);
  // it could be recorder or RTMP bot
  const [userTypeClass, setUserTypeClass] = useState('participant');
  const [currentMediaServerConn, setCurrentMediaServerConn] =
    useState<IConnectLivekit>();

  const [error, setError] = useState<IErrorPageProps | undefined>();
  const [roomConnectionStatus, setRoomConnectionStatus] =
    useState<roomConnectionStatus>('loading');
  const [openConnInfo, setOpenConnInfo] = useState<InfoToOpenConn | undefined>(
    undefined,
  );
  const [isAppReady, setIsAppReady] = useState<boolean>(false);

  useKeyboardShortcuts(currentMediaServerConn?.room);
  // to handle different customization
  useClientCustomization();
  useWatchVisibilityChange();
  const { deviceClass, orientationClass, screenHeight } = useWatchWindowSize(
    currentMediaServerConn?.room,
  );
  useThemeSettings();

  useEffect(() => {
    verifyToken(setLoading, setError, setOpenConnInfo).then();
  }, []);

  useEffect(() => {
    if (openConnInfo) {
      // we'll store the token that we received from the URL
      dispatch(addToken(openConnInfo.accessToken));
      dispatch(addServerVersion(openConnInfo.serverVersion));

      setRoomConnectionStatus('connecting');
      startNatsConn(
        openConnInfo.natsWsUrls,
        openConnInfo.accessToken,
        openConnInfo.roomId,
        openConnInfo.userId,
        openConnInfo.roomStreamName,
        openConnInfo.natsSubjects,
        setError,
        setRoomConnectionStatus,
        setCurrentMediaServerConn,
      ).then();
    }
  }, [dispatch, openConnInfo]);

  useEffect(() => {
    switch (roomConnectionStatus) {
      case 'connecting':
      case 'checking':
      case 'receiving-data':
        setLoading(true);
        break;
      case 'error':
        setLoading(false);
        break;
      case 'ready': {
        setLoading(false);
        const session = store.getState().session;
        if (session.currentUser && isUserRecorder(session.currentUser.userId)) {
          dispatch(setActiveSidePanel(null));
        }
        if (session.currentUser?.metadata?.isAdmin) {
          setUserTypeClass('admin');
        }
        break;
      }
    }
  }, [dispatch, roomConnectionStatus]);

  const renderElms = useMemo(() => {
    switch (true) {
      case loading: {
        let text = 'Đang tải...';
        if (roomConnectionStatus === 'connecting') {
          text = 'Kết nối...';
        } else if (roomConnectionStatus === 'checking') {
          text = 'Kiểm tra...';
        } else if (roomConnectionStatus === 'receiving-data') {
          text = 'Lấy dữ liệu cuộc họp...';
        }
        return <Loading text={text} />;
      }
      case error && !loading:
        if (error!.title === 'Thiếu mã truy cập') {
          return <Login />;
        }
        return <ErrorPage title={error!.title} text={error!.text} />;
      case isAppReady:
        return (
          <div className="torii-meet-app overflow-hidden h-screen">
            <Header />
            <MainArea />
            <Footer />
            <AudioNotification />
            <DummyAudio />
          </div>
        );
      default:
        return (
          <Landing
            setIsAppReady={setIsAppReady}
            roomConnectionStatus={roomConnectionStatus}
          />
        );
    }
    //eslint-disable-next-line
  }, [loading, error, roomConnectionStatus, isAppReady]);

  return (
    <div
      className={`${orientationClass} ${deviceClass} ${userTypeClass} bg-Gray-50 dark:bg-dark-secondary`}
      style={{ height: screenHeight }}
    >
      {renderElms}
    </div>
  );
};

export default App;