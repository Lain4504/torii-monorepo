import { PageLoading } from '@workspace/ui/components/page-loading';

interface ILoadingProps {
  text: string;
}
const Loading = ({ text }: ILoadingProps) => {
  return <PageLoading/>;
};

export default Loading;
