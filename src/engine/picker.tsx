
import { Object3D, Vector2, Raycaster, Camera, Scene, Vector3, Intersection } from "three";
import Engine from "./";
import Border from "../world/entities/Border";
import TerrainContainer from "../world/entities/TerrainContainer";
import Terrain from "../world/entities/Terrain";


class Picker {
  camera: Camera;
  mouse: Vector2;
  raycaster: Raycaster;
  onClickPosition: Vector2;
  dom: HTMLElement | null;
  scene: Scene;
  cb: (point: Vector3, intersect: Intersection[]) => any;
  constructor(renderer: Engine, cb: (point: Vector3, intersect: Intersection[]) => any | void){
    this.dom = renderer.rootDOM;
    this.scene = renderer.scene;
    this.onClickPosition = new Vector2();
    this.mouse = new Vector2();
    this.raycaster = new Raycaster();
    this.camera = renderer.camera;
    this.cb = cb;
    if (this.dom){
      this.dom.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );
    }
  }
  onMouseMove = ( evt: MouseEvent ) => {
    evt.preventDefault();
    if (!this.dom) return;
    var array = this.getMousePosition( this.dom , evt.clientX, evt.clientY );
    this.onClickPosition.fromArray( array );
    var intersects = this.getIntersects( this.onClickPosition, this.scene.children );
    
    if ( intersects.length > 0  ) {
      //console.log(intersects);
      this.cb(intersects[0].point, intersects );
    }
  }
  getMousePosition = ( dom: HTMLElement, x: number, y: number ) => {
    var rect = dom.getBoundingClientRect();
    // console.log([ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ]);
    return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];
  };
  getIntersects = ( point: Vector2, objects: Array<Object3D> ): Intersection[] => {
    this.mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );
    //console.log(this.mouse);
    this.raycaster.setFromCamera( this.mouse, this.camera );
    //console.log(objects);
    return this.raycaster.intersectObjects( objects, true );
  }
}

export default Picker;



export const FaceBorderPicker = (terrainContainer: TerrainContainer, terrain: Terrain) => (point: Vector3, intersect: Intersection[]) => {
   intersect.map( (isect) => {
    if(isect.faceIndex){
      const tface = terrain.faces[isect.faceIndex];
      if (tface){
        let border: Border = terrainContainer.faceBorder[tface.index];
        border.getObject().visible = true;
      }
    }
  });
};

export const CellBorderPicker = (terrainContainer: TerrainContainer, terrain: Terrain) => (point: Vector3, intersect: Intersection[]) => {
  intersect.map( (isect) => {
     if(isect.faceIndex){
      const tface = terrain.faces[isect.faceIndex];
      if (tface){
        terrainContainer.cellBorders[tface.cell.id].map( (border: Border) => {          
          border.getObject().visible = true;
        });
      }
    }
  });
};