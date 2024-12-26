export interface PricingTier {
  name: string;
  price: number;
  credits: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  isEnterprise?: boolean;
  stripePrices: {
    monthly: string;
    yearly: string;
  };
}

export const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: 20,
    credits: 1000,
    description: 'Getting started with LinkedIn data enrichment',
    features: [
      'CSV data export',
      'Webhook integration',
      'Basic support',
      'Email support',
      'Unlimited exports'
    ],
    stripePrices: {
      monthly: 'price_1QSVTyClmigcXiKN3g2F7KUQ',
      yearly: 'price_1QUhvPClmigcXiKNwfuRxOpI'
    }
  },
  {
    name: 'Explorer',
    price: 50,
    credits: 2800,
    description: 'Ideal for growing businesses and teams',
    features: [
      'Everything in Starter',
      'Priority support',
      'Advanced analytics dashboard',
      'Higher API rate limits',
      'Custom webhooks'
    ],
    isPopular: true,
    stripePrices: {
      monthly: 'price_1QSVWoClmigcXiKNsjgTPayL',
      yearly: 'price_1QUiFfClmigcXiKNmoImgSMU'
    }
  },
  {
    name: 'Pro',
    price: 100,
    credits: 6000,
    description: 'For power users and larger organizations',
    features: [
      'Everything in Explorer',
      'Premium support',
      'API access',
      'Custom webhooks',
      'Advanced integrations',
      'Dedicated account manager'
    ],
    isPopular: false,
    stripePrices: {
      monthly: 'price_1QSVXqClmigcXiKNyYZtcj2p',
      yearly: 'price_1QUiGKClmigcXiKNpTnTz6aM'
    }
  }
];