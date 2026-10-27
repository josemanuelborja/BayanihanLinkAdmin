import { ApiOffer, ApiRequest } from '../api/api.service';

export type ValidationOutcome = 'Pending' | 'Confirmed' | 'Not confirmed';

export interface DswdValidationCase {
  donationType: 'Request-linked donation' | 'Open donation';
  id: string;
  offerRawId: string;
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

function toOutcome(value?: string): ValidationOutcome {
  return value === 'Confirmed' || value === 'Not confirmed' ? value : 'Pending';
}

// Joins "10" + "sacks" but avoids "10 sacks sacks" when the unit is already there.
function formatQuantity(quantity?: string, unit?: string): string {
  const amount = (quantity || '').trim();
  const suffix = (unit || '').trim();
  if (!suffix) return amount;
  if (amount.toLowerCase().endsWith(suffix.toLowerCase())) return amount;
  return `${amount} ${suffix}`.trim();
}

// Turns real offers from MongoDB into the rows the DSWD review pages display.
export function buildDswdCases(offers: ApiOffer[], requests: ApiRequest[]): DswdValidationCase[] {
  const requestsById = new Map(requests.map(request => [request.id, request]));

  return offers.map(offer => {
    const request = requestsById.get(offer.requestId);
    const reference = offer.referenceNo || offer._id;
    const offerQuantity = formatQuantity(offer.quantityOffered, offer.unit);

    return {
      donationType: request ? 'Request-linked donation' : 'Open donation',
      id: reference,
      offerRawId: offer._id,
      disasterType: request?.disasterType || offer.requestDisasterType || '',
      location: request?.location || offer.requestLocation || 'Destination not specified',
      personsAffected: request ? `${request.personsAffected} families/individuals` : '',
      requestId: request?.referenceNo || offer.requestReferenceNo || '',
      item: request?.itemNeeded || offer.requestItem || '',
      quantity: request ? formatQuantity(request.quantity, request.unit) : '',
      offerId: reference,
      offerItem: request?.itemNeeded || offer.requestItem || 'Relief goods',
      offerQuantity,
      priority: request?.urgency || offer.requestUrgency || 'NORMAL',
      disasterEligibility: toOutcome(offer.dswdDisasterEligibility),
      requestedItemsAssessment: toOutcome(offer.dswdRequestedItemsAssessment),
      donatedItemsAssessment: toOutcome(offer.dswdDonatedItemsAssessment),
      suggestedDestination: offer.dswdSuggestedDestination || '',
      notes: offer.dswdNotes || ''
    };
  });
}
