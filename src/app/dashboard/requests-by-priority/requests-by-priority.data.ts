export interface PrioritySlice {
  id: string;
  label: string;
  count: number;
}

export interface RequestsByPriority {
  period: string;
  priorities: PrioritySlice[];
}
