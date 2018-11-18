import { VDiagram, VHEdge, VVErtex, VCell } from "../types/types";

export default class VoronoiUtils{
  diagram: any;
  constructor() {
    
  }
  relaxSites = (diagram: VDiagram) => {
    if (!diagram) {return;}
    var cells = diagram.cells,
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
      return sites;
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
  
}