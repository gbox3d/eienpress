import * as THREE from 'three';
// import WEBGL from 'WebGL';
// import Stats from 'state';
import { OrbitControls } from 'OrbitControls';
import { TransformControls } from 'TransformControls';
import { FBXLoader } from 'fbxLoader';
import { GLTFLoader } from 'GLTFLoader';

import { RGBELoader } from 'RGBELoader';
import { EXRLoader } from 'EXRLoader';

import Elvis from 'evlis';
import { TextureLoader } from 'three';


export default function setup(option) {

    // const Context = option.Context;
    // let select_node = null;
    // let onSelectObject = option.onSelectObject;
    // let onObjectEditChange = option.onObjectEditChange;
    let envMapFile = option.envMapFile;
    // let envMapFileFormat = option.envMapFileFormat ? option.envMapFileFormat : 'hdr';

    const _HDRILoader = option.envMapFileFormat === 'exr' ? new EXRLoader() : new RGBELoader();

    const mObjectRepository = {}

    return new Elvis({
        camera: {
            fov: 45,
            far: 15000,
            near: 1,
            position: new THREE.Vector3(0, 100, 200),
            lookat: new THREE.Vector3()

        },
        renderer: {
            type: 'webgl',
            container: option.container,
            clear: {
                color: 0x000000,
                alpha: 1
            }
        },
        setup: async function () {

            //초기화 코드는 여기에서 코딩한다.
            const scope = this;
            this.pauseKeyInput = false;
            this.select_node = null;

            scope.userData = {}

            //확장함수

            scope.loadFbx = async function ({ textureMap, modelFile, onProgress,
                diffuseColor = 0xffffff,
                metalness = 0.5,
                roughness = 0.5,
                bumpScale = 0.01,
                material,
                repo_ip
             }) {
                const loader = new FBXLoader();

                try {
                    let object = await new Promise((resolve, reject) => {
                        // loader.load(`/com/file/download/pub/6282fc15be7f388aab7750db`,
                        loader.load(`${repo_ip ? repo_ip : ''}/com/file/download/pub/${modelFile}`,
                            (object) => resolve(object),
                            (xhr) => { //progress
                                // console.log(xhr)
                                // console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
                                onProgress ? onProgress({
                                    name: 'modelfile',
                                    progress: (xhr.loaded / xhr.total * 100)
                                }) : null;
                            },
                            (err) => {
                                reject(err);
                            }
                        );
                    });

                    if (material) {
                        object.traverse((child) => {
                            if (child.isMesh) {
                                child.material = material;
                            }
                        });
                    }
                    else if (textureMap) {
                        const _texture = textureMap;
                        object.traverse((child) => {
                            if (child.isMesh) {

                                // const diffuseColor = new THREE.Color().setRGB(0.8, 0.8, 0.8);

                                child.material = new THREE.MeshStandardMaterial(
                                    {
                                        map: _texture ? _texture : null,
                                        bumpMap: _texture ? _texture : null,
                                        bumpScale: bumpScale,
                                        color: diffuseColor,
                                        metalness: metalness,
                                        roughness: roughness
                                        // envMap: hdrTexture, //오브잭트 단위로 환경멥을 적용시킨다.
                                    }
                                );
                            }
                        });
                    }
                    else {
                        //메트리얼 텍스춰 모두 지정안되어있을때
                        object.traverse((child) => {
                            if (child.isMesh) {
                                child.material = scope.defaultMaterial;
                            }
                        });
                    }
                    return object;

                }
                catch (err) {
                    console.log(err)
                    return null;
                    
                }
                
            }

            scope.loadTexture = async function ({ textureFile, onProgress,repo_ip }) {
                // let _texture

                const loader = new TextureLoader();
                let texture = await new Promise((resolve, reject) => {
                    loader.load(`${repo_ip ? repo_ip : ''}/com/file/download/pub/${textureFile}`, function (texture) {
                        resolve(texture);
                    },
                        function (xhr) {
                            // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                            onProgress ? onProgress({
                                name: textureFile,
                                progress: (xhr.loaded / xhr.total * 100)
                            }) : null;
                            //loadingStatus.innerText = `radios hdr enviroment map : ${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`;
                        }
                        ,
                        err => {
                            console.log(err);
                            return reject(err);
                        }
                    );
                })
                return texture;

                //     console.log('load complete', texture);
                //     _texture = texture;

                // return _texture
            }

            scope.addObject_fbx = async function ({ file_id, material = null,repo_ip }) {
                let _obj = await scope.loadFbx({
                    modelFile: file_id,
                    material: material,
                    repo_ip: repo_ip
                });
                if (_obj) {
                    console.log(_obj)
                    // scope.addObject(_obj);
                    scope.root_dummy.add(_obj);
                    return _obj;
                }
                return null
                // scope.root_dummy.add(_obj);
            }

            scope.addObject = async function ({
                modelFile, textureFile, fileId,
                diffuseColor,
                onProgress,
                roughness = 0.5,
                metalness = 0.5,
                bumpScale = 0.01,
            }) {

                try {


                    let object = fileId ? mObjectRepository[fileId] : undefined;
                    // if(fileId ) 
                    //     object = mObjectRepository[fileId]
                    if (object === undefined) {
                        const textureMap = await scope.loadTexture({ textureFile, onProgress });

                        object = await scope.loadFbx({
                            textureMap,
                            modelFile,
                            diffuseColor,
                            onProgress
                        });

                        object.userData = {
                            fileId,
                            fileName: modelFile,
                            diffuseColor,
                            roughness,
                            metalness,
                            bumpScale,
                        }

                        // scope.root_dummy.add(object);
                        fileId ? mObjectRepository[fileId] = object : null;
                        // mObjectRepository[fileId] = object;
                    }

                    scope.root_dummy.add(object);

                    return object;
                }
                catch (e) {
                    console.log(e);
                }

            }

            scope.clearObject = function () {
                while (scope.root_dummy.children.length > 0) {
                    scope.root_dummy.remove(scope.root_dummy.children[0]);
                }
            }

            scope.addPlane = function ({
                width = 100,
                height = 100,
                color = 0x00ff00,
                map = null,
            }) {
                const geometry = new THREE.PlaneGeometry(width, height, 1);
                const material = new THREE.MeshStandardMaterial({
                    map: map,
                    color: color
                });
                const plane = new THREE.Mesh(geometry, material);
                // plane.rotation.x = -(Math.PI / 2);
                // plane.position.y = -0.1;
                scope.root_dummy.add(plane);
                
                return plane;
            }


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
                        roughness: 0.5,
                    });
                }


                //그리드헬퍼
                const helper = new THREE.GridHelper(5000, 50, 0x00ff00, 0xff0000);
                // helper.setColors(0x00ff00,0xff0000);
                scope.scene.add(helper);

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
                option.onComplete(this);
                console.log('setup complete');

                return true;

            }
            catch (e) {
                console.error(e);
                return false;
            }
        },
        event: {
            onWindowResize: function () {
            },
            onUpdate: function (event) {
                this.updateAll();
            }
        }
    });

}

