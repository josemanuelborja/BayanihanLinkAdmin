// BayanihanLink — DSWD admin request data.
//
// Single source of truth shared by the DSWD dashboard, review and status
// pages so a request shows the same details wherever it is opened.
//
// Every id here is reachable from the dashboard table or the status
// tracker; navigating to an unknown id bounces back to the dashboard.

export type DswdPriority = 'CRITICAL' | 'URGENT' | 'NORMAL';

export type DswdStatus =
  | 'For Coordination'
  | 'Submitted for Verification'
  | 'Verified'
  | 'For Distribution'
  | 'Distributed';

export interface DswdRequest {
  id: string;
  requester: string;

  disasterType: string;
  location: string;
  personsAffected: string;

  /** Short item name, as shown in the dashboard table. */
  item: string;
  quantity: string;
  /** Full item label, as shown on the review page. */
  itemDetail: string;

  dateSubmitted: string;
  verifiedByAdmin: string;
  /** Day the request landed on the dashboard table. */
  date: string;

  priority: DswdPriority;
  status: DswdStatus;

  offerId: string;
  offerItem: string;
  offerQuantity: string;
  offerDate: string;

  notes: string;
}

/** The workflow steps a DSWD officer can move a request through. */
export const DSWD_STATUSES: readonly DswdStatus[] = [
  'For Coordination',
  'Submitted for Verification',
  'Verified',
  'For Distribution',
  'Distributed'
];

export const DSWD_REQUESTS: readonly DswdRequest[] = [
  {
    id: 'BL-000234',
    requester: 'Juan Dela Cruz',
    disasterType: 'Flood',
    location: 'Brgy. 14, CDO City, Region X',
    personsAffected: '50 families',
    item: 'Drinking Water',
    quantity: '100 bottles',
    itemDetail: 'Drinking Water (1L bottles)',
    dateSubmitted: 'Sep 15, 2026',
    verifiedByAdmin: 'Sep 15, 2026',
    date: 'Sep 16, 2026',
    priority: 'CRITICAL',
    status: 'Submitted for Verification',
    offerId: 'DO-000089',
    offerItem: 'Drinking Water (1L bottles)',
    offerQuantity: '30 bottles',
    offerDate: 'Sep 16, 2026',
    notes:
      'Coordination submitted to DSWD Region X. ' +
      'Donor confirmed availability on Sep 16, 2026. ' +
      'Assistance covers partial needs — 30 of 100 bottles offered.'
  },
  {
    id: 'BL-000302',
    requester: 'Ana Flores',
    disasterType: 'Typhoon',
    location: 'Poblacion, Iligan City, Region X',
    personsAffected: '120 families',
    item: 'Food Supply',
    quantity: '30 sacks rice',
    itemDetail: 'Food Supply (rice, canned goods)',
    dateSubmitted: 'Sep 15, 2026',
    verifiedByAdmin: 'Sep 15, 2026',
    date: 'Sep 16, 2026',
    priority: 'CRITICAL',
    status: 'For Distribution',
    offerId: 'DO-000085',
    offerItem: 'Food Supply (rice, canned goods)',
    offerQuantity: '30 sacks',
    offerDate: 'Sep 16, 2026',
    notes:
      'Evacuation center in Iligan City. ' +
      'Offer covers full rice requirement; canned goods still pending.'
  },
  {
    id: 'BL-000280',
    requester: 'Maria Santos',
    disasterType: 'Typhoon',
    location: 'Surigao del Norte, Region XIII',
    personsAffected: '35 families',
    item: 'Blankets',
    quantity: '25 pieces',
    itemDetail: 'Blankets (warm-weather)',
    dateSubmitted: 'Sep 13, 2026',
    verifiedByAdmin: 'Sep 13, 2026',
    date: 'Sep 14, 2026',
    priority: 'URGENT',
    status: 'Submitted for Verification',
    offerId: 'DO-000079',
    offerItem: 'Blankets (warm-weather)',
    offerQuantity: '25 pieces',
    offerDate: 'Sep 14, 2026',
    notes:
      'Cold-weather shelter. ' +
      'Awaiting DSWD confirmation of quantities before release.'
  },
  {
    id: 'BL-000241',
    requester: 'Rosa Lopez',
    disasterType: 'Flood',
    location: 'Davao City, Region XI',
    personsAffected: '60 families',
    item: 'Hygiene Kits',
    quantity: '40 packs',
    itemDetail: 'Hygiene Kits (toothbrush, soap, towel)',
    dateSubmitted: 'Sep 12, 2026',
    verifiedByAdmin: 'Sep 12, 2026',
    date: 'Sep 13, 2026',
    priority: 'URGENT',
    status: 'Verified',
    offerId: 'DO-000065',
    offerItem: 'Hygiene Kits (toothbrush, soap, towel)',
    offerQuantity: '40 packs',
    offerDate: 'Sep 13, 2026',
    notes: 'Verified by DSWD Region XI. Cleared for distribution.'
  },
  {
    id: 'BL-000220',
    requester: 'Pedro Garcia',
    disasterType: 'Typhoon',
    location: 'Butuan City, Region XIII',
    personsAffected: '18 families',
    item: 'Medicine Kit',
    quantity: '15 kits',
    itemDetail: 'Medicine Kit (basic)',
    dateSubmitted: 'Sep 11, 2026',
    verifiedByAdmin: 'Sep 11, 2026',
    date: 'Sep 12, 2026',
    priority: 'NORMAL',
    status: 'For Distribution',
    offerId: 'DO-000055',
    offerItem: 'Medicine Kit (basic)',
    offerQuantity: '15 kits',
    offerDate: 'Sep 12, 2026',
    notes: 'Basic medicines for the barangay health station.'
  },
  {
    id: 'BL-000123',
    requester: 'Maria Santos',
    disasterType: 'Typhoon',
    location: 'CDO City, Region X',
    personsAffected: '42 families',
    item: 'Food & Water',
    quantity: '45 boxes',
    itemDetail: 'Food & Water (ready-to-eat)',
    dateSubmitted: 'Sep 9, 2026',
    verifiedByAdmin: 'Sep 9, 2026',
    date: 'Sep 10, 2026',
    priority: 'URGENT',
    status: 'Submitted for Verification',
    offerId: 'DO-000101',
    offerItem: 'Food & Water (ready-to-eat)',
    offerQuantity: '45 boxes',
    offerDate: 'Sep 10, 2026',
    notes: 'Released from a regional stock cluster pending verification.'
  },
  {
    id: 'BL-000189',
    requester: 'Ana Reyes',
    disasterType: 'Fire',
    location: 'Davao City, Region XI',
    personsAffected: '12 families',
    item: 'Medicine Kit',
    quantity: '10 kits',
    itemDetail: 'Medicine Kit (basic)',
    dateSubmitted: 'Sep 8, 2026',
    verifiedByAdmin: 'Sep 8, 2026',
    date: 'Sep 9, 2026',
    priority: 'NORMAL',
    status: 'Distributed',
    offerId: 'DO-000094',
    offerItem: 'Medicine Kit (basic)',
    offerQuantity: '10 kits',
    offerDate: 'Sep 9, 2026',
    notes: 'Fully distributed. Distribution signed off by the barangay.'
  },
  {
    id: 'BL-000256',
    requester: 'Pedro Garcia',
    disasterType: 'Typhoon',
    location: 'Butuan City, Region XIII',
    personsAffected: '28 families',
    item: 'Blankets & Clothing',
    quantity: '60 pieces',
    itemDetail: 'Blankets & Clothing',
    dateSubmitted: 'Sep 14, 2026',
    verifiedByAdmin: '—',
    date: 'Sep 15, 2026',
    priority: 'URGENT',
    status: 'For Coordination',
    offerId: 'DO-000108',
    offerItem: 'Blankets & Clothing',
    offerQuantity: '60 pieces',
    offerDate: 'Sep 15, 2026',
    notes: 'Newly submitted. Awaiting an assigned DSWD officer.'
  },
  {
    id: 'BL-000290',
    requester: 'Rosa Lopez',
    disasterType: 'Earthquake',
    location: 'Surigao del Norte, Region XIII',
    personsAffected: '9 families',
    item: 'Hygiene Supplies',
    quantity: '30 packs',
    itemDetail: 'Hygiene Supplies',
    dateSubmitted: 'Sep 5, 2026',
    verifiedByAdmin: 'Sep 5, 2026',
    date: 'Sep 6, 2026',
    priority: 'NORMAL',
    status: 'Distributed',
    offerId: 'DO-000072',
    offerItem: 'Hygiene Supplies',
    offerQuantity: '30 packs',
    offerDate: 'Sep 6, 2026',
    notes: 'Distributed. Awaiting post-distribution reporting.'
  }
];

/** Requests shown on the dashboard table, highest priority first. */
export const DSWD_ATTENTION_REQUESTS: readonly DswdRequest[] = DSWD_REQUESTS.slice(0, 5);

export function findDswdRequest(id: string | null | undefined): DswdRequest | undefined {
  if (!id) return undefined;
  return DSWD_REQUESTS.find(request => request.id === id);
}

const PRIORITY_CLASSES: Record<DswdPriority, string> = {
  CRITICAL: 'critical',
  URGENT: 'urgent',
  NORMAL: 'normal'
};

export interface DswdStatusBadge {
  label: string;
  class: string;
}

const STATUS_BADGES: Record<DswdStatus, DswdStatusBadge> = {
  'For Coordination': { label: 'For Coordination', class: 'coordination' },
  'Submitted for Verification': { label: 'For Verification', class: 'verification' },
  'Verified': { label: 'Verified', class: 'verified' },
  'For Distribution': { label: 'For Distribution', class: 'distribution' },
  'Distributed': { label: 'Distributed', class: 'distributed' }
};

export function priorityClass(priority: DswdPriority): string {
  return PRIORITY_CLASSES[priority];
}

/** Badge shown in the dashboard table and on the review page header. */
export function statusBadge(status: DswdStatus): DswdStatusBadge {
  return STATUS_BADGES[status];
}