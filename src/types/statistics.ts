
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

// Define type for trend data
export type TrendData = {
  date: string;
  views: number;
  downloads: number;
};

// Define type for content comparison data for radar chart
export type ContentComparison = {
  type: string;
  engagement: number;
  popularity: number;
  growth: number;
  retention: number;
};
