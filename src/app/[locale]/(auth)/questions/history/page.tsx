import { QuestionFilters } from '@/features/questions/QuestionFilters';
import { QuestionHistoryList } from '@/features/questions/QuestionHistoryList';

export default async function QuestionHistoryPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Question History
          </h1>
          <p className="text-xl text-gray-600">
            Review all questions you've completed and track your progress
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <QuestionFilters />
        </div>

        {/* Question History List */}
        <QuestionHistoryList />
      </div>
    </div>
  );
}
