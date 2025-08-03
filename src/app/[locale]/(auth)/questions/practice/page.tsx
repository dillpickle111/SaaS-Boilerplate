import { redirect } from 'next/navigation';

export default async function PracticePage() {
  // In a real app, this would get the first question from the filtered set
  // For now, redirect to the first mock question
  redirect('/questions/math/1');
} 