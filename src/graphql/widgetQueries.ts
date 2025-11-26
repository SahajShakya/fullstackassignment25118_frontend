import { gql } from '@apollo/client';

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

export const GET_ANALYTICS_SUMMARY = gql`
  query GetAnalyticsSummary($storeId: String!) {
    getAnalyticsSummary(storeId: $storeId) {
      pageView
      videoLoaded
      linkClicked
    }
  }
`;
