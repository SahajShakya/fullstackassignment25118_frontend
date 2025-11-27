export interface WidgetConfig {
  id: string;
  storeId: string;
  domain: string;
  videoUrl: string;
  bannerText: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsSummary {
  pageView: number;
  videoLoaded: number;
  linkClicked: number;
}

export interface GetWidgetsByStoreResponse {
  getWidgetsByStore: WidgetConfig[];
}

export interface GetAllWidgetsResponse {
  getAllWidgets: WidgetConfig[];
}

export interface GetAnalyticsSummaryResponse {
  getAnalyticsSummary: AnalyticsSummary;
}

export interface GetAnalyticsByDomainResponse {
  getAnalyticsByDomain: AnalyticsSummary;
}

export interface CreateWidgetResponse {
  createWidget: WidgetConfig;
}

export interface UpdateWidgetResponse {
  updateWidget: WidgetConfig;
}

export interface GetWidgetByIdResponse {
  getWidgetById: WidgetConfig;
}
