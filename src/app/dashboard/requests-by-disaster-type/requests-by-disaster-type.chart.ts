import type { ApexOptions } from 'apexcharts';

import { RequestsByDisasterType } from './requests-by-disaster-type.data';

const DISASTER_COLORS: Record<string, string> = {
  typhoon: '#2848b7',
  flood: '#0b6f6f',
  fire: '#b34700',
  earthquake: '#6a3fc4',
  other: '#5f718c'
};

const FALLBACK_COLORS = ['#3b82d9', '#0b6f6f', '#b34700', '#6a3fc4', '#5f718c'];

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);

const colorFor = (id: string, index: number): string =>
  DISASTER_COLORS[id.toLowerCase()] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];

const requestCount = (value: number): string => `${value} ${value === 1 ? 'request' : 'requests'}`;

const LEGEND_LABELS: Record<string, string> = {
  Earthquake: 'Quake',
  'Other disasters': 'Other'
};

export function buildRequestsByDisasterTypeOptions(data: RequestsByDisasterType): ApexOptions {
  const counts = new Map(data.disasters.map((disaster) => [disaster.label, disaster.count]));
  const total = data.disasters.reduce((sum, disaster) => sum + disaster.count, 0);

  return {
    series: data.disasters.map((disaster) => disaster.count),
    labels: data.disasters.map((disaster) => disaster.label),
    chart: {
      type: 'donut',
      width: '100%',
      height: 340,
      fontFamily: 'Poppins, Arial, sans-serif',
      toolbar: { show: false },
      parentHeightOffset: 0,
      animations: { speed: 350 }
    },
    colors: data.disasters.map((disaster, index) => colorFor(disaster.id, index)),
    dataLabels: { enabled: false },
    stroke: { width: 2, colors: ['#fff'] },
    legend: {
      position: 'right',
      horizontalAlign: 'center',
      offsetY: 0,
      height: 230,
      fontSize: '13px',
      fontWeight: 500,
      labels: { colors: '#46587a' },
      markers: { size: 8, strokeWidth: 0 },
      itemMargin: { horizontal: 0, vertical: 8 },
      formatter: (name) => {
        const count = counts.get(name) ?? 0;
        const percent = total ? Math.round((count / total) * 100) : 0;
        const displayName = LEGEND_LABELS[name] ?? name;
        const title = displayName === name ? '' : ` title="${escapeHtml(name)}"`;

        return (
          `<span${title}>${escapeHtml(displayName)}</span><br>` +
          `<span style="color:#7d8ea9;font-size:12px;">${count} (${percent}%)</span>`
        );
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: {
            show: true,
            name: { show: true, offsetY: -10 },
            value: { show: true, offsetY: 10 },
            total: {
              show: true,
              showAlways: true,
              label: 'total',
              color: '#7d8ea9',
              fontSize: '13px',
              fontWeight: 500,
              formatter: () => String(total)
            }
          }
        }
      }
    },
    tooltip: { y: { formatter: requestCount } },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: '100%', height: 410 },
          legend: {
            position: 'bottom',
            height: 170,
            offsetY: 0,
            itemMargin: { horizontal: 10, vertical: 4 }
          },
          plotOptions: { pie: { donut: { size: '62%' } } }
        }
      }
    ]
  };
}
