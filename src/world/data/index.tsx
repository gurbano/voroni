export enum STEEP {
  FLAT = 'FLAT',
  HALF = 'HALF',
  STEEP = 'STEEP',
}
export enum BIOMES {
  DESERT = 'DESERT',
  GRASSLAND = 'GRASSLAND',
  RAIN_FOREST = 'RAIN_FOREST',
  FOREST = 'FOREST',
  TAIGA = 'TAIGA',
  TUNDRA = 'TUNDRA',
  SWAMP = 'SWAMP',
  SEA = 'SEA',
  LAKE = 'LAKE',
  OCEAN = 'OCEAN',
}

export interface CellData {
  height: number; 
  biome: BIOMES; //main natural biome
  humidity: number; //0-10
  water: boolean;
  facedata: Map<number, Partial<FaceData>>;
}
export interface FaceData {
  steepness: STEEP;
  biomes: Array<{ratio: number, biome: BIOMES}>;// according to neighbour area [{ ratio: 0...1 }]
  neighbour: CellData;
}