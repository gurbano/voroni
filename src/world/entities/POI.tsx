

import Point from "./base/Point";


type P3D = {x: number, y: number, z: number};
export default class POI extends Point{
  vertex: number;
  constructor(x: number, y: number, z: number, vertex_index: number){
    super(x,y,z);
    this.vertex = vertex_index;
  }
  setPos(pos: P3D){
    this.move(pos.x, pos.y, pos.z);
  }
}