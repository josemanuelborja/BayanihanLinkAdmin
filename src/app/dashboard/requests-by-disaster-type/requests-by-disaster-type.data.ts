export interface DisasterTypeSlice {
  id: string;
  label: string;
  count: number;
}

export interface RequestsByDisasterType {
  period: string;
  disasters: DisasterTypeSlice[];
}
