import RNG from "../utils/random";

const voronoi = require('../vendor/voronoi');

export interface VVErtex {
  x: number;
  y: number;
}
export interface VSite {
  x: number;
  y: number;
  voronoiId?: number;
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

interface PatchConfig{
  width: number;
  height: number;
  rng: RNG;
  offX: number;
  offY: number;
  density: number
}
export class VoronoiWorld {
  sites: number;
  offX: number;
  offY: number;
  width: number;
  height: number;
  rng: RNG;

  diagram: VDiagram;
  
  constructor(opts: PatchConfig){
    this.rng = opts.rng;
    this.width = opts.width;
    this.height = opts.height;
    this.sites = Math.floor(opts.density * (this.width/1000 * this.height/1000));
    this.offX = opts.offX;
    this.offY = opts.offY;
  }
  relaxSites = () => {
    if (!this.diagram) {return;}
    var cells = this.diagram.cells,
      iCell = cells.length,
      cell,
      site, sites = [],
      again = false,
      rn, dist;
    var p = 1 / iCell * 0.1;
    while (iCell--) {
      cell = cells[iCell];
      rn = Math.random();
      // probability of apoptosis
      if (rn < p) {
        continue;
        }
      site = this.cellCentroid(cell);
      dist = this.distance(site, cell.site);
      again = again || dist > 1;
      // don't relax too fast
      if (dist > 2) {
        site.x = (site.x+cell.site.x)/2;
        site.y = (site.y+cell.site.y)/2;
        }
      // probability of mytosis
      if (rn > (1-p)) {
        dist /= 2;
        sites.push({
          x: site.x+(site.x-cell.site.x)/dist,
          y: site.y+(site.y-cell.site.y)/dist,
          });
        }
      sites.push(site);
      }
      this.generatePatch(sites);
    };


  distance = (a: VVErtex, b: VVErtex) => {
    var dx = a.x-b.x;
    let dy = a.y-b.y;
    return Math.sqrt(dx*dx+dy*dy);
  };
  
  getStartpoint = function(hedge: VHEdge) {
    return hedge.edge.lSite === hedge.site ? hedge.edge.va : hedge.edge.vb;
  };
  getEndpoint = function(hedge: VHEdge) {
    return hedge.edge.lSite === hedge.site ? hedge.edge.vb : hedge.edge.va;
  };
  
  cellArea = (cell: VCell) => {
    var area = 0,
    halfedges = cell.halfedges,
    iHalfedge = halfedges.length,
    halfedge,
    p1, p2;
    while (iHalfedge--) {
      halfedge = halfedges[iHalfedge];
      p1 = this.getStartpoint(halfedge);
      p2 = this.getEndpoint(halfedge);
      area += p1.x * p2.y;
      area -= p1.y * p2.x;
      }
    area /= 2;
    return area;
  };
  cellCentroid = (cell: VCell) => {
    var x = 0, y = 0,
      halfedges = cell.halfedges,
      iHalfedge = halfedges.length,
      halfedge,
      v, p1, p2;
    while (iHalfedge--) {
      halfedge = halfedges[iHalfedge];
      p1 = this.getStartpoint(halfedge);
      p2 = this.getEndpoint(halfedge);
      v = p1.x*p2.y - p2.x*p1.y;
      x += (p1.x+p2.x) * v;
      y += (p1.y+p2.y) * v;
      }
    v = this.cellArea(cell) * 6;
    return {x:x/v,y:y/v};
    };
  generatePatch = (sites?: Array<VSite>) => {
    const startX = this.offX * this.width;
    const startY = this.offY * this.height;
    const bbox = {xl: startX, xr: startX + this.width, yt: startY, yb: startY + this.height}; 
    const rsites = (): Array<{x: number, y: number}> => {
      return new Array(this.sites).fill(0).map( () => 
      {return { x: this.rng.nextRange(bbox.xl, bbox.xr), y: this.rng.nextRange(bbox.yb, bbox.yt) }});
    }  
    sites = sites ? sites : rsites();
    const vor = new voronoi();
    this.diagram = vor.compute(sites, bbox);
    this.diagram.bbox = bbox;
  }
}