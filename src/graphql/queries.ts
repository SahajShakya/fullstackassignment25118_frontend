import { gql } from '@apollo/client';

// Queries
export const GET_ALL_STORES = gql`
  query GetAllStores {
    getAllStores {
      id
      name
      description
      imageUrl
      activeUserCount
      models {
        name
        glbUrl
        position
        size
        entranceOrder
      }
    }
  }
`;

export const GET_STORE = gql`
  query GetStore($storeId: String!) {
    getStore(storeId: $storeId) {
      id
      name
      description
      imageUrl
      activeUserCount
      models {
        name
        glbUrl
        position
        size
        entranceOrder
      }
    }
  }
`;

// Mutations
export const ENTER_STORE = gql`
  mutation EnterStore($storeId: String!, $userId: String!) {
    enterStore(storeId: $storeId, userId: $userId) {
      id
      name
      activeUserCount
      sessionId
      models {
        name
        position
      }
    }
  }
`;

export const EXIT_STORE = gql`
  mutation ExitStore($storeId: String!, $sessionId: String!) {
    exitStore(storeId: $storeId, sessionId: $sessionId) {
      id
      name
      activeUserCount
    }
  }
`;

export const UPDATE_MODEL_POSITION = gql`
  mutation UpdateModelPosition($storeId: String!, $modelName: String!, $position: [Float!]!, $userId: String!) {
    updateModelPosition(storeId: $storeId, modelName: $modelName, position: $position, userId: $userId) {
      id
      name
      activeUserCount
      models {
        name
        position
      }
    }
  }
`;

export const INSTALL_WIDGET = gql`
  mutation InstallWidget($storeId: String!, $widgetId: String!) {
    installWidget(storeId: $storeId, widgetId: $widgetId) {
      id
      name
      description
      imageUrl
      activeUserCount
      installedWidgetId
      installedWidgetDomain
      models {
        name
        glbUrl
        position
        size
        entranceOrder
      }
    }
  }
`;

// Subscription
export const STORE_UPDATED = gql`
  subscription StoreUpdated($storeId: String!) {
    storeUpdated(storeId: $storeId) {
      id
      name
      description
      imageUrl
      activeUserCount
      installedWidgetId
      installedWidgetDomain
      models {
        name
        glbUrl
        position
        size
        entranceOrder
      }
    }
  }
`;
