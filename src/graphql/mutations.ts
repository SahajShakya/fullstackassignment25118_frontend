import { gql } from '@apollo/client';

export const ENTER_STORE = gql`
  mutation EnterStore($storeId: String!) {
    enterStore(storeId: $storeId) {
      id
      name
      activeUserCount
      canEnter
      models {
        name
        position
      }
    }
  }
`;

export const EXIT_STORE = gql`
  mutation ExitStore($storeId: String!) {
    exitStore(storeId: $storeId) {
      id
      name
      activeUserCount
      canEnter
    }
  }
`;

export const UPDATE_MODEL_POSITION = gql`
  mutation UpdateModelPosition($storeId: String!, $modelName: String!, $position: [Float!]!) {
    updateModelPosition(storeId: $storeId, modelName: $modelName, position: $position) {
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
