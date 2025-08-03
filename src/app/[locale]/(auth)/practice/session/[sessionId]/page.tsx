import { getTranslations } from 'next-intl/server';
import { PracticeSession } from '@/features/practice/PracticeSession';

export default async function PracticeSessionPage({
  params,
}: {
  params: { sessionId: string; locale: string };
}) {
  const t = await getTranslations('Practice');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PracticeSession sessionId={params.sessionId} />
      </div>
    </div>
  );
} 