import * as React from "react";
import THREE from "../three-bundle";
import { PerspectiveCamera } from "three";

export interface IProps {
  debug?: boolean;
  onReady: (renderer: IMagicRenderer) => void;
}

interface IState {
  isDebug: boolean;
  width: number;
  height: number;
  isLoading: boolean;
}

export interface IMagicRenderer {
  getScene: () => THREE.Scene;
  getCamera: () => THREE.Camera;
  getDiv: () => HTMLDivElement;
  step : () => void;
}
class MagicRenderer extends React.Component<IProps, IState> implements IMagicRenderer{
  renderer: THREE.WebGLRenderer;
  camera: PerspectiveCamera;
  scene: THREE.Scene;
  rootDOM: HTMLDivElement | null;

  constructor(props: IProps) {
    super(props);
    this.state = { isLoading: true, isDebug: true , height: window.innerHeight, width: window.innerWidth };
    this.renderCanvas = this.renderCanvas.bind(this);
  }
  private renderCanvas(){
    this.renderer.render(this.scene, this.camera);
  }
  private initRenderer(){
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setClearColor(0xffffff, 0.0);
    this.renderer = renderer;
    this.onWindowResize();
    window.addEventListener( 'resize', this.onWindowResize, false );			
  }
  onWindowResize = () => {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.state.width, this.state.height);  
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }
  private initScene(){
    var scene = new THREE.Scene();
    scene.background = new THREE.Color( Math.random() * 0x10 );
    var ambientLight = new THREE.AmbientLight( 0xf0f0f0  );
    scene.add( ambientLight );
    var plight = new THREE.Light('red', 100) ;
    plight.position.x = 0;
    plight.position.y = 100;
    plight.position.z = 0;
    scene.add( )
    this.scene = scene;
  }
  private initCamera(){
    // let frustumSize = 1000;
    // let aspect = this.state.width / this.state.height;
    //let camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -20000, 20000 );
    let camera = new THREE.PerspectiveCamera( 50, 1, 0.1, 20000 );
    
    camera.position.x = 0;
    camera.position.y = 500;
    camera.position.z = 0;
    this.camera = camera;
  }
  public step(){
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
  public componentDidMount() { 
    this.initCamera();
    this.initScene();
    this.initRenderer();
    console.log('renderer ready', this.renderer);
    if (this.rootDOM){
      this.rootDOM.appendChild(this.renderer.domElement);
      this.props.onReady(this);
    }
  }
 public render() {

    return (
      <React.Fragment>
        {this.state.isLoading ? <div className='Loader'/> : ''}
        <div ref={(DOMNodeRef) => {
          this.rootDOM=DOMNodeRef;
        }}/>
      </React.Fragment>
    );
  }


}

export default MagicRenderer;

