import RNG from "../utils/random";
import {  VCell, VHEdge, VoronoiWorld, VSite } from "./VoronoiWorld";
import THREE from "../../three-bundle";
import { Geometry } from "three";





interface PatchConfig{
  width: number;
  height: number;
  rng: RNG;
  offX: number;
  offY: number;
  density: number
}
export interface WCellProps{
  biome: number;
  height: number;
  area: number;
  inited: boolean;
}
export interface WFace {
  va: THREE.Vector3;
  vb: THREE.Vector3;
  vc: THREE.Vector3;
}
export interface WBorder {
  id: string;
  _edge: VHEdge;
  start: THREE.Vector3;
  end: THREE.Vector3;
  rightCell?: WCell;
  leftCell?: WCell;
}
export interface WCell {
  id: string;
  _cell: VCell;
  center: THREE.Vector3;
  borders: Array<WBorder>;
  faces: Array<any>;
  props: WCellProps;
  
}
export interface Facedata {
  cell: WCell,
  face: WFace,
  geom: Geometry,
}
export interface WDiagram {
  cells: Array<WCell>;
  vertList: Array<THREE.Vector3>;
}
const vid = (v: THREE.Vector3): string => {return `${v.x}-${v.z}`;}
const bid = (b?: VSite): string => {
  return b ? `${b.voronoiId}` : 'void';
}
export class DWorld {
  
  
  sites: number;
  offX: number;
  offY: number;
  width: number;
  height: number;
  rng: RNG;

  facedata: Array<Facedata>;
  diagram: WDiagram;
  mesh: THREE.Mesh;
  
  vertList: Array<THREE.Vector3>;
  private vertMap: any;
  private addVertex = (x: number, y: number,z: number): THREE.Vector3  => {
    let vert = new THREE.Vector3(x,y,z);  
    if (this.vertMap[vid(vert)]){
      return this.vertList[this.vertMap[vid(vert)]];
    } else{
      this.vertMap[vid(vert)] = this.vertList.length;
      this.vertList.push (vert);
      return vert;
    }
    
  }
   vIndex = (v: THREE.Vector3): number => {
    if (this.vertMap[vid(v)] == undefined)
      throw new Error('AHHHHHH');
    return this.vertMap[vid(v)];
  }

  constructor(opts: PatchConfig){
    this.resetVerts();
    this.rng = opts.rng;
    this.width = opts.width;
    this.height = opts.height;
    this.sites = Math.floor(opts.density * (this.width/1000 * this.height/1000));
    this.offX = opts.offX;
    this.offY = opts.offY;
    
  }
  private resetVerts = () => {
    this.vertList = [];
    this.vertMap = {};
    this.facedata = [];
  }
  getFaceData = (index: number): Facedata | null  => {
    if (index === undefined) {return null;}
    return this.facedata[index];
  }
  generate3DWorld ( vWorld: VoronoiWorld, modders: Array< (diagram: WDiagram) => any >): void {
    this.generateVertices(vWorld);
    modders.forEach( (mod) => {
      mod(this.diagram);
    })
    this.generate3DTerrain();
  }
  refresh3DWorld(): any {
    this.generate3DTerrain();
  }
  private generateVertices(vWorld: VoronoiWorld): void {
    this.resetVerts();
    let lastHeight = 0;
    let cells: Array<WCell> = vWorld.diagram.cells.map( (cell: VCell, index: number) => {
      let borders: Array<WBorder> = [];
      let faces: Array<WFace> = [];
      // for each cell
      let v0 = this.addVertex(cell.site.x, 0, cell.site.y );  
      // generate borders
      borders = cell.halfedges.map((hedge: VHEdge)=> { 
        let start = this.addVertex(hedge.edge.va.x, 0, hedge.edge.va.y);
        let end = this.addVertex(hedge.edge.vb.x, 0, hedge.edge.vb.y);
        const wedge: WBorder = {
          id: `border-${bid(hedge.edge.rSite)}-${bid(hedge.edge.lSite)}`,
          _edge: hedge,
          start: start,
          end: end,
        };
        return wedge;
      })
      // generate faces
      borders.map( (border: WBorder) => {
        faces.push({va: v0, vb: border.start, vc: border.end});
      })
      let wcell =  {
        id: `${cell.site.voronoiId}`,
        _cell: cell,
        center: v0,
        borders: borders,
        faces: faces,
        props: {
          biome: 0,
          height: lastHeight,
          area: vWorld.cellArea(cell),
          inited: false,
        }
      }
      return wcell;
    });
    console.log(`generate ${cells.length} cells`, cells);
    console.log(`generate ${this.vertList.length} vertex`);

    this.diagram = {
      cells: cells,
      vertList: this.vertList,
    };
  }

  private _generateCellHeights = () => {
  };
  public get generateCellHeights() {
    return this._generateCellHeights;
  }
  public set generateCellHeights(value) {
    this._generateCellHeights = value;
  }

  generate3DTerrain = (): void => {  
    const now = new Date().getTime();
    let geom = new THREE.Geometry(); 
    this.facedata = [];
    this.diagram.vertList.map( (v: THREE.Vector3) => { geom.vertices.push(v);})
    this.diagram.cells.map( (cell: WCell)=> {
      cell.faces.map( (face: WFace) => {
        let i = {
          0: this.vIndex(face.va),
          1: this.vIndex(face.vb),
          2: this.vIndex(face.vc)
        }
        let tface = new THREE.Face3( i[0] , i[1], i[2] );
        geom.faces.push( tface );
        this.facedata.push({cell, face, geom});
      })
    });

    geom.computeFaceNormals();
    
    
    if (this.mesh){
      this.mesh.geometry = geom;//new BufferGeometry().fromGeometry( geom);
    }else{
      let material = new THREE.MeshNormalMaterial({
        // color: 0xff66ff,
        // shading: THREE.SmoothShading,
        // ambient: 0x555555,
        // specular: 0xffffff,
        side: THREE.DoubleSide
      });
      this.mesh = new THREE.Mesh( geom, material );
    } 
    this.mesh.name = " --- TERRAIN --- ";
    console.log(`Mesh generated in ${new Date().getTime() - now}ms`);
  }
}

