import * as THREE from "three";
import WorldManager from "./api";
import { Point3D } from "./api/world";
import ShapesBuilder from "./utils/ShapeBuilder";
import { WDiagram, WCell, WBorder } from "./api/DWorld";
import { Object3D, Vector3 } from "three";


export interface IBNW {
  getSea: () => THREE.Object3D;
  getTerrain: (pos: Point3D) => THREE.Object3D;
  getCellBorders: (pos: Point3D) => THREE.Object3D;
  getVertices: (pos: Point3D) => THREE.Object3D;
}

 
const SB = new ShapesBuilder();

export default class BNWEngine implements IBNW{
  updateVertices(around: Point3D): any {
    this.ww.get3DWorld(around).refresh3DWorld();
  }

  
  ww = new WorldManager();
  constructor(){
    this.ww.resetWorld();
    console.log(this.ww.world);
  }
  getSea(){
    let mesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2048,2048),
      new THREE.MeshLambertMaterial(),
    );
    mesh.rotation.x = -(Math.PI /2);
    mesh.position.set(1024,10,1024);
    return mesh;
  }

  getTerrain(around: Point3D) {  
   return this.ww.get3DWorld(around).mesh || new Object3D();
  }

  getVertices(around: Point3D) {
    let root = new THREE.Group();
    const patchPoints: Array<WCell> = this.ww.get3DWorld(around).diagram.cells;
    patchPoints.map( (pp: WCell) => {
      root.add(SB.sphere(pp.center));
    });
    return root;
  }
  getTestSphere(around: Point3D, radius: number): Object3D {
    return SB.sphere(new Vector3(around.x, around.y, around.z), {radius: radius});
  }
  getCellBorders(around: Point3D) {
    let root = new THREE.Group();
    root.name = 'borders';
    const diagram: WDiagram= this.ww.get3DWorld(around).diagram;
    diagram.cells.map( (cell: WCell) => {
      cell.borders.map( (hedge: WBorder) => {
        // root.add(SB.sphere(hedge.start));
        // root.add(SB.sphere(hedge.end))
        root.add(SB.line(hedge.start, hedge.end ))
      });
      
    });
    return root;
  }
}