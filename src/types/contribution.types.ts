export interface Contribution {
  id: string;
  campaign_id: string;
  user_id: string;
  amount: number;
  status: 'HELD' | 'RELEASED' | 'REFUNDED';
  created_at: Date;
}

export interface CreateContributionDTO {
  campaign_id: string;
  user_id: string;
  amount: number;
}