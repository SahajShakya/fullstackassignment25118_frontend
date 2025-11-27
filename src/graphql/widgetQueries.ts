import { gql } from '@apollo/client';

export const GET_WIDGET_BY_ID = gql`
  query GetWidgetById($widgetId: String!) {
    getWidgetById(widgetId: $widgetId) {
      id
      storeId
      domain
      videoUrl
      bannerText
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_WIDGETS_BY_STORE = gql`
  query GetWidgetsByStore($storeId: String!) {
    getWidgetsByStore(storeId: $storeId) {
      id
      storeId
      domain
      videoUrl
      bannerText
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_ALL_WIDGETS = gql`
  query GetAllWidgets {
    getAllWidgets {
      id
      storeId
      domain
      videoUrl
      bannerText
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_ANALYTICS_SUMMARY = gql`
  query GetAnalyticsSummary($storeId: String!) {
    getAnalyticsSummary(storeId: $storeId) {
      pageView
      videoLoaded
      linkClicked
    }
  }
`;

export const GET_ANALYTICS_BY_DOMAIN = gql`
  query GetAnalyticsByDomain($domain: String!) {
    getAnalyticsByDomain(domain: $domain) {
      pageView
      videoLoaded
      linkClicked
    }
  }
`;

export const TRACK_EVENT = gql`
  mutation TrackEvent(
    $storeId: String!
    $domain: String!
    $eventType: String!
    $userAgent: String
    $ipAddress: String
  ) {
    trackEvent(
      storeId: $storeId
      domain: $domain
      eventType: $eventType
      userAgent: $userAgent
      ipAddress: $ipAddress
    )
  }
`;
