import { useTranslations } from 'next-intl';

import { PricingCard } from '@/features/billing/PricingCard';
import { PricingFeature } from '@/features/billing/PricingFeature';

export const PricingInformation = (props: {
  buttonList: Record<string, React.ReactNode>;
}) => {
  const t = useTranslations('PricingPlan');

  // Prepify is completely free - no pricing tiers
  const freePlan = {
    id: 'free',
    price: 0,
    interval: 'month' as const,
    features: {
      questions: 1200,
      categories: 3,
      practiceModes: 3,
      progressTracking: true,
      detailedExplanations: true,
      mobileFriendly: true,
    },
  };

  return (
    <div className="flex justify-center">
      <div className="max-w-md">
        <PricingCard
          key={freePlan.id}
          planId={freePlan.id}
          price={freePlan.price}
          interval={freePlan.interval}
          button={props.buttonList[freePlan.id]}
        >
          <PricingFeature>
            {freePlan.features.questions.toLocaleString()}+ SAT Questions
          </PricingFeature>

          <PricingFeature>
            {freePlan.features.categories} Subject Categories
          </PricingFeature>

          <PricingFeature>
            {freePlan.features.practiceModes} Practice Modes
          </PricingFeature>

          <PricingFeature>
            Progress Tracking
          </PricingFeature>

          <PricingFeature>
            Detailed Explanations
          </PricingFeature>

          <PricingFeature>
            Mobile Friendly
          </PricingFeature>
        </PricingCard>
      </div>
    </div>
  );
};
