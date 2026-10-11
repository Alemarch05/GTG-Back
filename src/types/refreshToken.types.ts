export interface RefreshToken {
  id: number;
  user_id: string;      
  token_hash: string;
  expires_at: Date;
  is_revoked: boolean;
  created_at: Date;
}

export interface CreateRefreshTokenDTO {
  user_id: string;
  token_hash: string;
  expires_at: Date;
}