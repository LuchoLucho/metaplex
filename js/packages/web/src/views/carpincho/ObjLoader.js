import React, { Component } from "react";
import ReactDOM from "react-dom";
import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader"

const assetPrefix = '';

const style = {
    height: 500 // we can control scene size by setting container dimensions
};

class App extends Component {
    componentDidMount() {
        this.sceneSetup();
        this.addLights();
        this.loadTheModel();
        this.startAnimationLoop();
        window.addEventListener('resize', this.handleWindowResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
        window.cancelAnimationFrame(this.requestID);
        this.controls.dispose();
    }

    // Standard scene setup in Three.js. Check "Creating a scene" manual for more information
    // https://threejs.org/docs/#manual/en/introduction/Creating-a-scene
    sceneSetup = () => {
        // get container dimensions and use them for scene sizing
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, // fov = field of view
            width / height, // aspect ratio
            0.1, // near plane
            10000 // far plane
        );
        this.camera.position.x = 0;
        this.camera.position.z = 35; // is used here to set some distance from a cube that is located at z = 0
        // OrbitControls allow a camera to orbit around the object
        // https://threejs.org/docs/#examples/controls/OrbitControls
        this.controls = new OrbitControls( this.camera, this.mount );
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( width, height );
        this.mount.appendChild( this.renderer.domElement ); // mount using React ref
    };

    // Code below is taken from Three.js OBJ Loader example
    // https://threejs.org/docs/#examples/en/loaders/OBJLoader
    loadTheModel = () => {
        // instantiate a loader
        var manager = new THREE.LoadingManager();
        manager.setURLModifier((url) => {                        
            return assetPrefix + "/scenes/scene02/" + url;
        });
        const loader = new OBJLoader(manager);        
        const mtlLoader = new MTLLoader(manager);

        mtlLoader.load('SackBoyCar02_SceneObj01.mtl', (mtl) => {
            mtl.preload();
            loader.setMaterials(mtl);
            loader.load('SackBoyCar02_SceneObj01.obj', (root) => {
              //scene.add(root);
              root.scale.set(5,5,5);
              this.scene.add( root );

            });
          });

          //loader.load('https://www.arweave.net/CXAvFPYD1g9RcDoQJWxRhuSY0Z-wpjIT0GhBWms88GY?ext=glb', (root) =>
          //the previous page takes me here: but the loader doesn't support it!
          //https://bfyc6fhwapla6ulqhiick3crq3sjrum7wctdee6qnbavu2z46bta.arweave.net/CXAvFPYD1g9RcDoQJWxRhuSY0Z-wpjIT0GhBWms88GY/?ext=glb
          const loaderGLB = new GLTFLoader();
          //loaderGLB.load('https://bfyc6fhwapla6ulqhiick3crq3sjrum7wctdee6qnbavu2z46bta.arweave.net/CXAvFPYD1g9RcDoQJWxRhuSY0Z-wpjIT0GhBWms88GY/?ext=glb', (root) =>
          debugger;
          loaderGLB.load(this.props.nftUrl, (root) =>
          {        
              debugger;      
              //root.scale.set(5,5,5); ONLY FOR OBJ!
              root.scene.scale.set(5,5,5);
              root.scene.position.set(20,0,0);
              this.scene.add( root.scene );
          });

    };

    // adding some lights to the scene
    addLights = () => {
        const lights = [];

        // set color and intensity of lights
        lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
        lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
        lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

        // place some lights around the scene for best looks and feel
        lights[ 0 ].position.set( 0, 2000, 0 );
        lights[ 1 ].position.set( 1000, 2000, 1000 );
        lights[ 2 ].position.set( - 1000, - 2000, - 1000 );

        this.scene.add( lights[ 0 ] );
        this.scene.add( lights[ 1 ] );
        this.scene.add( lights[ 2 ] );
    };

    startAnimationLoop = () => {
        // slowly rotate an object
        if (this.model) this.model.rotation.z += 0.005;

        this.renderer.render( this.scene, this.camera );

        // The window.requestAnimationFrame() method tells the browser that you wish to perform
        // an animation and requests that the browser call a specified function
        // to update an animation before the next repaint
        this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
    };

    handleWindowResize = () => {
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;

        this.renderer.setSize( width, height );
        this.camera.aspect = width / height;

        // Note that after making changes to most of camera properties you have to call
        // .updateProjectionMatrix for the changes to take effect.
        this.camera.updateProjectionMatrix();
    };

    render() {
        return <div style={style} ref={ref => (this.mount = ref)} />;
    }
}

export class Container extends React.Component {
    state = {isMounted: true};

    url = "";
    
    constructor(props) {
        super(props);        
        this.url = props.nftUrl;        
      }
    
    render() {
        const {isMounted = true, loadingPercentage = 0} = this.state;
        return (
            <>
                <h3>NFT to render: {this.props.nftUrl}</h3>
                <button className="ant-btn ant-btn-primary connector"
                onClick={() => this.setState(state => ({isMounted: !state.isMounted}))}>
                    {isMounted ? "Unmount" : "Mount"}
                </button>
                {isMounted && <App onProgress={loadingPercentage => this.setState({ loadingPercentage })} nftUrl={this.props.nftUrl}/>}
                {isMounted && loadingPercentage === 100 && <div>Scroll to zoom, drag to rotate</div>}
                {isMounted && loadingPercentage !== 100 && <div>Loading Model: {loadingPercentage}%</div>}
            </>
        )
    }
}
