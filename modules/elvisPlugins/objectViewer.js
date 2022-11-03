import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

import Elvis from 'evlis';

import ObjectMngSetup from '../elvisPlugins/objMng.js';

export default async function ({
    container,
    window_size,
    envMapFileFormat,envMapFile,
    cameraPosition = new THREE.Vector3(0, 100, 200), 
    cameraTarget =new THREE.Vector3() , 
    cameraFov=45, 
    cameraNear=1, cameraFar=15000,
    isGrid = true,
    onUpdate
}) {

    console.log(`objectViewer version 1.0.0`);
    console.log(`THREE version ${THREE.REVISION}`);
    console.log(`elvis version ${Elvis.version}`);
    
    const _HDRILoader = envMapFileFormat === 'exr' ? new EXRLoader() : new RGBELoader();

    let bEnableKeyInput = true;
    let keyStates = [];
    
    const scope = await new Promise((resolve, reject) => {

        new Elvis({
            camera: {
                fov: cameraFov,
                far: cameraFar,
                near: cameraNear,
                position: cameraPosition,
                lookat: cameraTarget

            },
            renderer: {
                type: 'webgl',
                container: container,
                clear: {
                    color: 0x000000,
                    alpha: 1
                }
            },
            window_size : window_size,
            setup: async function () {

                //초기화 코드는 여기에서 코딩한다.
                const scope = this;
                this.pauseKeyInput = false;
                this.select_node = null;
                this.onUpdate = onUpdate;


                scope.userData = {}

                ////////////////////////////////////////////////////////////////////////////////////////////////
                try {
                    scope.renderer.toneMapping = THREE.ACESFilmicToneMapping;
                    scope.renderer.toneMappingExposure = 0.75;
                    scope.renderer.outputEncoding = THREE.sRGBEncoding;

                    //shadow map setup
                    scope.renderer.shadowMap.enabled = true;
                    scope.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

                    //tone map setup
                    if (envMapFile) {
                        let texture = await new Promise((resolve, reject) => {
                            // new RGBELoader()
                            // new EXRLoader()
                            _HDRILoader
                                .setPath('/com/file/download/pub/')
                                .load(envMapFile, function (texture) {
                                    return resolve(texture);
                                },
                                    function (xhr) {
                                        // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                                    },
                                    function (err) {
                                        console.log(err);
                                        return reject(err);
                                    });
                        });

                        console.log('load complete')

                        texture.mapping = THREE.EquirectangularReflectionMapping;
                        // scope.scene.background = texture;
                        scope.scene.environment = texture;

                        //사용자변수 등록 
                        scope.userData.envMapTexure = texture;
                    }

                    {
                        scope.defaultMaterial = new THREE.MeshStandardMaterial({
                            color: 0xffffff,
                            metalness: 0.5,
                            roughness: 0.5
                            // transparent: true,
                            // opacity: 0.5
                        });
                    }


                    

                    //오빗컨트롤
                    //카메라의 현재 위치 기준으로 시작한다.
                    var orbitControl = new OrbitControls(this.camera, this.renderer.domElement);
                    orbitControl.target.set(0, 0, 0);
                    orbitControl.update();
                    this.orbitControl = orbitControl;


                    //dummy object setup
                    this.root_dummy = new THREE.Group();
                    this.scene.add(this.root_dummy);

                    //setup complete
                    this.startRender();
                    resolve(this);
                }
                catch (e) {
                    console.error(e);
                    // return false;
                    reject(e);
                }
            },
            event: {
                onWindowResize: function () {
                },
                onUpdate: function (event) {

                    this.onUpdate?.(event);

                    // this.scene.traverse((node) => {
                    //     if(node.gameObject && node.gameObject.update){
                    //         node.gameObject.update(event);
                    //     }
                    // });
                    this.updateAll();
                },
                onMouseOver: function (event) {
                    // console.log('mouse over');
                    bEnableKeyInput = true;
                },
                onMouseLeave: function (event) {
                    // console.log('mouse leave');
                    bEnableKeyInput = false;
                },
                onKeyDown: function (event) {
                    if (bEnableKeyInput === true) {
                        keyStates[event.code] = true;
                    }
                },
                onKeyUp: function (event) {
                    if (bEnableKeyInput === true) {
                        keyStates[event.code] = false;
                    }
                }
            }
        })
    });

    // const defaultEnvMap = scope.userData.envMapTexure;
    // const defaultMaterial = scope.defaultMaterial;

    const grid_helper = new THREE.GridHelper(5000, 50, 0x00ff00, 0xff0000);
    scope.scene.add(grid_helper);

    if (!isGrid) {
        grid_helper.visible = false;
    }

    const objMng = await ObjectMngSetup({
        scope : scope
    });

    return {
        elvis: scope,
        objMng: objMng,
        showEnvMap : (bShow) => {

            if (bShow) {
                // scope.root_dummy.add(scope.enviromentMap);
                scope.scene.background = scope.scene.environment;
            }
            else {
                // scope.root_dummy.remove(scope.enviromentMap);
                scope.scene.background = null;
            }

            // scope.scene.background = scope.scene.environment;
        },
        toggleEnvMap : () => {
            if (scope.scene.background) {
                scope.scene.background = null;
            }
            else {
                scope.scene.background = scope.scene.environment;
            }
        },
        toggleGrid : () => {
            grid_helper.visible = !grid_helper.visible;
        },
        resetCamera : function(){
            scope.camera.position.set(0, 100, 200);
            scope.camera.lookAt(0, 0, 0);
        },
        getEnableKeyInput : function(){
            return bEnableKeyInput;
        },
        setEnableKeyInput : function(bEnable){
            bEnableKeyInput = bEnable;
        },
        getKeyStates : function(keyCode){
            return keyStates[keyCode];
        }
    }

}

