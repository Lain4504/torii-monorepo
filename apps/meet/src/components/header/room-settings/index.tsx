import React, { useMemo } from 'react';
import sanitizeHtml from 'sanitize-html';

import { store, useAppDispatch, useAppSelector } from '../../../store';
import { updateShowRoomSettingsModal } from '../../../store/slices/roomSettingsSlice';
import Modal from '../../../helpers/ui/modal';
import Tabs from '../../../helpers/ui/tabs';
import ApplicationSettings from './application';
import DataSavings from './dataSavings';
import Ingress from './ingress';

declare const WAJLC_VERSION: string;

const RoomSettings = () => {
  const dispatch = useAppDispatch();
  const {
    serverVersion,
    currentUser,
    copyright_conf,
    ingressFeatures,
  } = useMemo(() => {
    const session = store.getState().session;
    return {
      serverVersion: session.serverVersion,
      currentUser: session.currentUser,
      copyright_conf: session.currentRoom.metadata?.copyrightConf,
      ingressFeatures:
        session.currentRoom.metadata?.roomFeatures?.ingressFeatures,
    };
  }, []);

  const isShowRoomSettingsModal = useAppSelector(
    (state) => state.roomSettings.isShowRoomSettingsModal,
  );

  const baseCategories: Record<string, { title: string; content: React.ReactNode }> = {
    application: {
      title: 'Ứng dụng',
      content: <ApplicationSettings />,
    },
    dataSavings: {
      title: 'Tiết kiệm dữ liệu',
      content: <DataSavings />,
    },
  };
  if (currentUser?.metadata?.isAdmin) {
    if (ingressFeatures?.isAllow) {
      baseCategories.ingress = {
        title: 'Luồng vào',
        content: <Ingress />,
      };
    }
  }

  const tabItems = Object.keys(baseCategories).map((k) => ({
    id: k,
    title: baseCategories[k].title,
    content: baseCategories[k].content,
  }));

  const closeModal = () => {
    dispatch(updateShowRoomSettingsModal(false));
  };

  if (!isShowRoomSettingsModal) {
    return null;
  }

  const renderModalFooter = () => {
    let text = '';
    if (
      copyright_conf &&
      copyright_conf.display &&
      copyright_conf.text !== ''
    ) {
      text = sanitizeHtml(copyright_conf.text, {
        allowedTags: ['b', 'i', 'em', 'strong', 'a'],
        allowedAttributes: {
          a: ['href', 'target'],
        },
      }).concat('&nbsp;');
    }

    text += `Phiên bản Máy chủ: ${serverVersion}, Phiên bản Ứng dụng: ${WAJLC_VERSION}`;
    return (
      <div
        className="absolute inset-x-0 -bottom-4 text-center text-Gray-950 dark:text-white text-xs"
        dangerouslySetInnerHTML={{ __html: text }}
      ></div>
    );
  };

  return (
    <Modal
      show={true}
      onClose={closeModal}
      title="Cài đặt"
      maxWidth="max-w-2xl header-room-settings"
    >
      <div className="wrap relative">
        <Tabs items={tabItems} tabPanelsCss="min-h-[316px]" />
        {renderModalFooter()}
      </div>
    </Modal>
  );
};

export default RoomSettings;