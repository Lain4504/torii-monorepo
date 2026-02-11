import React, { useState } from 'react';

import { PollDataWithOption, publishPollResultByChat } from '../../utils';
import ActionButton from '../../../../helpers/ui/actionButton';

interface PublishResultBtnProps {
  pollDataWithOption: PollDataWithOption;
  onCloseViewDetails: () => void;
}

const PublishResultBtn = ({
  pollDataWithOption,
  onCloseViewDetails,
}: PublishResultBtnProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const publishByChat = () => {
    setIsLoading(true);
    publishPollResultByChat(pollDataWithOption).finally(() =>
      onCloseViewDetails(),
    );
  };

  return (
    <ActionButton
      onClick={publishByChat}
      isLoading={isLoading}
      buttonType="button"
      custom="w-44"
    >
      Công bố kết quả
    </ActionButton>
  );
};
export default PublishResultBtn;
