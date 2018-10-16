import Line from "./base/Line";


type P3D = {x: number, y: number, z: number};
export default class Border extends Line{
  setPoints(start: P3D, end: P3D){
    this.start = start;
    this.end = end;
    this.setGeometry(this.generateGeometry(this.start, this.end));
  }
}