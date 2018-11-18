import * as THREE from "three";
import { PerspectiveCamera, Vector3 } from "three";

export default class Engine {
  renderer: THREE.WebGLRenderer;
  camera: PerspectiveCamera;
  scene: THREE.Scene;
  rootDOM: HTMLElement | null;
  constructor(el: HTMLElement | null){
    this.rootDOM = el;
  }
  init= () => {
    this.initCamera();
    this.initScene();
    this.initRenderer();
    console.log('renderer ready', this.renderer);
    if (this.rootDOM){
      this.rootDOM.appendChild(this.renderer.domElement);
    }else{
      document.body.appendChild(this.renderer.domElement);
    }
  }
  onWindowResize = () => {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // this.renderer.setSize(this.state.width, this.state.height);  
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }
  private initRenderer(){
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setClearColor(0xffffff, 0.0);
    this.renderer = renderer;
    this.onWindowResize();
    window.addEventListener( 'resize', this.onWindowResize, false );			
  }
  private initScene(){
    var scene = new THREE.Scene();
    scene.background = new THREE.Color( Math.random() * 0x10 );
    // var ambientLight = new THREE.AmbientLight( 0xf0f0f0  );
    // scene.add( ambientLight );
   
    // scene.add( new GridHelper(2000, 20) );
    this.camera.lookAt(new Vector3(500,0,500));
    this.scene = scene;
  }
  private initCamera(){
    // let frustumSize = 1000;
    // let aspect = this.state.width / this.state.height;
    //let camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -20000, 20000 );
    let camera = new THREE.PerspectiveCamera( 50, 1, 0.1, 200000000 ); 
    camera.position.x = 0;
    camera.position.y = 500;
    camera.position.z = 0;
    this.camera = camera;
  }
  public step(delta: number){
    this.renderer.render(this.scene, this.camera);
  }
  public getScene(){
    return this.scene;
  }
  public getCamera(){
    return this.camera;
  }
  public getDiv(){
    return this.rootDOM || new HTMLDivElement();
  }
}