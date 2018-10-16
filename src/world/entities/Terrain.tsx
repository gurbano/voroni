import BaseEntity from "./BaseEntity";
import { Object3D, Vector3, Geometry, Mesh, FaceColors, Face3, MeshNormalMaterial, MeshPhongMaterial, MeshLambertMaterial } from "three";
import VoronoiWorld, { XVertex, XCell, VFace, XEdge } from "../voronoiWorld";

type TCell = {
  id: number;
  faces: Array<number>;
  data: any;
  cell: XCell;
  center: number;
}
type TCorner = {
  index: number; //index in geometry.vertices
  cells: Array<number>; //all cells this vertex belongs to
}
export type TBorder = {
  start: number;
  end: number;
  edge: XEdge;
}
export default class Terrain extends BaseEntity{
  source: VoronoiWorld;
  cells: Array<TCell>;
  corners: Array<TCorner>;
  borders: Array<TBorder>;
  geom: Geometry;
  size: number;
  private _mesh: Mesh;
  // helpers 
  // vertexToCell ()

  constructor(world: VoronoiWorld){
    super(0,0,0);
    this.source = world;   
    this.size = world.size;
    this.init();
  }
  generateMesh = (): Object3D => {
    this.geom = this.generateGeometry(this.source);
    this._mesh = new Mesh(this.geom, this.generateMaterial());
    return this._mesh;
  }
  update = (delta: number) => {
    
  }
  setCellData = ( data: Map<number, any> ) => {
    Object.keys(data).map( (k) => {
      if (this.cells[k]){
        let tcell: TCell = this.cells[k];
        tcell.data = Object.assign({}, tcell.data, data[k]);
      }
    });
    let geom = this.updateVertexHeights(this.geom);
    this.updateFaces();
    this.setGeometry(geom);
  }
  generateMaterial = () => {
    return [
      new MeshNormalMaterial({
        vertexColors: FaceColors
      }),
      new MeshPhongMaterial({
        vertexColors: FaceColors
      }),
      new MeshLambertMaterial(
        {color : 0xff0000, overdraw : 1}
       )
    ];
    
  }
  private setGeometry = (geom: Geometry) => {
    this.geom = geom;
    this._mesh.geometry = geom;
  }
  private generateGeometry = (world: VoronoiWorld): Geometry => {  
    let geom = new Geometry(); 
    this.corners = [];
    this.cells = [];
    this.borders = [];
    world.vertices.map( (v: XVertex) => {
      this.corners.push({ index: geom.vertices.length, cells: []  });
      geom.vertices.push(new Vector3(v.x, v.y ,v.z) );      
    }); 
    world.cells.map( (cell: XCell) => {
      let tcell: TCell = {
        center: cell.center.index,
        id: cell.site.voronoiId,
        cell: cell,
        faces: [],
        data: {
          height: geom.vertices[cell.center.index].y,
        },
      };
      cell.faces.map( (face: VFace) => {
        let tface = new Face3( face.va, face.vb, face.vc );
        tface.materialIndex = tcell.data.height > 0 ? 0 : 0;
        tface.color.setRGB( 0,0,1);
        tcell.faces.push(geom.faces.length); // save face index
        this.corners[face.vb].cells.push(cell.site.voronoiId);
        // this.corners[face.vc].cells.push(cell.site.voronoiId);
        this.borders.push({
          start: face.vb,
          end: face.vc,
          edge: face.edge
        })
        geom.faces.push( tface );     
      });
      this.cells.push(tcell);
    });
    geom.computeFaceNormals();   
    return geom;
  }

  isCenter = (index: number): boolean => this.corners[index] && this.corners[index].cells && this.corners[index].cells.length > 0;
  getVertexHeight = (index: number): number => {
    let corner = this.corners[index];
    if (corner && corner.cells && corner.cells.length){
      let sumHeight = 0;
      corner.cells.map ( c_i => {sumHeight += this.cells[c_i].data.height});
      let avgHeight = sumHeight / corner.cells.length;
      return avgHeight;
    }else{
      let cell = this.cells.filter( c => c.center===corner.index)[0];
      if (cell){
        return cell.data.height;
      }else{
        //console.log('attenzione', corner);
        return 0;
      }    
    }
  }
  updateVertexHeights = (_geom: THREE.Geometry): THREE.Geometry => {
    let geom = _geom.clone();
    this.corners.map( (corner: TCorner) => {
      geom.vertices[corner.index].y = this.getVertexHeight(corner.index);
    });
    geom.computeFaceNormals();
    return geom;
  }

  updateFaces = () => {
    console.log('update face');
    this.cells.map( (cell: TCell) => {
      cell.faces.map ( a => this.geom.faces[a].materialIndex = 0);
    } );
    this.geom.computeFaceNormals();   
  }

}