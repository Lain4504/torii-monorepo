import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateShowKeyboardShortcutsModal } from '@/store/slices/roomSettingsSlice';
import Modal from '@/helpers/ui/modal';

const KeyboardShortcuts = () => {
  const dispatch = useAppDispatch();
  const isShowKeyboardShortcuts = useAppSelector(
    (state) => state.roomSettings.isShowKeyboardShortcuts,
  );

  const closeModal = () => {
    dispatch(updateShowKeyboardShortcutsModal(false));
  };

  return (
    <Modal
      show={isShowKeyboardShortcuts}
      onClose={closeModal}
      title={
        <h3 className="flex items-center justify-between text-base 3xl:text-lg font-semibold leading-7 text-foreground mb-2">
          <span>Phím tắt bàn phím</span>
        </h3>
      }
      maxWidth="max-w-2xl"
      customClass="KeyboardShortcuts"
    >
      <table className="border-collapse border border-border w-full text-foreground">
        <thead>
          <tr>
            <th className="pl-2 border-b border-r border-border text-xs sm:text-sm md:text-base">
              <strong>Tổ hợp phím</strong>
            </th>
            <th className="pl-2 border-b border-border text-xs sm:text-sm md:text-base">
              <strong>Hành động</strong>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="pl-2 border-b border-r border-border text-xs sm:text-sm md:text-base">
              ctrl + alt/option + m
            </td>
            <td className="pl-2 border-b border-border text-xs sm:text-sm md:text-base ">
              Tắt/Mở micrô của bạn
            </td>
          </tr>
          <tr>
            <td className="pl-2 border-b border-r border-slate-700 text-xs sm:text-sm md:text-base">
              ctrl + alt/option + a
            </td>
            <td className="pl-2 border-b border-slate-700 text-xs sm:text-sm md:text-base">
              Tham gia âm thanh
            </td>
          </tr>
          <tr>
            <td className="pl-2 border-b border-r border-slate-700 text-xs sm:text-sm md:text-base">
              ctrl + alt/option + o
            </td>
            <td className="pl-2 border-b border-slate-700 text-xs sm:text-sm md:text-base">
              Rời khỏi âm thanh
            </td>
          </tr>
          <tr>
            <td className="pl-2 border-b border-r border-slate-700 text-xs sm:text-sm md:text-base">
              ctrl + alt/option + v
            </td>
            <td className="pl-2 border-b border-slate-700 text-xs sm:text-sm md:text-base">
              Bật máy ảnh
            </td>
          </tr>
          <tr>
            <td className="pl-2 border-b border-r border-slate-700 text-xs sm:text-sm md:text-base">
              ctrl + alt/option + x
            </td>
            <td className="pl-2 border-b border-slate-700 text-xs sm:text-sm md:text-base">
              Tắt máy ảnh
            </td>
          </tr>
          <tr>
            <td className="pl-2 border-b border-r border-slate-700 text-xs sm:text-sm md:text-base">
              ctrl + alt/option + u
            </td>
            <td className="pl-2 border-b border-slate-700 text-xs sm:text-sm md:text-base">
              Hiện/Ẩn danh sách thành viên
            </td>
          </tr>
          <tr>
            <td className="pl-2 border-b border-r border-slate-700 text-xs sm:text-sm md:text-base">
              ctrl + alt/option + c
            </td>
            <td className="pl-2 border-b border-slate-700 text-xs sm:text-sm md:text-base">
              Hiện/Ẩn cửa sổ trò chuyện
            </td>
          </tr>
          <tr>
            <td className="pl-2 border-b border-r border-slate-700 text-xs sm:text-sm md:text-base">
              ctrl + alt/option + l
            </td>
            <td className="pl-2 border-b border-slate-700 text-xs sm:text-sm md:text-base">
              Hiện/Ẩn cài đặt khóa
            </td>
          </tr>
          <tr>
            <td className="pl-2 border-b border-r border-slate-700 text-xs sm:text-sm md:text-base">
              ctrl + alt/option + s
            </td>
            <td className="pl-2 border-b border-slate-700 text-xs sm:text-sm md:text-base">
              Hiện/Ẩn cài đặt
            </td>
          </tr>
          <tr>
            <td className="pl-2 border-b border-r border-slate-700 text-xs sm:text-sm md:text-base">
              ctrl + alt/option + w
            </td>
            <td className="pl-2 border-b border-slate-700 text-xs sm:text-sm md:text-base">
              Hiện/Ẩn bảng trắng
            </td>
          </tr>
          <tr>
            <td className="pl-2 border-r border-slate-700 text-xs sm:text-sm md:text-base">
              ctrl + alt/option + r
            </td>
            <td className="pl-2 border-slate-700 text-xs sm:text-sm md:text-base">
              Hiện/Ẩn giơ tay
            </td>
          </tr>
        </tbody>
      </table>
    </Modal>
  );
};

export default KeyboardShortcuts;
