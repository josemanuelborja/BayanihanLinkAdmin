export interface PriorityBreakdown {
  label: string;
  count: number;
}

export interface StatusBreakdown {
  id: string;
  label: string;
  count: number;
  priorities: PriorityBreakdown[];
}

export interface RequestsByStatus {
  period: string;
  statuses: StatusBreakdown[];
}

export const REQUESTS_BY_STATUS_FALLBACK: RequestsByStatus = {
  period: 'September 2026',
  statuses: [
    {
      id: 'pending',
      label: 'Pending',
      count: 23,
      priorities: [
        { label: 'Critical', count: 8 },
        { label: 'Urgent', count: 9 },
        { label: 'Normal', count: 6 }
      ]
    },
    {
      id: 'verified',
      label: 'DSWD Confirmed',
      count: 31,
      priorities: [
        { label: 'Critical', count: 7 },
        { label: 'Urgent', count: 13 },
        { label: 'Normal', count: 11 }
      ]
    },
    {
      id: 'assisted',
      label: 'Assisted',
      count: 31,
      priorities: [
        { label: 'Critical', count: 6 },
        { label: 'Urgent', count: 12 },
        { label: 'Normal', count: 13 }
      ]
    },
    {
      id: 'completed',
      label: 'Completed',
      count: 88,
      priorities: [
        { label: 'Critical', count: 9 },
        { label: 'Urgent', count: 18 },
        { label: 'Normal', count: 61 }
      ]
    },
    {
      id: 'rejected',
      label: 'Rejected',
      count: 7,
      priorities: [
        { label: 'Critical', count: 1 },
        { label: 'Urgent', count: 2 },
        { label: 'Normal', count: 4 }
      ]
    }
  ]
};
