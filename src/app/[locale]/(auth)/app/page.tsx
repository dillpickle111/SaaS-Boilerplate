import { redirect } from 'next/navigation';

export default async function AppPage() {
  // Temporarily remove authentication - redirect directly to questions
  redirect('/questions');
}
