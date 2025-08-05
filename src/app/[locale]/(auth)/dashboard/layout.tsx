import { getTranslations } from 'next-intl/server';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Dashboard',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default function DashboardLayout(props: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-muted">
      <div className="mx-auto max-w-screen-xl px-3 pb-16 pt-6">
        {props.children}
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
