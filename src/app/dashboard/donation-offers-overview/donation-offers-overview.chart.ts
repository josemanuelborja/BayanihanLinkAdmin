import type { ChartData, ChartDataset, ChartOptions, ScriptableContext } from 'chart.js';

import {
  DONATION_SERIES_NAMES,
  DonationOfferTrendPoint,
  DonationOffersOverview
} from './donation-offers-overview.data';

export const DONATION_SERIES_COLORS = {
  total: '#36a2eb',
  awaitingReview: '#ff6384',
  coordinatedWithDswd: '#ffce56',
  updatesRecorded: '#4bc0c0'
} as const;

const formatMonth = (value: string): string => {
  const timestamp = Date.parse(value);
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    timeZone: 'UTC'
  });
};

const transparent = (hex: string, alpha: number): string => {
  const value = hex.replace('#', '');
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const totalSeriesFill = (context: ScriptableContext<'line'>): CanvasGradient | string => {
  const { chartArea, ctx } = context.chart;
  if (!chartArea) {
    return transparent(DONATION_SERIES_COLORS.total, 0.18);
  }

  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, transparent(DONATION_SERIES_COLORS.total, 0.32));
  gradient.addColorStop(0.7, transparent(DONATION_SERIES_COLORS.total, 0.09));
  gradient.addColorStop(1, transparent(DONATION_SERIES_COLORS.total, 0.01));
  return gradient;
};

const metricCounts = (
  points: DonationOfferTrendPoint[] | undefined,
  totalTrend: DonationOfferTrendPoint[],
  metricCount: number,
  totalCount: number
): number[] => {
  if (points?.length) {
    const byDate = new Map(points.map((point) => [point.date, point.count]));
    return totalTrend.map((point) => byDate.get(point.date) ?? 0);
  }

  const ratio = totalCount > 0 ? metricCount / totalCount : 0;
  return totalTrend.map((point) => Math.round(point.count * ratio));
};

const buildDataset = (
  label: string,
  data: number[],
  color: string,
  borderWidth: number
): ChartDataset<'line', number[]> => ({
  label,
  data,
  borderColor: color,
  backgroundColor: transparent(color, 0.5),
  pointBackgroundColor: transparent(color, 0.5),
  fill: false,
  tension: 0,
  borderWidth,
  pointRadius: 3,
  pointHoverRadius: 4,
  pointHitRadius: 10
});

export function buildDonationOffersOverviewData(
  data: DonationOffersOverview
): ChartData<'line', number[], string> {
  const totalTrend = data.trend;
  const totalDataset = buildDataset(
    DONATION_SERIES_NAMES.total,
    totalTrend.map((point) => point.count),
    DONATION_SERIES_COLORS.total,
    3
  );

  totalDataset.fill = 'origin';
  totalDataset.backgroundColor = totalSeriesFill;

  return {
    labels: totalTrend.map((point) => formatMonth(point.date)),
    datasets: [
      totalDataset,
      buildDataset(
        DONATION_SERIES_NAMES.awaitingReview,
        metricCounts(data.awaitingReviewTrend, totalTrend, data.awaitingReview, data.totalOffers),
        DONATION_SERIES_COLORS.awaitingReview,
        2.5
      ),
      buildDataset(
        DONATION_SERIES_NAMES.coordinatedWithDswd,
        metricCounts(
          data.coordinatedWithDswdTrend,
          totalTrend,
          data.coordinatedWithDswd,
          data.totalOffers
        ),
        DONATION_SERIES_COLORS.coordinatedWithDswd,
        2.5
      ),
      buildDataset(
        DONATION_SERIES_NAMES.updatesRecorded,
        metricCounts(data.updatesRecordedTrend, totalTrend, data.updatesRecorded, data.totalOffers),
        DONATION_SERIES_COLORS.updatesRecorded,
        2.5
      )
    ]
  };
}

export function buildDonationOffersOverviewOptions(): ChartOptions<'line'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    layout: {
      padding: { top: 8, right: 8 }
    },
    animation: {
      duration: 350
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#16233d',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 4,
        callbacks: {
          label: (context) => {
            const value = Number(context.parsed.y);
            const noun = value === 1 ? 'offer' : 'offers';
            return `${context.dataset.label}: ${value} ${noun}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: '#666',
          font: { family: 'Poppins, Arial, sans-serif', size: 12 }
        }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#e5e5e5' },
        border: { display: false },
        ticks: {
          color: '#666',
          font: { family: 'Poppins, Arial, sans-serif', size: 12 },
          precision: 0,
          padding: 8
        }
      }
    },
    elements: {
      line: { tension: 0 },
      point: { radius: 3, hoverRadius: 4 }
    }
  };
}
