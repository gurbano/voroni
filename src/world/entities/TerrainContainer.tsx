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
  constructor(terrain: Terrain, scene: Scene){
    this.terrain = terrain;
    this.scene = scene;
    this.borders = undefined;
    this.pois = undefined;
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
      let border = new Border(start,end, edge);
      // border.register(this.scene);
      g.add(border.getObject());
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
      sphere.register(this.scene);
      return sphere;
    } );
  }
  updatePois(): any {
    if (!this.pois){
      this.initPois();
      this.updatePois();
    }else{
      this.pois.map( (b) =>{ 
        b.setPos({x: b.x, y: this.terrain.getVertexHeight(b.vertex) + 3, z: b.z})
      });
    }
  }
}