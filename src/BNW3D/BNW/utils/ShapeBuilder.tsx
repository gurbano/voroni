
import * as THREE from "three";
import { Object3D } from "three";

export default  class ShapesBuilder {
  sphere = (pos: THREE.Vector3, opts: any = {}): Object3D => {
    const geometry = new THREE.SphereBufferGeometry( opts.radius | 3, 5, 5 );
    const material = new THREE.MeshLambertMaterial( { color: 0xcc00cc, overdraw: 0.5 } );
    var sphere = new THREE.Mesh( geometry, material );
    sphere.position.x = pos.x;
    sphere.position.y = pos.y;
    sphere.position.z = pos.z;
    return sphere;
  };
  line = (start: THREE.Vector3, end: THREE.Vector3) => {
    var lineGeometry = new THREE.Geometry();
    var vertArray = lineGeometry.vertices;
    vertArray.push( 
        new THREE.Vector3(start.x, start.y, start.z), 
        new THREE.Vector3(end.x, end.y, end.z) 
    );
    var lineMaterial = new THREE.LineBasicMaterial( { color: 0xcc0000 } );
    var line = new THREE.Line( lineGeometry, lineMaterial );
    return line;
  }
};