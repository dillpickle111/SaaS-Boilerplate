import { PracticeSessionSetup } from '@/features/practice/PracticeSessionSetup';
import { PracticeStats } from '@/features/practice/PracticeStats';

export default async function PracticePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Practice Sessions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set up a new practice session to improve your SAT skills
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <PracticeSessionSetup />
          </div>
          <div className="lg:col-span-1">
            <PracticeStats />
          </div>
        </div>
      </div>
    </div>
  );
}
