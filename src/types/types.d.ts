
export interface VVErtex {
  x: number;
  y: number;
}
export interface VSite {
  x: number;
  y: number;
  voronoiId: number;
}
export interface VEdge {
  lSite: VSite;
  rSite: VSite;
  va: VVErtex;
  vb: VVErtex;
}
export interface VHEdge {
  angle: number;
  edge: VEdge;
  site: VSite;
}
export interface VCell {
  closeMe: boolean;
  halfedges: Array<VHEdge>;
  site: VSite;
}
export interface VDiagram {
  bbox: {
    xl: number, 
    xr: number, 
    yt: number, 
    yb: number,
  }
  cells: Array<VCell>;
  edges: Array<VEdge>;
  vertices: Array<VVErtex>;
}