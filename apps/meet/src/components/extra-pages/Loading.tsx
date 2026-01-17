import { PageLoading } from '@workspace/ui/components/page-loading';

interface ILoadingProps {
  text: string;
}
const Loading = ({ text }: ILoadingProps) => {
  return <PageLoading text={text} />;
};

export default Loading;
