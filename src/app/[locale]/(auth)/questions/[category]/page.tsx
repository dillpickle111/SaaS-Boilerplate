import { CategoryHeader } from '@/features/questions/CategoryHeader';
import { QuestionList } from '@/features/questions/QuestionList';

export default async function CategoryQuestionsPage({
  params,
}: {
  params: { category: string; locale: string };
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <CategoryHeader categorySlug={params.category} />
        <QuestionList />
      </div>
    </div>
  );
}
