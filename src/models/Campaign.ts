export type CampaignCategory =
  | 'Disaster Relief'
  | 'Medical Assistance'
  | 'Educational Assistance'
  | 'Food and Basic Needs'
  | 'Community Assistance'
  | 'Emergency Relief'
  | 'Other';

export const CAMPAIGN_CATEGORIES: CampaignCategory[] = [
  'Disaster Relief',
  'Medical Assistance',
  'Educational Assistance',
  'Food and Basic Needs',
  'Community Assistance',
  'Emergency Relief',
  'Other',
];

// Campaign type
export type CampaignType = 'fundraiser' | 'volunteer_event';

// Categories for volunteer assistance
export const VOLUNTEER_HELP_CATEGORIES = [
  'Healthcare / Medical',
  'Food & Relief Distribution',
  'Emergency Response',
  'Education & Tutoring',
  'Logistics & Transportation',
  'Community Outreach',
  'Environmental Cleanup',
  'Construction & Repair',
  'Other',
] as const;

export type VolunteerHelpCategory =
  (typeof VOLUNTEER_HELP_CATEGORIES)[number];

/** New campaigns require administrator approval. */
export type CampaignStatus =
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Active'
  | 'Completed'
  | 'Suspended';

/** Public campaigns can be viewed by visitors. */
export const PUBLIC_STATUSES: CampaignStatus[] = [
  'Active',
  'Completed',
];

/** Rejected campaigns can be edited and resubmitted. */
export const EDITABLE_STATUSES: CampaignStatus[] = [
  'Rejected',
];

export interface Campaign {
  id: string;
  organizerId: string;
  organizerName: string;

  title: string;
  description: string;
  category: CampaignCategory;

  beneficiaryName: string;
  beneficiaryInfo: string;
  imageUrl: string;

  goalAmount: number;
  startDate: string;
  deadline: string;

  status: CampaignStatus;

  locationAddress: string;
  latitude: number | null;
  longitude: number | null;

  createdAt: string;

  verifiedTotal: number;
  verifiedDonorCount: number;

  rejectionReason: string;
  reviewedBy: string;
  reviewedAt: string;

  // NEW: Event and volunteer information
  type?: CampaignType;
  needsVolunteers?: boolean;
  volunteerHelpCategory?: VolunteerHelpCategory | '';

  // Volunteer details (required only when applicable)
  volunteerDuties?: string;
  volunteerRequirements?: string;
  volunteerDate?: string | null;
  volunteerSlots?: number;
  volunteerCount?: number;
  volunteerLocation?: string;

  // Contact and payment information
  contactPhone?: string;
  payoutMethod?: 'GCash' | 'Maya' | 'Bank Transfer';
  payoutName?: string;
  payoutNumber?: string;

  // Uploaded document references
  coverFileId?: string | null;
  validIdFileId?: string | null;
  barangayClearanceFileId?: string | null;
  situationPhotoFileId?: string | null;
  eligibilityProofFileId?: string | null;
}