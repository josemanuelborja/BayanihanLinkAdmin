export interface PrioritySlice {
  id: string;
  label: string;
  count: number;
}

export interface RequestsByPriority {
  period: string;
  priorities: PrioritySlice[];
}

export const REQUESTS_BY_PRIORITY_FALLBACK: RequestsByPriority = {
  period: 'September 2026',
  priorities: [
    { id: 'critical', label: 'Critical', count: 33 },
    { id: 'urgent', label: 'Urgent', count: 42 },
    { id: 'normal', label: 'Normal', count: 67 }
  ]
};
