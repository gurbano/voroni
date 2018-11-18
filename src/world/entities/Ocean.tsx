import BaseEntity from "./BaseEntity";
import { Object3D, PlaneBufferGeometry, Mesh, BufferGeometry, MeshBasicMaterial, Color } from "three";

export default class Ocean extends BaseEntity {
  getMaterial(): MeshBasicMaterial {
    return  new MeshBasicMaterial( { //0
      color: new Color().setRGB(1,0,0),
      depthTest: false,
      depthWrite: false,
      transparent: true
    } );
  }
  generateGeometry(): BufferGeometry {
    console.log('@@@@@',this.width, this.height);
    return new PlaneBufferGeometry(this.width, this.height, 20, 20)
  }
  width: number;
  height: number;
  geometry: any;
  constructor(w: number, h: number) {
    super(0,0,0);
    this.width = w;
    this.height = h;
    this.move(w/2, 200 , h/2);
    this.getObject()
  }
  generateMesh = (): Object3D => {
    if (!this.geometry){
      this.geometry = this.generateGeometry();
    }
    let mesh = new Mesh(this.geometry, this.getMaterial() );
    mesh.rotation.x = - (Math.PI /2);
    return mesh;
  };
  update: (delta: number) => {
    
  };


}