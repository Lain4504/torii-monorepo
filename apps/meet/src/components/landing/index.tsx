import React, {
  Dispatch,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { store, useAppDispatch, useAppSelector } from '../../store';
import { toggleStartup } from '../../store/slices/sessionSlice';
import {
  addAudioDevices,
  addVideoDevices,
  updateSelectedAudioDevice,
  updateSelectedVideoDevice,
} from '../../store/slices/roomSettingsSlice';
import { Volume2, MicOff, VideoOff, Loader2, Lock as LockIcon } from 'lucide-react';
import { roomConnectionStatus } from '../app/helper';
import { getNatsConn } from '../../helpers/nats';
import { useMediaDevices } from './hooks/useMediaDevices';

import MicrophoneIcon from './microphone';
import WebcamIcon from './webcam';
import WebcamPreview from './webcamPreview';
import { Button } from '@workspace/ui/components/button';

interface StartupJoinModalProps {
  setIsAppReady: Dispatch<boolean>;
  roomConnectionStatus: roomConnectionStatus;
}

const Landing = ({
  setIsAppReady,
  roomConnectionStatus,
}: StartupJoinModalProps) => {
  const dispatch = useAppDispatch();
  // static values
  const { isWebcamAllowed } = useMemo(() => {
    const session = store.getState().session;
    const roomFeatures = session.currentRoom.metadata?.roomFeatures;
    const isAdmin = !!session.currentUser?.metadata?.isAdmin;

    let show = true;
    if (!roomFeatures?.allowWebcams) {
      show = false;
    } else if (roomFeatures?.adminOnlyWebcams && !isAdmin) {
      show = false;
    }

    return {
      isWebcamAllowed: show,
    };
  }, []);

  const isStartup = useAppSelector((state) => state.session.isStartup);
  const waitForApproval = useAppSelector(
    (state) => state.session.currentUser?.metadata?.waitForApproval,
  );
  const waitingRoomMessage = useAppSelector(
    (state) =>
      state.session.currentRoom.metadata?.roomFeatures?.waitingRoomFeatures
        ?.waitingRoomMsg,
  );
  const lockMicrophone = useAppSelector(
    (state) =>
      state.session.currentUser?.metadata?.lockSettings?.lockMicrophone,
  );
  const lockWebcam = useAppSelector(
    (state) => state.session.currentUser?.metadata?.lockSettings?.lockWebcam,
  );

  const {
    audioDevices,
    videoDevices,
    selectedAudioDevice,
    selectedVideoDevice,
    setSelectedAudioDevice,
    setSelectedVideoDevice,
    enableMediaDevices,
    disableWebcam,
    disableMic,
  } = useMediaDevices();

  const [showLoadingMsg, setShowLoadingMsg] = useState<string | undefined>(
    undefined,
  );
  const [isReadyToConn, setIsReadyToConn] = useState<boolean | undefined>(
    undefined,
  );

  useEffect(() => {
    switch (roomConnectionStatus) {
      case 'media-server-conn-start':
        setShowLoadingMsg('Đang kết nối tới máy chủ truyền thông...');
        break;
      case 'media-server-conn-established':
        dispatch(toggleStartup(false));
        setIsAppReady(true);
        setShowLoadingMsg(undefined);
        break;
    }
  }, [roomConnectionStatus, dispatch, setIsAppReady]);

  useEffect(() => {
    if (waitForApproval) {
      if (typeof isReadyToConn !== 'undefined') {
        setShowLoadingMsg('Đang chờ phê duyệt...');
      }
    } else {
      if (isReadyToConn) {
        const conn = getNatsConn();
        if (conn) {
          setShowLoadingMsg('Đang hoàn tất cài đặt...');
          conn.finalizeAppConn();
        }
      }
    }
  }, [waitForApproval, isReadyToConn]);

  const openConn = useCallback(() => {
    if (selectedVideoDevice !== '') {
      dispatch(updateSelectedVideoDevice(selectedVideoDevice));
      dispatch(addVideoDevices(videoDevices));
    }
    if (selectedAudioDevice !== '') {
      dispatch(updateSelectedAudioDevice(selectedAudioDevice));
      dispatch(addAudioDevices(audioDevices));
    }

    setIsReadyToConn(true);
  }, [
    selectedAudioDevice,
    selectedVideoDevice,
    dispatch,
    videoDevices,
    audioDevices,
  ]);

  const getJoinPrompt = useCallback(() => {
    if (lockMicrophone && (lockWebcam || !isWebcamAllowed)) {
      return 'Cả micrô và máy ảnh của bạn đều bị khóa. Bạn có thể tham gia với tư cách là người nghe.';
    } else if (lockMicrophone) {
      return 'Micrô của bạn đã bị khóa. Bạn có thể tham gia với tư cách là người nghe hoặc bật máy ảnh.';
    } else if (lockWebcam || !isWebcamAllowed) {
      return 'Máy ảnh của bạn đã bị khóa. Bạn có thể tham gia với tư cách là người nghe hoặc bật micrô.';
    }
    return 'Vui lòng chọn thiết bị của bạn trước khi tham gia.';
  }, [lockMicrophone, lockWebcam, isWebcamAllowed]);

  const getEnableDeviceButton = useCallback(() => {
    if (lockMicrophone) {
      return {
        text: 'Bật máy ảnh',
        action: () => enableMediaDevices('video'),
      };
    } else if (lockWebcam || !isWebcamAllowed) {
      return {
        text: 'Bật micrô',
        action: () => enableMediaDevices('audio'),
      };
    }
    return {
      text: 'Bật micrô & máy ảnh',
      action: () => enableMediaDevices('both'),
    };
  }, [lockMicrophone, lockWebcam, isWebcamAllowed, enableMediaDevices]);

  return (
    isStartup && (
      <div
        id="startupJoinModal"
        className={`absolute w-full join-the-audio-popup bg-background min-h-full flex items-center justify-center p-5 scrollBar`}
      >
        <div className="inner m-auto bg-card border border-border overflow-hidden rounded-2xl w-full max-w-4xl 3xl:max-w-5xl shadow-xl">
          <div className="head bg-secondary h-[50px] 3xl:h-[60px] px-3 sm:px-5 flex justify-center sm:justify-start text-center sm:text-left items-center text-foreground text-sm sm:text-base 3xl:text-lg font-medium border-b border-border">
            Tham gia cuộc họp
          </div>
          <div className="wrapper bg-card pt-4 sm:pt-8 3xl:pt-11 pb-4 sm:pb-10 3xl:pb-14 px-4 sm:px-8 3xl:px-12 flex flex-wrap">
            <div className="left relative z-20 bg-muted/50 shadow-sm border border-border p-2 w-full md:w-1/2 rounded-2xl mb-5 sm:mb-0">
              <WebcamPreview selectedVideoDevice={selectedVideoDevice} />
              <div className="micro-cam-wrap flex justify-center py-5 gap-5 empty:hidden">
                {lockMicrophone ? (
                  <div className="microphone-wrap relative cursor-not-allowed shadow-sm border border-destructive/30 bg-destructive/5 rounded-xl h-11 w-11 flex items-center justify-center transition-all duration-300 text-destructive">
                    <MicOff className="h-6 w-6" />
                    <LockIcon className="w-3 h-3 absolute -top-1 -right-1 z-10 text-destructive" />
                  </div>
                ) : (
                  <MicrophoneIcon
                    audioDevices={audioDevices}
                    enableMediaDevices={enableMediaDevices}
                    disableMic={disableMic}
                    setSelectedAudioDevice={setSelectedAudioDevice}
                    selectedAudioDevice={selectedAudioDevice}
                  />
                )}
                {lockWebcam || !isWebcamAllowed ? (
                  <div className="cam-wrap relative cursor-not-allowed shadow-sm border border-destructive/30 bg-destructive/5 rounded-xl h-11 w-11 flex items-center justify-center transition-all duration-300 text-destructive">
                    <VideoOff className="h-6 w-6" />
                    <LockIcon className="w-3 h-3 absolute -top-1 -right-1 z-10 text-destructive" />
                  </div>
                ) : (
                  <WebcamIcon
                    videoDevices={videoDevices}
                    enableMediaDevices={enableMediaDevices}
                    disableWebcam={disableWebcam}
                    setSelectedVideoDevice={setSelectedVideoDevice}
                    selectedVideoDevice={selectedVideoDevice}
                  />
                )}
              </div>
            </div>
            <div className="right w-full md:w-1/2 md:pl-8 3xl:pl-16 sm:py-8 flex items-center">
              {showLoadingMsg ? (
                <div className="inner waiting-room-contents relative md:-mt-10 w-full">
                  {waitForApproval ? (
                    <div className="texts text-center md:text-left">
                      <h3 className="font-bold text-lg md:text-xl 3xl:text-2xl text-foreground leading-snug pb-2 flex items-center justify-center md:justify-start gap-2">
                        <Loader2
                          className={
                            'inline h-5 w-5 text-muted-foreground animate-spin'
                          }
                        />
                        Đang chờ phê duyệt...
                      </h3>
                      <p className="text-sm 3xl:text-base text-muted-foreground md:pl-7">
                        {waitingRoomMessage ||
                          'Vui lòng đợi người tổ chức cho phép bạn tham gia.'}
                      </p>
                    </div>
                  ) : (
                    <div className="texts text-center md:text-left">
                      <h3 className="font-bold text-lg md:text-xl 3xl:text-2xl text-foreground leading-snug pb-2 flex items-center justify-center md:justify-start gap-2">
                        <Loader2
                          className={
                            'inline w-7 h-7 text-muted-foreground animate-spin'
                          }
                        />
                        {showLoadingMsg}
                      </h3>
                    </div>
                  )}
                </div>
              ) : (
                <div className="inner relative w-full">
                  <div className="texts text-center md:text-left">
                    <h3 className="font-bold text-xl 3xl:text-2xl text-foreground leading-snug pb-2">
                      Sẵn sàng tham gia?
                    </h3>
                    <p className="text-sm 3xl:text-base text-muted-foreground">
                      {getJoinPrompt()}
                    </p>
                  </div>
                  <div className="buttons grid gap-3 w-full pt-10">
                    {lockMicrophone && (lockWebcam || !isWebcamAllowed) ? (
                      // Case 1: Both devices are locked, only show the listener button.
                      <Button
                        id="listenOnlyJoin"
                        disabled={isReadyToConn === true}
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => openConn()}
                      >
                        Tham gia chỉ nghe
                        <Volume2 />
                      </Button>
                    ) : // Case 2: At least one device is available.
                      selectedAudioDevice !== '' || selectedVideoDevice !== '' ? (
                        // Sub-case 2a: A device has been selected, show the "Join" button.
                        <Button
                          disabled={isReadyToConn === true}
                          className="w-full"
                          onClick={() => openConn()}
                        >
                          Tham gia ngay
                        </Button>
                      ) : (
                        // Sub-case 2b: No device selected yet, show the "Enable..." and "Listener" buttons.
                        <>
                          <Button
                            className="w-full"
                            disabled={isReadyToConn === true}
                            onClick={getEnableDeviceButton().action}
                          >
                            <span className="relative flex items-center justify-center gap-2">
                              {getEnableDeviceButton().text}
                            </span>
                          </Button>
                          <Button
                            id="listenOnlyJoin"
                            disabled={isReadyToConn === true}
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => openConn()}
                          >
                            Tham gia chỉ nghe
                            <Volume2 />
                          </Button>
                        </>
                      )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Landing;