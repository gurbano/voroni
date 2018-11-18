import Engine from './engine/';
import VoronoiWorld from './world/voronoiWorld';
import './index.css';
import loop from './utils/loop';
import Terrain from './world/entities/Terrain';
import Ocean from './world/entities/Ocean';
import { bindControls } from 'src/BNW3D/renderer/controls';
import RNG from './utils/random';
import TerrainContainer from './world/entities/TerrainContainer';
import MapLoader from './world/maps/MapLoader';
import Picker from './engine/picker';
import { Vector3, Intersection, DirectionalLight, PointLight } from 'three';



const rng = new RNG('monk');

const engine = new Engine(document.getElementById('root'));
engine.init();

const voronoiWorld = new VoronoiWorld();
voronoiWorld.init();
// console.log(voronoiWorld.diagram);

let sea = new Ocean(voronoiWorld.size, voronoiWorld.size);
sea.register(engine.scene);

let terrain = new Terrain(voronoiWorld);
let terrainContainer = new TerrainContainer(terrain, engine.scene);
// CONTROLS
let controls = bindControls(engine.getCamera());
controls.target.set( terrain.size/2, 0, terrain.size/2);
controls.update();


terrain.registerWithTexture(engine.scene, 
    (terrain) => {
      terrainContainer.update();
      terrainContainer.showBorders(false);
      terrainContainer.showPois(false);

      let mappLoader = new MapLoader();


      var light = new DirectionalLight( 0xffffff );
      light.position.set( 1, 1, 1 ).normalize();
      engine.scene.add(light);

      var plight = new PointLight('white', 1) ;
      plight.position.x = 500;
      plight.position.y = 0;
      plight.position.z = 500;
      engine.scene.add( plight );

      // PICKER
      new Picker(engine, (point: Vector3, intersect: Intersection[]) => {
        // intersect.map( (isect) => console.log(isect.object.name, {...point}, ) );
        plight.position.set(point.x, point.y + 100, point.z);
      });


      let test = () => {
        console.log('test');
        mappLoader.load('ibiza', terrain , rng, (data) => {
          terrainContainer.showBorders(false);
          terrainContainer.setCellData(data); //updates terrain.geom.vertices
        });
      };
      setTimeout(test, 10);
    });
    
    loop( (delta: number) => {
      // console.log(delta);
      engine.step(delta);
      terrain.update(delta);
      controls.update();
    })
