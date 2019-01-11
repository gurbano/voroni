import Engine from './engine/';
import VoronoiWorld from './world/voronoiWorld';
import './index.css';
import loop from './utils/loop';
import Terrain, {  } from './world/entities/Terrain';
import Ocean from './world/entities/Ocean';
import { bindControls } from 'src/BNW3D/renderer/controls';
import RNG from './utils/random';
import TerrainContainer from './world/entities/TerrainContainer';
import MapLoader from './world/maps/MapLoader';
import Picker, { CellBorderPicker, FaceBorderPicker } from './engine/picker';
import { Vector3, Intersection, DirectionalLight, PointLight } from 'three';
import { CellData } from './world/data';
import { Facedata } from './BNW3D/BNW/api/DWorld';



const rng = new RNG('monk');

const engine = new Engine(document.getElementById('root'));
engine.init();

const voronoiWorld = new VoronoiWorld();
voronoiWorld.init();
// console.log(voronoiWorld.diagram);

let sea = new Ocean(voronoiWorld.size, voronoiWorld.size);
console.log(sea);
// sea.register(engine.scene);

let terrain = new Terrain(voronoiWorld);
let terrainContainer = new TerrainContainer(terrain, engine.scene);
// CONTROLS
let controls = bindControls(engine.getCamera());
controls.target.set( terrain.size/2, 0, terrain.size/2);
controls.update();

var light = new DirectionalLight( 0xff9999, 1 );
light.position.set( 1, 1, 1 ).normalize();
engine.scene.add(light);

var plight = new PointLight('white', 1.8) ;
plight.position.x = 0;
plight.position.y = 0;
plight.position.z = 0;
engine.scene.add( plight );

terrain.registerWithTexture(engine.scene, 
    (terrain) => {
      console.log('loaded');
      terrainContainer.update();
      terrainContainer.showBorders(false);
      terrainContainer.showPois(false);
      let mappLoader = new MapLoader();
      // PICKER
      const faceBorder = FaceBorderPicker(terrainContainer, terrain);
      const cellBorder = CellBorderPicker(terrainContainer, terrain);
      new Picker(engine, (point: Vector3, intersect: Intersection[]) => {
        terrainContainer.showBorders(false);
        faceBorder(point, intersect);
        cellBorder(point, intersect);
        plight.position.set(point.x, point.y + 100, point.z);
        plight.lookAt(point.x, point.y - 10, point.z);
      });

      let seaCells =  () => terrain.cells.filter( (c) =>  ( c.data.height == 0 ) );
      let seaFaces = () => [].concat.apply([], seaCells().map( (c) => c.faces.map ( index => terrain.faces[index]) ));
      let landCells =  () => terrain.cells.filter( (c) =>  ( c.data.height! >0 ) );
      let landFaces = () => [].concat.apply([], landCells().map( (c) => c.faces.map ( index => terrain.faces[index]) ));
      
      let updateHeightMap = (next: any) => {
        console.log('updateHeightMap');
        let stats = () => {
          console.log(`Land/Sea cells: ${landCells().length}/${seaCells().length} `);
          console.log(`Land/Sea faces: ${landFaces().length}/${seaFaces().length} `);
        }
        stats();
        mappLoader.load('ischia', terrain , rng, (data) => {
          terrainContainer.showBorders(false);
          terrainContainer.showPois(false);
          terrainContainer.setCellData(data); //updates terrain.geom.vertices
          stats();
          next();
        });
      };
      let updateHumidity = () => {
        console.log('update humidity');
        let ret = terrain.prepareCellData();
        // CELLS
        seaCells().forEach(cell => {
          let newData: Partial<CellData> = {
            water: true
          };
          ret[cell.id] = Object.assign({}, cell.data, newData );
        });
        terrain.setCellData(ret);
        // FACES
        seaFaces().forEach( (face: any) => {
          // console.log(face);
          // const normal = terrain.geom.faces[face.index].normal;
          // console.log(normal);
        });
      }
      let updateBiomes = () => {
        console.log('update biomes');
        let ret = terrain.prepareCellData();
        seaCells().forEach(cell => {
          let newData: Partial<CellData> = {};
          ret[cell.id] = Object.assign({}, cell.data, newData );
        });
      }
      let updateSteepness = () => {
        console.log('update steepness');
        let ret = terrain.prepareFaceData();
        landCells().forEach(cell => {
          let newData: Partial<Facedata> = {};
          cell.faces.forEach(index => {
            // let oldData = Object.assign({}, ret[index]);
            // console.log(oldData);
            // const normal = terrain.geom.faces[index].normal;
            // console.log(normal);
          });
          ret[cell.id] = Object.assign({}, cell.data, newData );
        });
      }

      updateHeightMap( () => {
        updateHumidity();
        updateSteepness();
        updateBiomes();
        terrain.getObject().visible = true;
      });

      terrain.getObject().visible = false;

    });
    
    loop( (delta: number) => {
      // console.log(delta);
      engine.step(delta);
      terrain.update(delta);
      controls.update();
    })
