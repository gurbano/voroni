import * as React from "react";
import "./MagicCarousel.css";
import BNWEngine, { }
  from './BNW';


import MagicRenderer, { IMagicRenderer } from './renderer/Renderer';
import THREE from "./three-bundle";
import { Point3D } from "./BNW/api/world";
import { Object3D, Vector3, Intersection } from "three";
import bindControls from "./renderer/controls";
import Picker from "./renderer/picker";
import { Facedata } from "./BNW/api/DWorld";
// import { WBorder } from "./BNW/api/DWorld";


export interface IProps {
  name?: string;
}

interface IState {
  name: string;
  world: {
    world: Array<THREE.Object3D>; // entities around local coords
    entities: Array<THREE.Object3D>; // entities around local coords
    buildings: Array<THREE.Object3D>; // 
  };
}

interface Player {
  pos: Point3D;
  username: string;
}

class PlayerManager {
  getPlayer(username: string): Player {
    const pos: Point3D = {
      x: 2500,
      y: 2000,
      z: 2500
    };
    return { pos, username }
  }
}



function timestamp() {
  return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
};
class BNWApp extends React.Component<IProps, IState> {
  BNW: BNWEngine;
  pg: Player;
  renderer: IMagicRenderer;

  constructor(props: IProps) {
    super(props);
    this.pg = new PlayerManager().getPlayer('oath');
    this.BNW = new BNWEngine();
    this.onceTheRendererIsReady = this.onceTheRendererIsReady.bind(this);
    this.state = {
      name: props.name || 'bnw',
      world: {
        world: [], //terrain, skybox, lights
        entities: [], //ais
        buildings: [], // static 
      }
    };
  }
  public componentDidMount() {
    console.log('Component Did Mount');

  }
 
  
 
  private startLoop = (cb: (delta: number) => void) => {
    let now = timestamp();
    const tick = () => {
      cb(timestamp() - now);
      now = timestamp();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }


  private onceTheRendererIsReady = (renderer: MagicRenderer) => {
    this.renderer = renderer;
    console.log('Renderer READY', renderer);
    let terrain = this.BNW.getTerrain(this.pg.pos);
    this.state.world.world.push(terrain);
    this.state.world.buildings = [
      this.BNW.getCellBorders(this.pg.pos),
      this.BNW.getVertices(this.pg.pos),
    ];

    //let sph = this.BNW.getTestSphere(this.pg.pos, 100);
    this.state.world.entities = [
      //sph,
    ];

    let f = (entity: Object3D) => { renderer.getScene().add(entity); };
    this.state.world.world.forEach(f);
    this.state.world.entities.forEach(f);
    this.state.world.buildings.forEach(f);

    renderer.getCamera().position.set(this.pg.pos.x, 1000, this.pg.pos.z);

    let controls = bindControls(renderer.getCamera());
    controls.target.set(this.pg.pos.x + 500, 0, this.pg.pos.z + 500);

    const flatter = (facedata: Facedata) => { 
      //facedata.cell.center.y = 10;
      facedata.cell.borders.map( (border) => { 
        facedata.cell.center.y = Math.max(border.start.y , border.end.y);
        border.start.y =  border.end.y = Math.max(border.start.y , border.end.y);  
        if (border.leftCell) border.leftCell.center.y = (facedata.cell.center.y + border.leftCell.center.y)/2;
        if (border.rightCell) border.rightCell.center.y = (facedata.cell.center.y + border.rightCell.center.y)/2;
      });
    }
    
    const upper = (facedata: Facedata) => { 
      facedata.cell.borders.map( (border) => { border.start.y = border.end.y =  Math.max(border.start.y,border.end.y)/2 +  .3; });
      facedata.cell.center.y += .6;
    }
    console.log(flatter, upper);
    new Picker(renderer, (point: Vector3, intersect: Intersection[]) => {

      // console.log(intersect[0].object.name, {...point}, );
      // console.log(`World coords [${point.x}, ${point.y}, ${point.z}] ${intersect[0].object.name}`, intersect);
      let facedata = this.BNW.ww.getCellAt(point).wd.getFaceData(intersect[0].faceIndex!);
      if (facedata){
        // console.log(facedata!.cell.id, facedata.cell.borders[0].start);
        upper(facedata);
        //flatter(facedata);
        
        this.BNW.updateVertices(point);
      }
      
      // sph.position.set(point.x, 30, point.z);
    });

    this.startLoop((delta: number) => {
      // console.log(delta);
      controls.update();
      renderer.step();
      terrain.geometry.computeVertexNormals(); //rotateOnAxis(new Vector3(0,1,0),0.001);
    });




  }
  public render() {
    return (
      <MagicRenderer onReady={this.onceTheRendererIsReady} />
    );
  }
}

export default BNWApp;