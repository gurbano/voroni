import RNG from "src/BNW3D/BNW/utils/random";
import { VDiagram, VCell, VEdge, VVErtex, VHEdge } from "../types/types";
import VoronoiUtils from "./voronoiUtils";
const voronoi = require('../vendor/voronoi');

const SIZE = 60 * 1000;
const SITES = 50000;

export type VFace = {
  va: number;
  vb: number;
  vc: number;
  edge: VEdge;
}
export type XCell = VCell & {
  faces: Array<VFace>;
  center: XVertex;
}
export type XEdge = VEdge & {
  
}
export type XVertex = VVErtex & {
  id: string;
  index: number;
  z: number;
}
export default class VoronoiWorld{
  rng: RNG;
  diagram: VDiagram;
  cells: Array<XCell>;
  vertices: Array<XVertex>;
  size: number;
  utils: VoronoiUtils;
  private verticesMap: Map<string, XVertex>;
  private pushVertex = (v: VVErtex): XVertex => {
    let id = `v${v.x}-${v.y}`;
    if (!this.verticesMap[id]){
      this.verticesMap[id] = {
        id, 
        index: this.vertices.length,
        x: v.x, y: 0, z: v.y,
      };
      this.vertices.push(this.verticesMap[id]);
    }
    return this.verticesMap[id];
  }
 
  constructor(){
    this.rng = new RNG(new Date().getTime());
    this.cells = [];
    this.vertices = [];
    this.verticesMap = new Map<string, XVertex>();
    this.utils = new VoronoiUtils();
    this.size = SIZE;
  }
  init = () => {
    this.generateDiagram();
    this.loadDiagram();
  }

  private generateDiagram = () => {
    const startX = 0;
    const startY = 0;
    const bbox = {xl: startX, xr: startX + SIZE, yt: startY, yb: startY + SIZE}; 
    const rsites = (): Array<{x: number, y: number}> => {
      return new Array(SITES).fill(0).map( () => 
      {return { x: this.rng.nextRange(bbox.xl, bbox.xr), y: this.rng.nextRange(bbox.yb, bbox.yt) }});
    }  
    const vor = new voronoi();
    this.diagram = vor.compute(rsites(), bbox);   
    this.diagram.bbox = bbox;
    
    this.relaxDiagram(bbox);
  }
  relaxDiagram = (bbox: any) => {
    const vor = new voronoi();
    let newsites = this.utils.relaxSites(this.diagram);
    this.diagram = vor.compute(newsites, bbox);   
  }
  private loadDiagram = () => {
    this.diagram.cells
      .sort( (c1: VCell, c2: VCell) =>  c1.site.voronoiId < c2.site.voronoiId ? -1 : 1  )
      .map( (c) => {
        let v0 = this.pushVertex({x: c.site.x, y: c.site.y});
        let xcell: XCell = {...c, faces: [], center: v0};
        xcell.halfedges.map( (he: VHEdge) => {
          let v1 = this.pushVertex(this.getStartpoint(he));
          let v2 = this.pushVertex(this.getEndpoint(he));
          let face: VFace = {
            va: v0.index,
            vb: v1.index,
            vc: v2.index,
            edge: he.edge,
          };
          xcell.faces.push(face);
        })
        this.cells.push(xcell);
      });
      console.log(this.vertices.length);
  }
  private getStartpoint = function(hedge: VHEdge) {
    return hedge.edge.lSite === hedge.site ? hedge.edge.va : hedge.edge.vb;
  };
  private getEndpoint = function(hedge: VHEdge) {
    return hedge.edge.lSite === hedge.site ? hedge.edge.vb : hedge.edge.va;
  };
}

