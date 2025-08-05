import { QuestionBankStats } from '@/features/questions/QuestionBankStats';
import { QuestionFilters } from '@/features/questions/QuestionFilters';

export default async function QuestionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            3,000+ Digital SAT Questions
          </h1>
          <p className="text-xl text-gray-600">
            Filtered by Topic • Practice Instantly
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <QuestionFilters />
        </div>

        {/* Stats and Practice */}
        <QuestionBankStats />
      </div>
    </div>
  );
}
