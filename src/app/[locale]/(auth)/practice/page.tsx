import { redirect } from 'next/navigation';

export default async function PracticePage() {
  // Redirect to the unified questions page
  redirect('/questions');
}
