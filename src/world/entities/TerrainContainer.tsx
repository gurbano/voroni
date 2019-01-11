import Terrain from "./Terrain";
import { Scene, Group } from "three";
import Border from "./Border";
import POI from "./POI";


export default class TerrainContainer {

  setCellData(data: any): any {
    this.terrain.setCellData(data);
    this.update();
  }
  update(): any {
    this.updateBorders();
    this.updatePois();
  }
 
  terrain: Terrain;
  scene: Scene;
  borders: Array<Border> | undefined;
  pois: Array<POI> | undefined;
  cellBorders: Map<number, Array<Border>>;
  faceBorder: Map<number, Border>;
  constructor(terrain: Terrain, scene: Scene){
    this.terrain = terrain;
    this.scene = scene;
    this.borders = undefined;
    this.pois = undefined;
    this.cellBorders = new Map();
    this.faceBorder = new Map();
  }
  showBorders = (toggle: boolean) => {
    this.borders && this.borders.map( (b) =>{
       b.getObject().visible = toggle;
     });
  } 
  initBorders(): any {
    let g = new Group();
    this.borders = this.terrain.borders.map( (edge) => {
      let start = this.terrain.geom.vertices[edge.start];
      let end = this.terrain.geom.vertices[edge.end];
      const border = new Border(start,end, edge, edge.face);
      g.add(border.getObject());
      this.faceBorder[edge.face.index] = border;
      if (edge.edge && edge.edge.lSite){
        if (!this.cellBorders[edge.edge.lSite.voronoiId]){
          this.cellBorders[edge.edge.lSite.voronoiId] = new Array();
        }
        this.cellBorders[edge.edge.lSite.voronoiId].push(border);
      }
      if (edge.edge && edge.edge.rSite){
        if (!this.cellBorders[edge.edge.rSite.voronoiId]){
          this.cellBorders[edge.edge.rSite.voronoiId] = new Array();
        }
        this.cellBorders[edge.edge.rSite.voronoiId].push(border);
      }
      return border;
    } );
    this.scene.add(g);
  }
  updateBorders(): any {
    if (!this.borders){
      this.borders = [];
      this.initBorders();
      this.updateBorders();
    }else{
      this.borders.map( (b) =>{ 
        let start = this.terrain.geom.vertices[b.edge.start];
        let end = this.terrain.geom.vertices[b.edge.end];
        b.setPoints(start, end); 
      });
    }
  }
  showPois = (toggle: boolean) => {
    this.pois && this.pois.map( (b) =>{
       b.getObject().visible = toggle;
     });
  } 
  initPois(): any {
    this.pois = this.terrain.cells.map( (cell) => {
      let sphere = new POI(cell.cell.site.x, this.terrain.getVertexHeight(cell.center), cell.cell.site.y, cell.center);
      return sphere;
    } );
  }
  updatePois(): any {
    if (!this.pois){
      this.initPois();
      this.updatePois();
    }else{
      this.pois.map( (b) =>{ 
        if (this.terrain.getVertexHeight(b.vertex) > 0){
          b.setPos({x: b.x, y: this.terrain.getVertexHeight(b.vertex) + 30, z: b.z});
          b.register(this.scene);
        }else{
          b.deregister(this.scene);
        }
        
      });
    }
  }
}