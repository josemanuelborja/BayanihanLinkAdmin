export interface DisasterTypeSlice {
  id: string;
  label: string;
  count: number;
}

export interface RequestsByDisasterType {
  period: string;
  disasters: DisasterTypeSlice[];
}

export const REQUESTS_BY_DISASTER_TYPE_FALLBACK: RequestsByDisasterType = {
  period: 'September 2026',
  disasters: [
    { id: 'typhoon', label: 'Typhoon', count: 58 },
    { id: 'flood', label: 'Flood', count: 34 },
    { id: 'fire', label: 'Fire', count: 21 },
    { id: 'earthquake', label: 'Earthquake', count: 18 },
    { id: 'other', label: 'Other disasters', count: 11 }
  ]
};
