import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Navbar } from '@/components/Navbar';
import { ClientLayout } from './ClientLayout';

export default async function AuthenticatedLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ClientLayout>
        {children}
      </ClientLayout>
    </NextIntlClientProvider>
  );
}
