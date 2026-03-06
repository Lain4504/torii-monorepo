import React, { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import {
  CreateIngressReqSchema,
  CreateIngressResSchema,
  IngressInput,
} from '@workspace/protocol';
import { create, fromBinary, toBinary } from '@bufbuild/protobuf';

import { store, useAppSelector } from '@/store';
import sendAPIRequest from '@/helpers/api/api-client';
import { Loader2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import Dropdown, { ISelectOption } from '@/helpers/ui/dropdown';
import FormattedInputField from '@/helpers/ui/formattedInputField';

const Ingress = () => {
  const [name, setName] = useState<string>('broadcaster');
  const [ingressType, setIngressType] = useState<IngressInput>(
    IngressInput.RTMP_INPUT,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const session = store.getState().session;
  const ingressFeatures = useAppSelector(
    (state) =>
      state.session.currentRoom?.metadata?.roomFeatures?.ingressFeatures,
  );

  const handleSubmit = useCallback(async () => {
    if (!ingressFeatures?.isAllow) {
      toast('Tính năng này không được phép.', { type: 'error' });
      return;
    }
    setIsLoading(true);

    const body = create(CreateIngressReqSchema, {
      inputType: ingressType,
      participantName: name || 'broadcaster',
      roomId: session.currentRoom.roomId,
    });

    const r = await sendAPIRequest(
      'ingress/create',
      toBinary(CreateIngressReqSchema, body),
      false,
      'application/protobuf',
      'arraybuffer',
    );
    const res = fromBinary(CreateIngressResSchema, new Uint8Array(r));
    if (!res.status) {
      toast(res.msg, {
        type: 'error',
      });
    }

    setIsLoading(false);
  }, [ingressFeatures, session.currentRoom, ingressType, name]);

  const getIngressTypeText = (type: number) => {
    switch (type) {
      case IngressInput.RTMP_INPUT:
        return 'RTMP';
      case IngressInput.WHIP_INPUT:
        return 'WHIP';
      default:
        return '';
    }
  };

  const renderForm = () => {
    return (
      <form method="POST" onSubmit={(e) => e.preventDefault()}>
        <Dropdown
          label="Loại luồng vào"
          id="ingress-type"
          value={ingressType}
          onChange={setIngressType}
          options={Object.values(IngressInput)
            .filter((v) => typeof v === 'number')
            .map((v) => {
              return {
                value: v,
                text: getIngressTypeText(v as number),
              } as ISelectOption;
            })}
          direction="horizontal"
        />
        <FormattedInputField
          label="Tham gia với tên"
          id="name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="broadcaster"
        />
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="h-8 px-5 bg-Blue hover:bg-white border border-[#0088CC] rounded-[15px] text-white hover:text-foreground transition-all duration-300 shadow-button-shadow"
          >
            {isLoading ? (
              <Loader2
                className="inline h-5 w-5 animate-spin text-white"
              />
            ) : (
              'Tạo liên kết'
            )}
          </Button>
        </div>
      </form>
    );
  };

  const renderInfo = () => {
    return (
      <>
        <FormattedInputField
          label="Loại luồng vào"
          id="ingress_type"
          value={getIngressTypeText(
            ingressFeatures?.inputType ?? IngressInput.RTMP_INPUT,
          )}
          readOnly={true}
        />
        <FormattedInputField
          label="Đường dẫn luồng"
          id="url"
          value={ingressFeatures?.url}
          readOnly={true}
        />
        <FormattedInputField
          label="Khóa luồng"
          id="stream_key"
          value={ingressFeatures?.streamKey}
          readOnly={true}
        />
      </>
    );
  };

  return (
    <div className="mt-2">
      {ingressFeatures?.url && ingressFeatures?.streamKey
        ? renderInfo()
        : renderForm()}
    </div>
  );
};

export default Ingress;
