export interface DonationOfferTrendPoint {
  date: string;
  count: number;
}

export const DONATION_SERIES_NAMES = {
  total: 'Total donation offers',
  awaitingReview: 'Awaiting review',
  coordinatedWithDswd: 'Coordinated with DSWD',
  updatesRecorded: 'Updates recorded'
} as const;

export interface DonationOffersOverview {
  period: string;
  totalOffers: number;
  awaitingReview: number;
  coordinatedWithDswd: number;
  updatesRecorded: number;
  trend: DonationOfferTrendPoint[];
  awaitingReviewTrend?: DonationOfferTrendPoint[];
  coordinatedWithDswdTrend?: DonationOfferTrendPoint[];
  updatesRecordedTrend?: DonationOfferTrendPoint[];
}

export const DONATION_OFFERS_OVERVIEW_FALLBACK: DonationOffersOverview = {
  period: 'September 2026',
  totalOffers: 54,
  awaitingReview: 12,
  coordinatedWithDswd: 8,
  updatesRecorded: 15,
  trend: [
    { date: '2026-02-01', count: 6 },
    { date: '2026-03-01', count: 5 },
    { date: '2026-04-01', count: 8 },
    { date: '2026-05-01', count: 7 },
    { date: '2026-06-01', count: 10 },
    { date: '2026-07-01', count: 5 },
    { date: '2026-08-01', count: 7 },
    { date: '2026-09-01', count: 6 }
  ],
  awaitingReviewTrend: [
    { date: '2026-02-01', count: 1 },
    { date: '2026-03-01', count: 2 },
    { date: '2026-04-01', count: 1 },
    { date: '2026-05-01', count: 2 },
    { date: '2026-06-01', count: 2 },
    { date: '2026-07-01', count: 1 },
    { date: '2026-08-01', count: 1 },
    { date: '2026-09-01', count: 2 }
  ],
  coordinatedWithDswdTrend: [
    { date: '2026-02-01', count: 1 },
    { date: '2026-03-01', count: 0 },
    { date: '2026-04-01', count: 1 },
    { date: '2026-05-01', count: 1 },
    { date: '2026-06-01', count: 2 },
    { date: '2026-07-01', count: 1 },
    { date: '2026-08-01', count: 1 },
    { date: '2026-09-01', count: 1 }
  ],
  updatesRecordedTrend: [
    { date: '2026-02-01', count: 2 },
    { date: '2026-03-01', count: 2 },
    { date: '2026-04-01', count: 1 },
    { date: '2026-05-01', count: 2 },
    { date: '2026-06-01', count: 3 },
    { date: '2026-07-01', count: 1 },
    { date: '2026-08-01', count: 2 },
    { date: '2026-09-01', count: 2 }
  ]
};
