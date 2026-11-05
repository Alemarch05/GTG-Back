export interface Campaign {
  id: string;
  title: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  category?: string;
  status?: string;
  creator_id?: string;
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateCampaignDTO {
  title?: string;
  description?: string;
  target_amount?: number;
  expires_at?: Date | string;
}