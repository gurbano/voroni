import BaseEntity from "../BaseEntity";
import { Object3D, Mesh,  Geometry, BufferGeometry, CubeGeometry, MeshLambertMaterial, Color } from "three";



export default class Point extends BaseEntity{
  constructor(x: number, y: number, z: number){
    super(0,0,0);
    this.move(x,y+1,z);
  }
  generateMesh = (): Object3D => {
    return new Mesh( this.generateGeometry(), this.generateMaterial());
  }
  update = (delta: number) => {
    
  }
  generateMaterial = () => {
    return new MeshLambertMaterial({//2
      color: new Color().setRGB(1, 0, 0),
      flatShading: false,
    })
  }
  generateGeometry = (): Geometry | BufferGeometry => {  
    return new CubeGeometry(100, 100, 100);
  }
}