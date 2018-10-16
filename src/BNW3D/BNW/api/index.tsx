import RNG from '../utils/random'
import World, { Point3D } from './world';
import { VDiagram } from './VoronoiWorld';
import { DWorld } from './DWorld';
// const Noise = require('noisejs')
// const noise = new Noise.Noise(0);


export default class WorldManager {
  
  rng: RNG;
  world: World;
  constructor(){
    this.rng = new RNG(42);
    this.world = new World(this.rng);
  }
  public resetWorld = () => {
    this.world = new World(this.rng);
    this.world.generatePatch(0,0);
  }
  public get2DWorld = (around: Point3D) : VDiagram => {
    let {x, y} = around;
    x = Math.floor(x / 1024) * Math.sign(x);
    y = Math.floor(y / 1024) * Math.sign(y);
    if (!this.world.hasPatch(x, y)){
      this.world.generatePatch(x, y);
    }
    return this.world.getPatch(x, y).voronoiWorld.diagram;
  }
  public get3DWorld = (around: Point3D) : DWorld => {
    let {x, z} = around;
    x = Math.floor(x / this.world.getSize()) * Math.sign(x);
    z = Math.floor(z / this.world.getSize()) * Math.sign(z);
    if (!this.world.hasPatch(x, z)){
      this.world.generatePatch(x, z);
    }
    return this.world.getPatch(x, z).dWorld;
  }
  getCellAt = (around: Point3D): {wd: DWorld, vd: VDiagram} => {
    let wd = this.get3DWorld(around);
    return {wd, vd: this.get2DWorld(around) };
  }
}



