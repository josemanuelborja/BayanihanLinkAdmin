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
