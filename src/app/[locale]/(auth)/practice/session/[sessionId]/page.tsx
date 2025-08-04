import { PracticeSession } from '@/features/practice/PracticeSession';

export default async function PracticeSessionPage({
  params,
}: {
  params: { sessionId: string; locale: string };
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PracticeSession sessionId={Number.parseInt(params.sessionId, 10)} />
      </div>
    </div>
  );
}
