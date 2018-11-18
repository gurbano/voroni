import BaseEntity from "./BaseEntity";
import { Object3D, Vector3, Geometry, Mesh, FaceColors, Face3, MeshNormalMaterial, Color, MeshToonMaterial, Scene, Texture, ImageUtils, MeshBasicMaterial, MeshLambertMaterial,  } from "three";
import VoronoiWorld, { XVertex, XCell, VFace, XEdge } from "../voronoiWorld";

type TCell = {
  id: number;
  faces: Array<number>; 
  data: any;
  cell: XCell;
  center: number;
}
type TFace = {
  index: number; //index in geometry.faces
  cell: TCell; 
  data: any;
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
export default class Terrain extends BaseEntity {
  source: VoronoiWorld;
  cells: Array<TCell>;
  corners: Array<TCorner>;
  borders: Array<TBorder>;
  geom: Geometry;
  size: number;
  faces: Array<TFace>;
  private _mesh: Mesh;
  earthTexture: any;
  // helpers 
  // vertexToCell ()

  constructor(world: VoronoiWorld){
    super(0,0,0);
    this.source = world;   
    this.size = world.size;
  }
  generateMesh = (): Object3D => {
    console.log('mesh');
    this.geom = this.generateGeometry(this.source);
    this._mesh = new Mesh(this.geom, this.generateMaterial());
    return this._mesh;
  }
  update = (delta: number) => {
    
  }
  registerWithTexture = (scene: Scene, cb: (terrain: Terrain) => any) => {
    ImageUtils.loadTexture("./grass2.jpg", undefined,
      (earthTexture: Texture | undefined) => {
        // earthTexture
        this.earthTexture = earthTexture;
        scene.add(this.getObject());
        cb(this);
      });    
  }
  setCellData = ( data: Map<number, any> ) => {
    Object.keys(data).map( (k) => {
      if (this.cells[k]){
        let tcell: TCell = this.cells[k];
        tcell.data = Object.assign({}, tcell.data, data[k]);
      }
    });
    let geom = this.updateVertexHeights(this.geom);
    this.setGeometry(geom);
    this.updateFaces();

  }
  generateTexture = () => {
    var canvas = document.createElement( 'canvas' );
    canvas.width = 512;
    canvas.height = 512;
    var context = canvas.getContext( '2d' )!;
    for ( var i = 0; i < 20000; i ++ ) {
      context.fillStyle = 'hsl(0,0%,' + ( Math.random() * 50 + 50 ) + '%)';
      context.beginPath();
      context.arc( Math.random() * canvas.width, Math.random() * canvas.height, Math.random() + 0.15, 0, Math.PI * 2, true );
      context.fill();
    }
    context.globalAlpha = 0.075;
    context.globalCompositeOperation = 'lighter';
    return canvas;
  }
  MATERIAL_INDEX = 2;
  generateMaterial = () => {
    return [
      new MeshBasicMaterial( { //0
        color: new Color().setHSL( 0.3, 0.75, ( 15 / 15 ) * 0.4 + 0.1 ),
        map: this.earthTexture,
        depthTest: false,
        depthWrite: false,
        transparent: true
      } ),
      new MeshNormalMaterial({//1
        vertexColors: FaceColors,   
      }),
      new MeshToonMaterial({//2
        // color: new Color().setRGB(1, 0, 0),
        vertexColors: FaceColors,
        flatShading: false,
        reflectivity: 1.2,
        shininess: 0,
      }),
       new MeshToonMaterial({//3
        vertexColors: FaceColors,
        color: FaceColors,
        
        // specular: specularColor,
        reflectivity: 10.2,
        shininess: 100,
      }),
      new MeshLambertMaterial({//2
        // color: new Color().setRGB(1, 0, 0),
        vertexColors: FaceColors,
        flatShading: false,
      }),
      
    ];
    
  }
  private setGeometry = (geom: Geometry) => {
    this.geom = geom;
    this._mesh.geometry = (geom);
  }
  private generateGeometry = (world: VoronoiWorld): Geometry => {  
    let geom = new Geometry();   
    this.corners = [];
    this.cells = [];
    this.borders = [];
    this.faces = [];
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
      cell.faces.map( (face: VFace, index: number) => {
        let tface = new Face3( face.va, face.vb, face.vc );
        tface.materialIndex = this.MATERIAL_INDEX;
        tface.color.setRGB( 1, 1, 1);
        tcell.faces.push(geom.faces.length); // save face index
        this.corners[face.vb].cells.push(cell.site.voronoiId);
        // this.corners[face.vc].cells.push(cell.site.voronoiId);
        this.borders.push({
          start: face.vb,
          end: face.vc,
          edge: face.edge
        })
        geom.faces.push( tface ); 
        this.faces.push({
          index: this.faces.length,
          cell: tcell,
          data: {}
        });
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
    enum C {
      SEA = 0x0000ff,
      PLAINS = 0x555500,
      HILLS = 0x422518,
      MOUNTAINS = 0x404040, //0xeecc44,
      ICE = 0xffffff,
    };
    console.log('update faces');  
    this.cells.map( (cell: TCell) => {
      console.log(cell);
      cell.faces.map ( (a,i) => {
        console.log(this.geom.faces[a].normal);
        if(cell.data.height == 0) this.geom.faces[a].color.setHex(C.SEA);
        if(cell.data.height > 0) this.geom.faces[a].color.setHex(C.PLAINS)
        if(cell.data.height >= 600) this.geom.faces[a].color.setHex(C.HILLS)
        if(cell.data.height >= 2000) this.geom.faces[a].color.setHex(C.MOUNTAINS)
        if(cell.data.height >= 4000) this.geom.faces[a].color.setHex(C.ICE)
      });
    } );
    this.faces.map ( f => {
      
    })
    this.geom.computeFaceNormals();
    this.geom.colorsNeedUpdate = true;


    (this._mesh.geometry as Geometry).elementsNeedUpdate = true;
    (this._mesh.geometry as Geometry).colorsNeedUpdate = true;
    (this._mesh.geometry as Geometry).groupsNeedUpdate = true;
    this.geom.groupsNeedUpdate = true;   
    
  }

}



/*

toBufferGeometry = (g: Geometry): BufferGeometry => {
    let geometry = new BufferGeometry();
    var positions = new Float32Array( g.vertices.length * 3 );
    var normals   = new Float32Array( g.vertices.length * 3 );
    var colors    = new Float32Array( g.vertices.length * 3 );
    var uvs       = new Float32Array( g.vertices.length * 2 );

    var color = new Color();
    let index = 0;
    g.vertices.map( (v) => {
      let i0 = index++;
      let i1 = index++;
      let i2 = index++;
      positions[ i0 ] = v.x;
      positions[ i1 ] = v.y;
      positions[ i2 ] = v.z;

      // colors
      color.setHSL( i0 / g.vertices.length, 1.0, 0.5 );
      colors[ i0 ] = color.r;
      colors[ i1 ] = color.g;
      colors[ i2 ] = color.b;

      uvs[ i0 ] = Math.random(); // just something...
      uvs[ i1 ] = Math.random();

    });
    geometry.addAttribute( 'position', new BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'normal', new BufferAttribute( normals, 3 ) );
    geometry.addAttribute( 'color', new BufferAttribute( colors, 3 ) );
    geometry.addAttribute( 'uv', new BufferAttribute( uvs, 2 ) );
   
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    // set the normals
    geometry.computeVertexNormals(); 
    return geometry;
  }

*/