import type { ApexOptions } from 'apexcharts';

import { RequestsByStatus } from './requests-by-status.data';

const STATUS_PALETTES: Record<string, readonly string[]> = {
  pending: ['#f0b429', '#f6cd6e', '#fbe8bc'],
  verified: ['#3b82d9', '#74a9e6', '#b4cff2'],
  assisted: ['#14a3a3', '#4fbdbd', '#9adbdb'],
  completed: ['#2c9a5b', '#63b583', '#a9d6bb'],
  rejected: ['#d6453a', '#e27a72', '#f0b4af']
};

const FALLBACK_PALETTES: readonly (readonly string[])[] = [
  ['#1565c0', '#42a5f5', '#90caf9'],
  ['#2e7d32', '#66bb6a', '#a5d6a7'],
  ['#ef6c00', '#fb8c00', '#ffb74d'],
  ['#6a1b9a', '#ab47bc', '#ce93d8']
];

const bar = {
  distributed: true,
  horizontal: false,
  columnWidth: '55%',
  borderRadius: 6,
  borderRadiusApplication: 'end' as const
};

function paletteFor(id: string, index: number): readonly string[] {
  return STATUS_PALETTES[id.toLowerCase()] ?? FALLBACK_PALETTES[index % FALLBACK_PALETTES.length];
}

const requestCount = (value: number): string =>
  `${value} ${value === 1 ? 'request' : 'requests'}`;

export function buildRequestsByStatusOptions(data: RequestsByStatus): ApexOptions {
  const palettes = data.statuses.map((status, index) => paletteFor(status.id, index));

  return {
    series: [
      {
        name: 'Requests',
        data: data.statuses.map((status) => ({
          x: status.label,
          y: status.count,
          drilldown: status.id
        }))
      }
    ],
    chart: {
      type: 'bar',
      height: 340,
      fontFamily: 'Poppins, Arial, sans-serif',
      toolbar: { show: false },
      parentHeightOffset: 0,
      animations: { speed: 350 }
    },
    colors: palettes.map((palette) => palette[0]),
    plotOptions: { bar: { ...bar } },
    fill: { opacity: 1 },
    legend: { show: false },
    dataLabels: { enabled: false },
    grid: {
      borderColor: '#e3e9f2',
      strokeDashArray: 4,
      padding: { left: 8, right: 8 }
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#7d8ea9', fontSize: '12px', fontWeight: 500 } }
    },
    yaxis: {
      title: { text: 'Requests', style: { color: '#7d8ea9', fontSize: '12px', fontWeight: 500 } },
      labels: { style: { colors: '#7d8ea9', fontSize: '12px' } }
    },
    tooltip: { y: { formatter: requestCount } },
    drilldown: {
      enabled: true,
      breadcrumb: {
        show: true,
        position: 'top-right',
        rootLabel: 'All Statuses',
        separator: ' / '
      },
      series: data.statuses.map((status, index) => ({
        id: status.id,
        name: `${status.label} by Priority`,
        colors: [...palettes[index]],
        plotOptions: { bar: { ...bar } },
        data: status.priorities.map((priority) => ({ x: priority.label, y: priority.count }))
      }))
    }
  };
}
