import { EnhancedQuestionBank } from '@/features/questions/EnhancedQuestionBank';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function QuestionsPage() {
  return (
    <ErrorBoundary>
      <EnhancedQuestionBank />
    </ErrorBoundary>
  );
}
