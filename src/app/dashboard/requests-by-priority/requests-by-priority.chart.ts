import type { ApexOptions } from 'apexcharts';

import { RequestsByPriority } from './requests-by-priority.data';

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#d6453a',
  urgent: '#f0b429',
  normal: '#2c9a5b'
};

const FALLBACK_COLORS = ['#3b82d9', '#14a3a3', '#6a3fc4', '#ef6c00'];

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);

const requestCount = (value: number): string =>
  `${value} ${value === 1 ? 'request' : 'requests'}`;

const colorFor = (id: string, index: number): string =>
  PRIORITY_COLORS[id.toLowerCase()] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];

export function buildRequestsByPriorityOptions(data: RequestsByPriority): ApexOptions {
  const counts = new Map(data.priorities.map((priority) => [priority.label, priority.count]));
  const total = data.priorities.reduce((sum, priority) => sum + priority.count, 0);

  return {
    series: data.priorities.map((priority) => priority.count),
    labels: data.priorities.map((priority) => priority.label),
    chart: {
      type: 'donut',
      height: 340,
      fontFamily: 'Poppins, Arial, sans-serif',
      toolbar: { show: false },
      parentHeightOffset: 0,
      animations: { speed: 350 }
    },
    colors: data.priorities.map((priority, index) => colorFor(priority.id, index)),
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

        return (
          `${escapeHtml(name)}<br>` +
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
          chart: { width: '100%' },
          legend: { position: 'bottom', height: 96, offsetY: 0 },
          plotOptions: { pie: { donut: { size: '62%' } } }
        }
      }
    ]
  };
}
