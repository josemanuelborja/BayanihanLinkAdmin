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
