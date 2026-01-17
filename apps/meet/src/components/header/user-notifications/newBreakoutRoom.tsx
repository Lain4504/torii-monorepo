import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { create } from '@bufbuild/protobuf';
import copy from 'copy-text-to-clipboard';
import { JoinBreakoutRoomReqSchema } from '@workspace/protocol';

import { store, useAppDispatch } from '../../../store';
import { useJoinRoomMutation } from '../../../store/services/breakoutRoomApi';
import { updateReceivedInvitationFor } from '../../../store/slices/breakoutRoomSlice';
import { addUserNotification } from '../../../store/slices/roomSettingsSlice';
import ActionButton from '../../../helpers/ui/actionButton';
import { BreakoutRoomIconSVG } from '../../../assets/Icons/BreakoutRoomIconSVG';

interface NewBreakoutRoomProps {
  receivedInvitationFor: string | undefined;
  createdAt: number | undefined;
}

const NewBreakoutRoom = ({
  receivedInvitationFor,
  createdAt,
}: NewBreakoutRoomProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [joinRoom, { isLoading, data }] = useJoinRoomMutation();
  const [joinLink, setJoinLink] = useState<string>('');
  const [copyText, setCopyText] = useState<string>(
    t('breakout-room.copy').toString(),
  );
  const userId = useMemo(
    () => store.getState().session.currentUser?.userId,
    [],
  );

  useEffect(() => {
    if (!isLoading && data) {
      if (!data.status) {
        dispatch(
          addUserNotification({
            message: t(data.msg),
            typeOption: 'error',
            newInstance: true,
          }),
        );
        return;
      }
      if (data.token && data.token !== '') {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set('access_token', data.token);
        const url =
          location.protocol +
          '//' +
          location.host +
          window.location.pathname +
          '?' +
          searchParams.toString();

        const opened = window.open(url, '_blank');
        setJoinLink(url);

        if (!opened) {
          setJoinLink(url);
          return;
        }

        dispatch(updateReceivedInvitationFor(''));
      }
    }
    //eslint-disable-next-line
  }, [isLoading, data]);

  const join = useCallback(() => {
    if (!receivedInvitationFor) {
      dispatch(
        addUserNotification({
          message: t('breakout-room.user-joined'),
          typeOption: 'error',
          newInstance: true,
        }),
      );
      return;
    }
    joinRoom(
      create(JoinBreakoutRoomReqSchema, {
        breakoutRoomId: receivedInvitationFor,
        userId: userId,
      }),
    );
  }, [receivedInvitationFor, userId, joinRoom, dispatch, t]);

  const copyUrl = useCallback(() => {
    copy(joinLink);
    setCopyText(t('breakout-room.copied').toString());
    setTimeout(() => {
      setCopyText(t('breakout-room.copy').toString());
    }, 1000);
  }, [joinLink, t]);

  const formatDate = (timeStamp?: number) => {
    const date = new Date(timeStamp ?? 0);
    return date.toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="notification notif-breakoutRoom flex gap-4 py-2 px-4 border-b border-border">
      <div className="icon w-9 h-9 rounded-full bg-muted text-primary relative inline-flex items-center justify-center">
        <BreakoutRoomIconSVG classes="w-[15px]" />
      </div>
      <div className="text flex-1 text-foreground text-sm">
        <p>{t('breakout-room.invitation-msg')}</p>
        {joinLink !== '' && (
          <div className="invite-link mt-2">
            <label className="text-foreground text-sm block mb-1">
              {t('breakout-room.join-text-label')}
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                readOnly={true}
                value={joinLink}
                className="flex-1 outline-hidden border border-border rounded-lg p-1 h-8 text-xs bg-muted text-foreground"
              />
              <button
                onClick={copyUrl}
                className="text-center py-1 px-3 text-xs transition duration-300 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-sm"
              >
                {copyText}
              </button>
            </div>
          </div>
        )}
        <div className="bottom flex justify-between text-muted-foreground text-xs items-center mt-2">
          <span className="">{formatDate(createdAt)}</span>{' '}
          <div className="btn-group">
            <ActionButton
              onClick={join}
              isLoading={isLoading}
              custom="h-7 w-auto px-3 !text-xs !rounded-lg"
            >
              {t('breakout-room.join')}
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBreakoutRoom;
