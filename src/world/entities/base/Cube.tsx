import BaseEntity from "../BaseEntity";
import { Object3D, Mesh, MeshNormalMaterial, DoubleSide, Geometry, BufferGeometry, CubeGeometry } from "three";



export default class Cube extends BaseEntity{
  w: number;
  h: number;
  constructor(x: number, y: number, z: number, w: number, h: number){
    super(0,0,0);
    this.w = w;
    this.h = h;
    this.move(x,y,z);   
  }
  generateMesh = (): Object3D => {
    return new Mesh( this.generateGeometry(), this.generateMaterial());
  }
  update = (delta: number) => {
    
  }
  generateMaterial = () => {
    return new MeshNormalMaterial({
      // color: 0xff66ff,
      // shading: THREE.SmoothShading,
      // ambient: 0x555555,
      // specular: 0xffffff,
      side: DoubleSide
    });
  }
  generateGeometry = (): Geometry | BufferGeometry => {  
    return new CubeGeometry(this.w, this.h);
  }
}