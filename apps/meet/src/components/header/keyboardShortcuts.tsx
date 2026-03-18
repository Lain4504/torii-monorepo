import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateShowKeyboardShortcutsModal } from '@/store/slices/roomSettingsSlice';
import Modal from '@/helpers/ui/modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';

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
      <Table className="border-collapse border border-border w-full text-foreground">
        <TableHeader>
          <TableRow>
            <TableHead className="pl-2 border-b border-r border-border text-xs sm:text-sm md:text-base">
              <strong>Tổ hợp phím</strong>
            </TableHead>
            <TableHead className="pl-2 border-b border-border text-xs sm:text-sm md:text-base">
              <strong>Hành động</strong>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="pl-2 border-b border-r border-border text-xs sm:text-sm md:text-base">
              ctrl + alt/option + m
            </TableCell>
            <TableCell className="pl-2 border-b border-border text-xs sm:text-sm md:text-base ">
              Tắt/Mở micrô của bạn
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="pl-2 border-b border-r border-slate-700 text-xs sm:text-sm md:text-base">
              ctrl + alt/option + a
            </TableCell>
            <TableCell className="pl-2 border-b border-slate-700 text-xs sm:text-sm md:text-base">
              Tham gia âm thanh
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="pl-2 border-b border-r border-slate-700 text-xs sm:text-sm md:text-base">
              ctrl + alt/option + o
            </TableCell>
            <TableCell className="pl-2 border-b border-slate-700 text-xs sm:text-sm md:text-base">
              Rời khỏi âm thanh
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="pl-2 border-b border-r border-slate-700 text-xs sm:text-sm md:text-base">
              ctrl + alt/option + v
            </TableCell>
            <TableCell className="pl-2 border-b border-slate-700 text-xs sm:text-sm md:text-base">
              Bật máy ảnh
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="pl-2 border-b border-r border-slate-700 text-xs sm:text-sm md:text-base">
              ctrl + alt/option + x
            </TableCell>
            <TableCell className="pl-2 border-b border-slate-700 text-xs sm:text-sm md:text-base">
              Tắt máy ảnh
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="pl-2 border-b border-r border-slate-700 text-xs sm:text-sm md:text-base">
              ctrl + alt/option + u
            </TableCell>
            <TableCell className="pl-2 border-b border-slate-700 text-xs sm:text-sm md:text-base">
              Hiện/Ẩn danh sách thành viên
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="pl-2 border-b border-r border-slate-700 text-xs sm:text-sm md:text-base">
              ctrl + alt/option + c
            </TableCell>
            <TableCell className="pl-2 border-b border-slate-700 text-xs sm:text-sm md:text-base">
              Hiện/Ẩn cửa sổ trò chuyện
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="pl-2 border-b border-r border-slate-700 text-xs sm:text-sm md:text-base">
              ctrl + alt/option + l
            </TableCell>
            <TableCell className="pl-2 border-b border-slate-700 text-xs sm:text-sm md:text-base">
              Hiện/Ẩn cài đặt khóa
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="pl-2 border-b border-r border-slate-700 text-xs sm:text-sm md:text-base">
              ctrl + alt/option + s
            </TableCell>
            <TableCell className="pl-2 border-b border-slate-700 text-xs sm:text-sm md:text-base">
              Hiện/Ẩn cài đặt
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="pl-2 border-b border-r border-slate-700 text-xs sm:text-sm md:text-base">
              ctrl + alt/option + w
            </TableCell>
            <TableCell className="pl-2 border-b border-slate-700 text-xs sm:text-sm md:text-base">
              Hiện/Ẩn bảng trắng
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="pl-2 border-r border-slate-700 text-xs sm:text-sm md:text-base">
              ctrl + alt/option + r
            </TableCell>
            <TableCell className="pl-2 border-slate-700 text-xs sm:text-sm md:text-base">
              Hiện/Ẩn giơ tay
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Modal>
  );
};

export default KeyboardShortcuts;
