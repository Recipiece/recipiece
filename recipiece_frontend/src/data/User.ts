export interface UserAccount {
  readonly id: number;
  readonly email: string;
  readonly username: string;
  readonly created_at: string;
  readonly validated: boolean;
}

export interface RefreshTokenResponse {
  readonly refresh_token: string;
  readonly access_token: string;
}
