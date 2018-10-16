import RNG from "../utils/random";
import { VoronoiWorld } from './VoronoiWorld';
import { DWorld, WDiagram, WCell, WBorder } from "./DWorld";

// const Noise = require('noisejs')
// const noise = new Noise.Noise(0);

export interface Point2D{
  x: number;
  y: number;
}
export interface Point3D{
  x: number;
  y: number;
  z: number;
}

const patchId = (x: number, y: number): string => {return `${x}-${y}`};
const PATCH_SIZE = 1000 * 10;
const DENSITY = 20;
export default class World{
  rng: RNG;
  patches: Array<WorldPatch>;
  map: Map<String, WorldPatch>;
  constructor(rng: RNG){
    this.rng = rng;
    this.map = new Map();
  }
  getSize(){
    return PATCH_SIZE;
  }
  getPatch(x: number, y: number): WorldPatch {
    return this.map[patchId(x, y)];
  }
  hasPatch(x: number, y: number): boolean {
   return this.map[patchId(x, y)] != undefined;
  }
  generatePatch(x: number, y: number): void {
    const patch = new WorldPatch({width: PATCH_SIZE, height: PATCH_SIZE, rng: this.rng, offX: x, offY: y, density: DENSITY});
    this.map[patchId(x, y)] = patch;
  }

}

//-------VORONOI ---/
export interface PatchConfig{
  width: number;
  height: number;
  rng: RNG;
  offX: number;
  offY: number;
  density: number;
}


export class WorldPatch{
  width: number;
  heigth: number;
  rng: RNG;
  voronoiWorld: VoronoiWorld;
  dWorld: DWorld;
  constructor(opts: PatchConfig){
    this.voronoiWorld = new VoronoiWorld({...opts});
    this.voronoiWorld.generatePatch();
    this.voronoiWorld.relaxSites();
    this.voronoiWorld.relaxSites();
    this.voronoiWorld.relaxSites();
    this.voronoiWorld.relaxSites();

    this.voronoiWorld.relaxSites();
    this.voronoiWorld.relaxSites();
    this.voronoiWorld.relaxSites();
    this.voronoiWorld.relaxSites();
    this.voronoiWorld.relaxSites();
    this.voronoiWorld.relaxSites();
    this.voronoiWorld.relaxSites();
    this.voronoiWorld.relaxSites();
    this.voronoiWorld.relaxSites();
    this.voronoiWorld.relaxSites();
    this.voronoiWorld.relaxSites();
    this.voronoiWorld.relaxSites();

    // SET CELLS HEIGHT


    this.dWorld = new DWorld({...opts});

    this.dWorld.generate3DWorld(this.voronoiWorld, [
      


      (diagram: WDiagram) => {
        diagram.cells.map( (cell: WCell) => {
          cell.center.y = cell.props.height;
          cell.borders.forEach( (border: WBorder) => {
            border.start.y +=  cell.props.height;
            border.end.y += cell.props.height;
          })
        })
      }
    ]);
    
  }

  
  

}
