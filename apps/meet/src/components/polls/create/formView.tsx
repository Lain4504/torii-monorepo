import React, {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { create } from '@bufbuild/protobuf';
import { CreatePollReqSchema } from '@workspace/protocol';

import { useCreatePollMutation } from '../../../store/services/pollsApi';
import { CreatePollOptions } from './index';
import OptionsView from './optionsView';
import { addUserNotification } from '../../../store/slices/roomSettingsSlice';
import { useAppDispatch } from '../../../store';
import { Loader2 } from 'lucide-react';

interface FormViewProps {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const FormView = ({ setIsOpen }: FormViewProps) => {
  const dispatch = useAppDispatch();
  const [question, setQuestion] = useState<string>('');
  const [createPoll, { isLoading, data }] = useCreatePollMutation();

  const [options, setOptions] = useState<CreatePollOptions[]>([
    {
      id: 1,
      text: '',
    },
    {
      id: 2,
      text: '',
    },
  ]);

  useEffect(() => {
    if (data) {
      if (data.status) {
        // On success
        dispatch(
          addUserNotification({
            message: 'Tạo bình chọn thành công',
            typeOption: 'info',
          }),
        );
        setIsOpen(false);
      } else {
        // On failure
        dispatch(
          addUserNotification({
            message: data.msg,
            typeOption: 'error',
          }),
        );
      }
    }
  }, [data, dispatch, setIsOpen]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) {
      return;
    }

    // Prevent submission if any option is empty
    if (options.some((opt) => opt.text.trim() === '')) {
      dispatch(
        addUserNotification({
          message: 'Vui lòng điền đầy đủ các lựa chọn',
          typeOption: 'error',
        }),
      );
      return;
    }

    const body = create(CreatePollReqSchema, {
      question,
      options,
    });
    createPoll(body);
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="question-area border-b border-border pb-6 bg-card">
        <label className="text-sm text-foreground font-medium mb-2 inline-block">
          Nhập câu hỏi
        </label>
        <input
          type="text"
          name="question"
          value={question}
          required={true}
          onChange={(e) => setQuestion(e.currentTarget.value)}
          placeholder="Nhập câu hỏi tại đây"
          className="default-input"
          autoComplete="off"
        />
      </div>
      <OptionsView options={options} setOptions={setOptions} />
      {isLoading && (
        <div className="absolute text-center top-1/2 -translate-y-1/2 z-999 left-0 right-0 m-auto">
          <Loader2
            className={'inline w-10 h-10 me-3 text-primary animate-spin'}
          />
        </div>
      )}
      <div className="button-section flex items-center gap-2 md:gap-5 pt-4 border-t border-border">
        <button
          className="h-10 3xl:h-11 w-full cursor-pointer text-sm 3xl:text-base font-semibold bg-muted hover:bg-muted/80 border border-border rounded-lg flex justify-center items-center gap-2 transition-all duration-300 shadow-sm text-foreground"
          type="button"
          onClick={() => setIsOpen(false)}
        >
          Đóng
        </button>
        <button
          className="h-10 3xl:h-11 w-full cursor-pointer text-sm 3xl:text-base font-semibold bg-primary hover:bg-primary/90 border border-transparent rounded-lg text-primary-foreground transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isLoading}
        >
          Tạo bình chọn
        </button>
      </div>
    </form>
  );
};

export default FormView;
