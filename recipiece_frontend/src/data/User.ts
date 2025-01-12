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

export type UserKitchenMembershipStatus = "accepted" | "denied" | "pending";

export interface UserKitchenMembership {
  readonly id: number;
  readonly created_at: string;
  readonly destination_user: {
    readonly id: number;
    readonly username: string;
  };
  readonly source_user: {
    readonly id: number;
    readonly username: string;
  };
  readonly status: UserKitchenMembershipStatus;
}

export interface ListUserKitchenMembershipFilters {
  readonly page_number: number;
  readonly page_size?: number;
  readonly targeting_self?: boolean;
  readonly from_self?: boolean;
  readonly status?: UserKitchenMembershipStatus[];
  readonly entity_id?: number;
  readonly entity?: "include" | "exclude";
  readonly entity_type?: "shopping_list" | "recipe";
}

export interface ListUserKitchenMembershipsResponse {
  readonly data: UserKitchenMembership[];
  readonly has_next_page: boolean;
  readonly page: number;
}
