import * as THREE from 'three';

import { RGBELoader } from 'RGBELoader';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

import { Octree } from 'Octree';

import Elvis from 'evlis';
import ObjectMngSetup from './objMng.js';

export default async function setup({ container, onSelectObject,
    isGrid = true,
    envMapFileFormat, envMapFile
}) {
    const _HDRILoader = envMapFileFormat === 'exr' ? new EXRLoader() : new RGBELoader();


    console.log('envMapFileFormat', envMapFileFormat);

    let bDrag = false;
    let bTaped = false;
    const m_rayCaster = new THREE.Raycaster();
    const m_mousePointer = new THREE.Vector2();
    const keyStates = {};

    const touchData = {
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        clientX: 0,
        clientY: 0,
        startTick: 0
    };

    const joystick = nipplejs.create({
        zone: document.getElementById("joystick"),
        mode: "static",
        position: { left: "40%", top: "50%" },
        color: "green",
        size: 150
    }).on('move', function (evt, data) {
        // console.log(data)
        if (data.direction) {
            if (data.direction.angle === 'up') {
                keyStates['KeyW'] = true;
            } else {
                keyStates['KeyW'] = false;
            }

            if (data.direction.angle === 'down') {
                keyStates['KeyS'] = true;
            } else {
                keyStates['KeyS'] = false;
            }

            if (data.direction.angle === 'left') {
                keyStates['KeyA'] = true;
            } else {
                keyStates['KeyA'] = false;
            }

            if (data.direction.angle === 'right') {
                keyStates['KeyD'] = true;
            } else {
                keyStates['KeyD'] = false;
            }

        }
        else {
            keyStates['KeyW'] = false;
            keyStates['KeyS'] = false;
            keyStates['KeyA'] = false;
            keyStates['KeyD'] = false;

        }
    }).on('end', function (evt, data) {
        keyStates['KeyW'] = false;
        keyStates['KeyS'] = false;
        keyStates['KeyA'] = false;
        keyStates['KeyD'] = false;
    });


    const objectList = [];
    let hostPlayer = null;
    let bEnableKeyInput = true;

    const elvis = await new Promise((resolve, reject) => {
        new Elvis(
            {
                camera: {
                    fov: 45,
                    far: 5000,
                    near: 1,
                    position: new THREE.Vector3(0, 10, 10),
                    lookat: new THREE.Vector3(0, 10, 0)

                },
                renderer: {
                    type: 'webgl',
                    container: container,
                    clear: {
                        color: 0x000000,
                        alpha: 1
                    }
                },
                setup: async function () {

                    //초기화 코드는 여기에서 코딩한다.
                    const scope = this;

                    // let keyStates = {};
                    // this.keyStates = keyStates;

                    this.pauseKeyInput = false;
                    this.select_node = null;
                    this.userData = {};


                    this.bPlayNow = false;

                    this.camera.rotation.order = 'YXZ';

                    try {

                        //tone mapping
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
                            // scope.scene.userData.envMapTexure = texture;
                        }

                        //default material
                        {
                            scope.defaultMaterial = new THREE.MeshStandardMaterial({
                                color: 0xffffff,
                                metalness: 0.5,
                                roughness: 0.5,
                            });
                        }

                        const grid_helper = new THREE.GridHelper(5000, 50, 0x00ff00, 0xff0000);
                        scope.scene.add(grid_helper);

                        if (!isGrid) {
                            grid_helper.visible = false;
                        }


                        //dummy object setup
                        this.root_dummy = new THREE.Group();
                        this.scene.add(this.root_dummy);
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
                        //동적으로 창의 크기가 바뀌면 이부분이 콜백된다.
                        this.updateAll({
                            resize: {
                                width: window.innerWidth,
                                height: window.innerHeight
                            }
                        });
                    },
                    onUpdate: function (event) {

                        if (this.camera.rotation.x < -Math.PI / 4) {
                            this.camera.rotation.x = -Math.PI / 4;
                        }
                        if (this.camera.rotation.x > Math.PI / 4) {
                            this.camera.rotation.x = Math.PI / 4;
                        }

                        this.onUpdate?.(event); //외부에서 등록한 콜백함수가 있다면 호출한다.


                        // objectList.forEach((obj) => {
                        //     obj.update(event);
                        // });
                        this.updateAll();

                    },
                    onMouseDown: function (event) {
                        bDrag = true;
                        bTaped = true;
                    },
                    onMouseUp: function (event) {
                        // tap event
                        if (bTaped) {
                            m_mousePointer.x = (event.clientX / window.innerWidth) * 2 - 1;
                            m_mousePointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
                            m_rayCaster.setFromCamera(m_mousePointer, this.camera);

                            console.log('tap event', m_mousePointer)

                            let intersects = m_rayCaster.intersectObjects(this.root_dummy.children);
                            if (intersects.length > 0) {
                                // console.log(intersects[0]);
                                //find dummy parent
                                // let dummyParent = intersects[0].object.parent;
                                // while (dummyParent.userData.isDummy !== true && dummyParent.parent) {
                                //     dummyParent = dummyParent.parent;
                                // }

                                onSelectObject(intersects[0].object);

                                // this.cubeCorsor.position.copy(intersects[0].point);
                            }
                        }

                        bDrag = false;
                    },
                    onMouseMove: function (event) {

                        if (bDrag) {

                            //yaw
                            this.camera.rotation.y -= event.movementX / 500;

                            //pitch
                            let _x = this.camera.rotation.x;
                            _x -= event.movementY / 500;
                            this.camera.rotation.x = _x;

                        }
                        bTaped = false;
                    },
                    onTouchStart: function (event) {
                        event.preventDefault();

                        let mx = event.touches[0].clientX / this.window_size.width * 2 - 1;
                        let my = event.touches[0].clientY / this.window_size.height * 2 - 1;

                        touchData.startX = mx;
                        touchData.startY = my;
                        touchData.clientX = event.touches[0].clientX;
                        touchData.clientY = event.touches[0].clientY;
                        touchData.startTick = this.clock.getElapsedTime()

                        m_mousePointer.x = mx;
                        m_mousePointer.y = -my;

                    },

                    onTouchMove: function (event) {

                        event.preventDefault();

                        let movX = event.touches[0].clientX - touchData.clientX;
                        let movY = event.touches[0].clientY - touchData.clientY;
                        touchData.clientX = event.touches[0].clientX;
                        touchData.clientY = event.touches[0].clientY;

                        this.camera.rotation.y -= movX / 500;
                        this.camera.rotation.x += movY / 500;


                    },

                    onKeyDown: function (event) {
                        if (bEnableKeyInput) {
                            keyStates[event.code] = true;
                        }
                    },
                    onKeyUp: function (event) {
                        keyStates[event.code] = false;
                    }

                }
            });
    });

    const objMng = await ObjectMngSetup({
        scope: elvis
    });

    console.log('complete scene setup')
    console.log(elvis);

    return {
        elvis: elvis,
        objMng: objMng,
        setEnableKeyInput: function (b) {
            if(b === false){
                for(let k in keyStates){
                    keyStates[k] = false;
                }
            }
            bEnableKeyInput = b;
        },
        getHostPlayer: function () {
            return hostPlayer
        },
        setHostPlayer: function (player) {
            hostPlayer = player;
        },
        getWorldCollider() {
            // return octree;
            const worldOctree = new Octree();
            worldOctree.fromGraphNode(elvis.root_dummy);
            return worldOctree;
        },
        getKeyStatus() {
            return keyStates;
        },
        getDragStatus() {
            return bDrag;
        },
        addObjectList(obj) {
            objectList.push(obj);
        },
        removeObjecList(obj) {
            objectList.splice(objectList.indexOf(obj), 1);
        }
    }

}