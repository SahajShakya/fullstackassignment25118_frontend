export interface Model {
  name: string;
  glbUrl: string;
  position: [number, number];
  size: [number, number, number];
  entranceOrder: number;
}

export interface Store {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  models: Model[];
  activeUserCount: number;
  canEnter: boolean;
}

export interface GetStoresResponse {
  getAllStores: Store[];
}
