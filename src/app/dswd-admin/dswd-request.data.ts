export type ValidationOutcome = 'Pending' | 'Confirmed' | 'Not confirmed';

export interface DswdValidationCase {
  donationType: 'Request-linked donation' | 'Open donation';
  id: string;
  disasterType?: string;
  location?: string;
  personsAffected?: string;
  requestId?: string;
  item?: string;
  quantity?: string;
  offerId: string;
  offerItem: string;
  offerQuantity: string;
  priority: 'CRITICAL' | 'URGENT' | 'NORMAL';
  disasterEligibility: ValidationOutcome;
  requestedItemsAssessment: ValidationOutcome;
  donatedItemsAssessment: ValidationOutcome;
  suggestedDestination: string;
  notes: string;
}

// Prototype cases only. These are demonstration records, not live DSWD submissions.
export const DSWD_VALIDATION_CASES: DswdValidationCase[] = [
  {
    donationType: 'Request-linked donation', id: 'BL-000234', requestId: 'BL-000234', disasterType: 'Flood', location: 'Brgy. 14, CDO City, Region X',
    personsAffected: '50 families', item: 'Drinking Water (1L bottles)', quantity: '100 bottles',
    offerId: 'DO-000089', offerItem: 'Drinking Water (1L bottles)', offerQuantity: '30 bottles',
    priority: 'CRITICAL', disasterEligibility: 'Pending', requestedItemsAssessment: 'Pending', donatedItemsAssessment: 'Pending', suggestedDestination: '',
    notes: 'App Admin requested external confirmation. No decision is recorded yet.'
  },
  {
    donationType: 'Request-linked donation', id: 'BL-000302', requestId: 'BL-000302', disasterType: 'Typhoon', location: 'Poblacion, Iligan City, Region X',
    personsAffected: '120 families', item: 'Food Supply (rice, canned goods)', quantity: '30 sacks rice',
    offerId: 'DO-000085', offerItem: 'Food Supply (rice, canned goods)', offerQuantity: '30 sacks',
    priority: 'CRITICAL', disasterEligibility: 'Pending', requestedItemsAssessment: 'Pending', donatedItemsAssessment: 'Pending', suggestedDestination: '',
    notes: 'App Admin requested external confirmation. No decision is recorded yet.'
  },
  {
    donationType: 'Request-linked donation', id: 'BL-000280', requestId: 'BL-000280', disasterType: 'Typhoon', location: 'Surigao del Norte, Region XIII',
    personsAffected: '35 families', item: 'Blankets (warm-weather)', quantity: '25 pieces',
    offerId: 'DO-000079', offerItem: 'Blankets (warm-weather)', offerQuantity: '25 pieces',
    priority: 'URGENT', disasterEligibility: 'Pending', requestedItemsAssessment: 'Pending', donatedItemsAssessment: 'Pending', suggestedDestination: '',
    notes: 'App Admin requested external confirmation. No decision is recorded yet.'
  },
  {
    donationType: 'Open donation', id: 'DO-000101', disasterType: 'Community relief', location: 'Region X — destination to be assessed',
    offerId: 'DO-000101', offerItem: 'Family food packs', offerQuantity: '100 packs',
    priority: 'NORMAL', disasterEligibility: 'Pending', requestedItemsAssessment: 'Pending', donatedItemsAssessment: 'Pending', suggestedDestination: '',
    notes: 'Donor offered items without selecting a specific request. DSWD to assess a suitable destination.'
  }
];

export function findDswdValidationCase(id: string | null | undefined): DswdValidationCase | undefined {
  return id ? DSWD_VALIDATION_CASES.find(item => item.id === id) : undefined;
}
