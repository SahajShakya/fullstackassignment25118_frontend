import { gql } from '@apollo/client';

export const CREATE_WIDGET = gql`
  mutation CreateWidget(
    $storeId: String!
    $domain: String!
    $videoUrl: String!
    $bannerText: String!
  ) {
    createWidget(
      storeId: $storeId
      domain: $domain
      videoUrl: $videoUrl
      bannerText: $bannerText
    ) {
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

export const UPDATE_WIDGET = gql`
  mutation UpdateWidget(
    $widgetId: String!
    $videoUrl: String
    $bannerText: String
    $isActive: Boolean
  ) {
    updateWidget(
      widgetId: $widgetId
      videoUrl: $videoUrl
      bannerText: $bannerText
      isActive: $isActive
    ) {
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

export const DELETE_WIDGET = gql`
  mutation DeleteWidget($widgetId: String!) {
    deleteWidget(widgetId: $widgetId)
  }
`;
