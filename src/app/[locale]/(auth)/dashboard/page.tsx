import { DashboardSection } from '@/features/dashboard/DashboardSection';

export default async function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to Prepify
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your SAT preparation progress and access practice questions
          </p>
        </div>

        <DashboardSection
          title="Your SAT Progress"
          description="Track your performance across all SAT sections"
        >
          <div className="py-8 text-center">
            <p className="text-gray-600">Dashboard content will be added here</p>
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}
