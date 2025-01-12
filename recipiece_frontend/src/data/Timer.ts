export interface Timer {
  readonly id: number;
  readonly created_at: string;
  readonly duration_ms: number;
}

export interface ListTimerFilters {
  readonly page_number: number;
}
