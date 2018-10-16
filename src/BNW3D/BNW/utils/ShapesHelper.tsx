
import * as THREE from "three";

import { Point3D,  Point2D } from "../api/world";
import { VDiagram, VCell, VHEdge } from "../api/VoronoiWorld";
import { Object3D } from "three";
const Noise = require('noisejs')
const noise = new Noise.Noise(0);



const FACTOR = 150;
const fh = (x: number, y: number) => {return noise.perlin2(x,y) * FACTOR};
export default  class ShapesHelper {
  sphere = (pos: Point2D, opts: any = {}): Object3D => {
    const geometry = new THREE.SphereBufferGeometry( opts.radius | 3, 5, 5 );
    const material = new THREE.MeshLambertMaterial( { color: 0xcc00cc, overdraw: 0.5 } );
    var sphere = new THREE.Mesh( geometry, material );
    sphere.position.x = pos.x;
    sphere.position.y = fh(pos.x, pos.y);
    sphere.position.z = pos.y;
    return sphere;
  }
  cube = (pos: Point2D): Object3D => {
    const geometry = new THREE.BoxBufferGeometry( 15, 15, 15 );
    const material = new THREE.MeshLambertMaterial( { color: 0xffffff, overdraw: 0.5 } );
    var cube = new THREE.Mesh( geometry, material );
    cube.position.x = pos.x;
    cube.position.y = fh(pos.x, pos.y);
    cube.position.z = pos.y;
    return cube;
  }
  line = (start: Point2D, end: Point2D) => {
    var lineGeometry = new THREE.Geometry();
    var vertArray = lineGeometry.vertices;
    vertArray.push( 
        new THREE.Vector3(start.x, fh(start.x, start.y), start.y), 
        new THREE.Vector3(end.x, fh(end.x, end.y), end.y) 
    );
    var lineMaterial = new THREE.LineBasicMaterial( { color: 0xcc0000 } );
    var line = new THREE.Line( lineGeometry, lineMaterial );
    return line;
  }
  terrain = (diagram: VDiagram): Object3D => {
    let vertId = (x:number, y: number) => {return `${x}-${y}`};
    let vertexMaps = {};
    let vertexIndexes = {};
    let geom = new THREE.Geometry(); 
    let siteVertexIndex = -1;
    let vertexIndex = -1;
    // let center = {x: (diagram.bbox.xl + diagram.bbox.xr )/2, y: (diagram.bbox.yb + diagram.bbox.yt )/2}
    diagram.cells.map( (cell: VCell)=> {
      // let dist = Math.sqrt(Math.pow(cell.site.x - center.x, 2) + Math.pow(cell.site.y - center.y, 2));
      let ffh = (x: number, y: number) => {return fh(x,y)  /* - (200 * (dist - 1024)/1024) */; };
      // console.log('draw cell ', dist, cell);
      let v0: Point3D =  {x: cell.site.x, y: ffh(cell.site.x, cell.site.y), z: cell.site.y };
      const v1 = new THREE.Vector3(v0.x,v0.y,v0.z);   
      geom.vertices.push(v1);
      vertexIndex++;
      siteVertexIndex = vertexIndex;
      cell.halfedges.map( ( (edge: VHEdge) => {
        let va: Point3D;
        let vai: number;
        if (vertexMaps[vertId(edge.edge.va.x, edge.edge.va.y)]){
          va = vertexMaps[vertId(edge.edge.va.x, edge.edge.va.y)];
          vai = vertexIndexes[vertId(edge.edge.va.x, edge.edge.va.y)];
        }else{
          va = {x: edge.edge.va.x, y: ffh(edge.edge.va.x, edge.edge.va.y)  , z: edge.edge.va.y };
          vertexIndex++;
          vai = vertexIndex;
          vertexMaps[vertId(edge.edge.va.x, edge.edge.va.y)] = va;
          vertexIndexes[vertId(edge.edge.va.x, edge.edge.va.y)] = vertexIndex;
          const v2 = new THREE.Vector3(va.x,va.y,va.z);
          geom.vertices.push(v2);
        }
        let vb: Point3D;
        let vbi: number;
        if (vertexMaps[vertId(edge.edge.vb.x, edge.edge.vb.y)]){
          vb = vertexMaps[vertId(edge.edge.vb.x, edge.edge.vb.y)];
          vbi = vertexIndexes[vertId(edge.edge.vb.x, edge.edge.vb.y)];
        }else{
          vb = {x: edge.edge.vb.x, y: ffh(edge.edge.vb.x, edge.edge.vb.y)  , z: edge.edge.vb.y };
          vertexIndex++;
          vbi = vertexIndex;
          vertexMaps[vertId(edge.edge.vb.x, edge.edge.vb.y)] = vb;
          vertexIndexes[vertId(edge.edge.vb.x, edge.edge.vb.y)] = vertexIndex;
          const v3 = new THREE.Vector3(vb.x,vb.y,vb.z);      
          geom.vertices.push(v3);
        }

        //console.log(siteVertexIndex, vertexIndex + 1, vertexIndex + 2);
        geom.faces.push( new THREE.Face3( siteVertexIndex, vai, vbi ) );
      } ));
    });
    geom.computeFaceNormals();

    let material = new THREE.MeshNormalMaterial({
      // color: 0xff66ff,
      // shading: THREE.SmoothShading,
      // ambient: 0x555555,
      // specular: 0xffffff,
      side: THREE.DoubleSide
    });
    return new THREE.Mesh( geom, material );
  }
};