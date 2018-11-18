import BaseEntity from "./BaseEntity";
import { Object3D, PlaneBufferGeometry, Mesh, BufferGeometry, MeshNormalMaterial } from "three";

export default class Ocean extends BaseEntity {
  getMaterial(): MeshNormalMaterial {
    return new MeshNormalMaterial({wireframe: true});
  }
  generateGeometry(): BufferGeometry {
    return new PlaneBufferGeometry()
  }
  width: number;
  height: number;
  geometry: any;
  constructor(w: number, h: number) {
    super(0,0,0);
    this.width = w;
    this.height = h;
  }
  generateMesh = (): Object3D => {
    if (!this.geometry){
      this.geometry = this.generateGeometry();
    }
    return new Mesh(this.geometry, this.getMaterial() );
  };
  update: (delta: number) => {
    
  };


}