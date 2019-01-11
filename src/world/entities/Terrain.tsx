import BaseEntity from "./BaseEntity";
import { Object3D, Vector3, Geometry, Mesh, FaceColors, Face3, MeshNormalMaterial, Color, MeshToonMaterial, Scene, MeshBasicMaterial, MeshLambertMaterial, MeshPhongMaterial,  } from "three";
import VoronoiWorld, { XVertex, XCell, VFace, XEdge } from "../voronoiWorld";
import { CellData, FaceData, STEEP } from "../data";

type TCell = {
  id: number;
  faces: Array<number>; //index in geometry.faces
  data: Partial<CellData>;
  cell: XCell;
  center: number;
}
export type TFace = {
  index: number; //index in geometry.faces
  cell: TCell; 
  data: Partial<FaceData>;
  oppositeFace: number | undefined;
  oppositeCell: number | undefined;
}
type TCorner = {
  index: number; //index in geometry.vertices
  cells: Array<number>; //all cells this vertex belongs to
}
export type TBorder = {
  start: number;
  end: number;
  edge: XEdge;
  face: TFace;
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
    // this._mesh.geometry.scale(1, 1, 1);
    return this._mesh;
  }
  update = (delta: number) => {
    
  }
  registerWithTexture = (scene: Scene, cb: (terrain: Terrain) => any) => {
    /*
    ImageUtils.loadTexture("./fiord.png", undefined,
      (earthTexture: Texture | undefined) => {
        // earthTexture
        this.earthTexture = earthTexture;
        scene.add(this.getObject());
        cb(this);
      });  
    */
   scene.add(this.getObject());
   cb(this);
  }
  prepareFaceData = (): Map<number, any> => {
    let ret = new Map();
    this.faces.forEach((c: TFace, index: number) => {
      ret[c.index] = c.data;
    });
    return ret;
  };
  setFaceData = ( data: Map<number, any> ) => {
    Object.keys(data).map( (k) => {
      if (this.cells[k]){
        let tface: TFace = this.faces[k];
        tface.data = Object.assign({}, tface.data, data[k]);
      }
    });
    let geom = this.updateVertexHeights(this.geom);
    this.setGeometry(geom);
    this.updateFaceMaterial();
  }
  prepareCellData = (): Map<number, any> => {
    let ret = new Map();
    this.cells.forEach((c: TCell, index: number) => {
      ret[c.id] = c.data;
    });
    return ret;
  };
  setCellData = ( data: Map<number, any> ) => {
    Object.keys(data).map( (k) => {
      if (this.cells[k]){
        let tcell: TCell = this.cells[k];
        tcell.data = Object.assign({}, tcell.data, data[k]);
      }
    });
    let geom = this.updateVertexHeights(this.geom);
    this.setGeometry(geom);
    this.updateFaceMaterial();
  }
  MATERIAL_INDEX = 4;
  generateMaterial = () => {
    return [
      new MeshBasicMaterial( { //0
        color: new Color().setRGB(1, 0, 0),// .setHSL( 0.3, 0.75, ( 15 / 15 ) * 0.4 + 0.1 ),
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
        flatShading: true,
        reflectivity: 1.2,
        shininess: 1.0,
      }),
      new MeshLambertMaterial({//3
        // color: new Color().setRGB(1, 0, 0),
        vertexColors: FaceColors,
        reflectivity: 1.2,
        flatShading: true,
      }),
      new MeshPhongMaterial({//4
        // color: new Color().setRGB(1, 0, 0),
        vertexColors: FaceColors,
        reflectivity: 5,
        flatShading: false,
        bumpMap: this.earthTexture,
        bumpScale: 1,
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
    // 
    const getOppositeCell = (face: VFace, cellId: number) => {
      if (!face.edge.lSite || !face.edge.rSite){
        return undefined;
      } else{
        return face.edge.rSite.voronoiId === cellId ? face.edge.lSite.voronoiId : face.edge.rSite.voronoiId;
      }
    }
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
        let geom_face = new Face3( face.va, face.vb, face.vc );
        geom_face.materialIndex = this.MATERIAL_INDEX;
        geom_face.color.setRGB( 1, 1, 1);
        tcell.faces.push(geom.faces.length); // save face index
        this.corners[face.vb].cells.push(cell.site.voronoiId);
        // this.corners[face.vc].cells.push(cell.site.voronoiId);
        geom.faces.push( geom_face ); 
        // terrain.faces
        let tface: TFace = {
          index: this.faces.length,
          cell: tcell,
          oppositeCell: getOppositeCell(face, tcell.id),
          oppositeFace: 0,
          data: {
            steepness: STEEP.FLAT,
            biomes: [],      
          }
        };
        this.faces.push(tface);
        //terrain.borders
        const border = {
          start: face.vb,
          end: face.vc,
          edge: face.edge,
          face: tface,
        };
        this.borders.push(border);
      });
      this.cells.push(tcell);
    });
    geom.computeFaceNormals(); 
    geom.computeVertexNormals();
    return geom;
  }

  

  isCenter = (index: number): boolean => this.corners[index] && this.corners[index].cells && this.corners[index].cells.length > 0;
  
  getVertexHeight = (index: number): number => {
    let corner = this.corners[index];
    if (corner && corner.cells && corner.cells.length){
      let sumHeight = 0;
      corner.cells.map ( c_i => {sumHeight += this.cells[c_i].data.height || 0});
      let avgHeight = sumHeight / corner.cells.length;
      return avgHeight;
    }else{
      let cell = this.cells.filter( c => c.center===corner.index)[0];
      if (cell){
        return cell.data.height || 0;
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
    geom.computeVertexNormals();
    return geom;
  }

  
  updateFaceMaterial = () => { 
    enum C {
      SEA = 0x0000ff,
      PLAINS = 0x555500,
      HILLS = 0x422518,
      MOUNTAINS = 0x404040, //0xeecc44,
      ICE = 0xffffff,
    };
    console.log('update faces');  
    this.cells.map( (cell: TCell) => {
      cell.faces.map ( (a,i) => {
        let h = cell.data.height || 0;
        if(h == 0) this.geom.faces[a].color.setHex(C.SEA);
        if(h > 0) this.geom.faces[a].color.setHex(C.PLAINS)
        if(h >= 1000) this.geom.faces[a].color.setHex(C.HILLS)
        if(h >= 3500) this.geom.faces[a].color.setHex(C.MOUNTAINS)
        if(h >= 5000) this.geom.faces[a].color.setHex(C.ICE)
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