import { QuestionViewer } from '@/features/questions/QuestionViewer';

export default async function QuestionPage({
  params,
}: {
  params: { category: string; questionId: string; locale: string };
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <QuestionViewer
        category={params.category}
        questionId={params.questionId}
      />
    </div>
  );
}
