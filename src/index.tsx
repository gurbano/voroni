import Engine from './engine/';
import VoronoiWorld from './world/voronoiWorld';
import './index.css';
import loop from './utils/loop';
import Terrain from './world/entities/Terrain';
import { bindControls } from 'src/BNW3D/renderer/controls';
import RNG from './utils/random';
import TerrainContainer from './world/entities/TerrainContainer';
import MapLoader from './world/maps/MapLoader';
import Picker from './engine/picker';
import { Vector3, Intersection } from 'three';


const rng = new RNG('monk');

const engine = new Engine(document.getElementById('root'));
engine.init();

const voronoiWorld = new VoronoiWorld();
voronoiWorld.init();
// console.log(voronoiWorld.diagram);

let terrain = new Terrain(voronoiWorld);
terrain.register(engine.scene);
let terrainContainer = new TerrainContainer(terrain, engine.scene);
terrainContainer.update();
terrainContainer.showBorders(false);
terrainContainer.showPois(true);

let mappLoader = new MapLoader();

// CONTROLS
let controls = bindControls(engine.getCamera());
controls.target.set( terrain.size/2, 0, terrain.size/2);
controls.update();



// PICKER
new Picker(engine, (point: Vector3, intersect: Intersection[]) => {
  // intersect.map( (isect) => console.log(isect.object.name, {...point}, ) );
});


let test = () => {
  mappLoader.load('ibiza', terrain , rng, (data) => {
    terrainContainer.setCellData(data); //updates terrain.geom.vertices
  });
};
setTimeout(test, 10);

loop( (delta: number) => {
  // console.log(delta);
  engine.step(delta);
  terrain.update(delta);
  controls.update();
})