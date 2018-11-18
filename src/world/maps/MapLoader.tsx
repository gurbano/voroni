import Terrain from "../entities/Terrain";
import RNG from "../../utils/random";


export default class MapLoader {
  private load_image_data = (img: HTMLImageElement, width: number) => {
      let canvas = document.createElement( 'canvas' );
      canvas.width = img.width;
      canvas.height = img.height;
      let size = img.width * img.height;
      let context = canvas.getContext( '2d' );
      let data = new Float32Array( size );
      context!.drawImage(img, 0, 0);
      for ( let i = 0; i < size; i ++ ) {
          data[i] = 0
      }
      let imgd = context!.getImageData(0, 0, img.width, img.height);
      let pix = imgd.data;
      let j = 0;
      let max = 0;
      let min = 0;
      for (let i = 0, n = pix.length; i < n; i += (4)) {
          let all = pix[i]+pix[i+1]+pix[i+2];
          //console.log(all);
          max = Math.max(max, all);
          min = Math.min(min, all);
          data[j++] = all;
      }
      data = data.map( d => (d - min )/ (max - min) );
      return data;
  }

  private load_image(name: string, size: number, cb: (data: Float32Array, width: number, height: number) => any) {
    let _temp = new Image();
    _temp.src = './'+name+'.png';
    _temp.onload = () => { 
      let data = this.load_image_data(_temp, size); 
      //console.log('loaded', _temp, data)
      cb(data, _temp.width, _temp.height);
    };
    _temp.onerror = console.error;
  }

  
  load(level: string, terrain: Terrain, rng: RNG, cb: (data: Map<number,any>) => any):  void {
    /*
    new Array(terrain.cells.length).fill(0).forEach( (_, index) => {
      data[index] = {height: terrain.cells[index].data.height + rng.nextRange(-20, 50) };
    });
    */
   let maxh = 5000;
   let ret = new Map<number,any>();
    this.load_image(level, terrain.size ,(data: Float32Array, width: number, height: number) => {
      new Array(terrain.cells.length).fill(0).forEach( (_, index) => {
        let cell = terrain.cells[index];
        // let current = cell.data.height | 0;
        let x = Math.trunc(cell.cell.center.x / (terrain.size/width) );
        let y = Math.trunc(cell.cell.center.z / (terrain.size/height) );
        let idx = ( width * x ) + y;
        // console.log(x, y, data[idx]);
        ret[index] = {height: data[idx] * maxh };
      });
      cb(ret);
    });
    
  }
  
}