import { FlaggedQuestionsList } from '@/features/questions/FlaggedQuestionsList';
import { QuestionFilters } from '@/features/questions/QuestionFilters';

export default async function FlaggedQuestionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Flagged Questions
          </h1>
          <p className="text-xl text-gray-600">
            Review and practice questions you've flagged for later
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <QuestionFilters />
        </div>

        {/* Flagged Questions List */}
        <FlaggedQuestionsList />
      </div>
    </div>
  );
}
