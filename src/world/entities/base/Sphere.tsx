import BaseEntity from "../BaseEntity";
import { Object3D, Mesh, MeshNormalMaterial, DoubleSide, Geometry, BufferGeometry, SphereBufferGeometry } from "three";



export default class Sphere extends BaseEntity{
  radius: number;
  constructor(x: number, y: number, z: number, radius: number){
    super(0,0,0);
    this.radius = radius;
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
    console.log(this.radius)
    return new SphereBufferGeometry(this.radius);
  }
}