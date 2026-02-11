import React, { useCallback, useMemo } from 'react';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { toast } from 'react-toastify';
import {
  CommonResponseSchema,
  SwitchPresenterReqSchema,
  SwitchPresenterTask,
} from '@workspace/protocol';
import { debounce } from 'es-toolkit';
import { create, fromBinary, toBinary } from '@bufbuild/protobuf';
import { ChevronLeft, ChevronRight, Presentation, Eye } from 'lucide-react';

import { store, useAppDispatch, useAppSelector } from '../../store';
import { setWhiteboardCurrentPage } from '../../store/slices/whiteboard';
import { broadcastCurrentPageNumber } from './helpers/handleRequests';
import sendAPIRequest from '../../helpers/api/api-client';
import { savePageData } from './helpers/utils';
import { sleep } from '../../helpers/utils';

interface IFooterUIProps {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  isPresenter: boolean;
  isFollowing?: boolean;
  setIsFollowing?: (value: boolean) => void;
  showSwitchingWarning: () => boolean;
}

const FooterUI = ({
  excalidrawAPI,
  isPresenter,
  isFollowing,
  setIsFollowing,
  showSwitchingWarning,
}: IFooterUIProps) => {
  const totalPages = useAppSelector((state) => state.whiteboard.totalPages);
  const currentPage = useAppSelector((state) => state.whiteboard.currentPage);

  const dispatch = useAppDispatch();

  const { currentUser, isAdmin, isRecorder } = useMemo(() => {
    const currentUser = store.getState().session.currentUser;
    return {
      currentUser,
      isAdmin: currentUser?.metadata?.isAdmin,
      isRecorder: currentUser?.isRecorder,
    };
  }, []);

  const debouncedSetCurrentPage = useMemo(
    () =>
      debounce(async (newPage: number, pageToSave: number) => {
        // First, save the state of the page we are leaving.
        if (isPresenter && excalidrawAPI) {
          await savePageData(
            excalidrawAPI.getSceneElementsIncludingDeleted(),
            pageToSave,
          );
        }
        // broadcast first so that user can prepare for page change
        await broadcastCurrentPageNumber(newPage);
        await sleep(300);
        // Then, proceed with changing the page.
        dispatch(setWhiteboardCurrentPage(newPage));
      }, 300),
    [dispatch, isPresenter, excalidrawAPI],
  );

  const setCurrentPage = (page: number) => {
    if (showSwitchingWarning()) return;
    debouncedSetCurrentPage(page, currentPage);
  };

  const handlePre = () => {
    if (showSwitchingWarning()) return;
    setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (showSwitchingWarning()) return;
    setCurrentPage(currentPage + 1);
  };

  const handleFollowPresenter = () => {
    if (setIsFollowing) {
      setIsFollowing(!isFollowing);
    }
  };

  const takeOverPresenter = useCallback(async () => {
    if (!currentUser) {
      return;
    }
    const body = create(SwitchPresenterReqSchema, {
      userId: currentUser.userId,
      task: SwitchPresenterTask.PROMOTE,
    });

    const r = await sendAPIRequest(
      'switchPresenter',
      toBinary(SwitchPresenterReqSchema, body),
      false,
      'application/protobuf',
      'arraybuffer',
    );
    const res = fromBinary(CommonResponseSchema, new Uint8Array(r));

    if (res.status) {
      toast('Người trình bày đã thay đổi', {
        toastId: 'presenter-change-status',
        type: 'info',
      });
    } else {
      toast(res.msg, {
        toastId: 'presenter-change-status',
        type: 'error',
      });
    }
  }, [currentUser]);

  const renderForAdmin = () => {
    return (
      <div className="flex wb-page-navigation ml-2 bg-muted rounded-lg overflow-hidden border border-border">
        <button className="pre p-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors" onClick={handlePre} disabled={currentPage <= 1}>
          <ChevronLeft className="w-5 h-5 text-foreground rtl:rotate-180" />
        </button>
        <select
          id="pages"
          name="pages"
          className="pagesOpts appearance-none cursor-pointer block h-8 py-1 px-3 border-x border-border bg-transparent focus:outline-hidden text-sm text-foreground font-medium"
          onChange={(e) => setCurrentPage(Number(e.currentTarget.value))}
          value={currentPage}
        >
          {Array.from({ length: totalPages }, (_, i) => (
            <option key={i} value={i + 1} className="bg-card text-foreground">
              Trang {i + 1}
            </option>
          ))}
        </select>
        <button
          className="next p-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="w-5 h-5 text-foreground rtl:rotate-180" />
        </button>
      </div>
    );
  };

  const renderForParticipant = () => {
    return (
      <div
        className={`renderForParticipant flex gap-2 text-sm items-center justify-start md:justify-center relative ${isAdmin && !isRecorder
          ? 'ltr:pl-3 rtl:pr-3 md:pl-12  md:rtl:pr-4'
          : 'ltr:pl-3 rtl:pr-3'
          } `}
      >
        {isAdmin && !isRecorder && (
          <button className="presenter" onClick={takeOverPresenter}>
            <Presentation className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          className={`px-2 flex items-center ${isFollowing ? 'following' : ''}`}
          onClick={handleFollowPresenter}
          title={
            isFollowing
              ? 'Ngừng theo dõi người trình bày'
              : 'Theo dõi người trình bày'
          }
        >
          <Eye
            className={`w-3.5 h-3.5 ltr:mr-1 rtl:ml-1 ${isFollowing ? 'animate-pulse text-primary' : ''
              }`}
          />
          {isFollowing ? 'Ngừng theo dõi' : 'Theo dõi'}
        </button>
        Trang {currentPage}
      </div>
    );
  };

  return isPresenter ? renderForAdmin() : renderForParticipant();
};

export default FooterUI;
