import { Object3D, Scene } from "three";

const generateUUID = () => { // Public Domain/MIT
  var d = new Date().getTime();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
      d += performance.now(); //use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}


export default abstract class BaseEntity {
  id: string;
  x: number;
  y: number;
  z: number;
  private object3D: Object3D;
  abstract generateMesh = (): Object3D => {return new Object3D()};
  abstract update = (delta: number) => {};
  constructor(x: number, y: number, z: number){
    this.id = generateUUID();
    this.x = x; this.y = y; this.z = z; 
  }
  init = () => {
    
  }
  move = (x: number, y: number, z: number) => {
    this.x = x; this.y = y; this.z = z; 
    this.getObject().position.set(x,y,z);
  } 
  getObject = (): Object3D => {
    if (!this.object3D){
      this.object3D = this.generateMesh();
      this.object3D.name = this.id;
      this.object3D.position.set(this.x, this.y, this.z);
    }
    return this.object3D;
  }
  register(scene: Scene): BaseEntity {
    scene.add(this.getObject());
    return this;
  }
  deregister(scene: Scene): void{
    scene.remove(this.object3D);
  }
  
}