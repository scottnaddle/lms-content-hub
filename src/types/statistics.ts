
// Define type for content statistics data
export type ContentStats = {
  type: string;
  count: number;
  viewCount: number;
  downloadCount: number;
};

// Define type for view history data (monthly)
export type ViewHistory = {
  month: string;
  count: number;
};
