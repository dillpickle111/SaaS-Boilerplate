import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50 p-4">
      <div className="text-center">
        <Link href="/app">
          <Button
            size="lg"
            className="h-auto rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-700"
          >
            Practice Now
          </Button>
        </Link>
      </div>
    </div>
  );
}
