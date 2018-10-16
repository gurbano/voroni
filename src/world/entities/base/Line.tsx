import BaseEntity from "../BaseEntity";
import { Object3D, Geometry, LineBasicMaterial, Vector3 } from "three";
import * as THREE from "three";
import { TBorder } from "../Terrain";

type P3D = {x: number, y: number, z: number};

export default class Line extends BaseEntity{
  start: P3D;
  end: P3D;
  edge: TBorder;
  geom: Geometry;
  line: THREE.Line;
  
  constructor(start: P3D, end: P3D, edge: TBorder){
    super(0,0,0);
    this.start = start;
    this.end = end;
    this.edge = edge;
  }
  generateMesh = (): Object3D => {
    this.geom = this.generateGeometry(this.start, this.end);
    this.line = new THREE.Line( this.geom, this.generateMaterial() );
    return this.line;
  }
  setGeometry = (geom: THREE.Geometry) => {
    this.geom = geom;
    this.line.geometry = geom;
  }
  update = (delta: number) => {
    
  }
  generateMaterial = () => {
    return new LineBasicMaterial( { color: 0xcc0000 } );
  }
  generateGeometry = (s: P3D, e: P3D): Geometry => {  
    var lineGeometry = new THREE.Geometry();
    var vertArray = lineGeometry.vertices;
    vertArray.push( 
        new Vector3(s.x,s.y, s.z), 
        new Vector3(e.x, e.y, e.z) 
    );
    return lineGeometry;
  }
}