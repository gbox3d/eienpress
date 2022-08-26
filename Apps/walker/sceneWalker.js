import * as THREE from 'three';

import { Octree } from 'Octree';
import { Capsule } from 'Capsule';

import Elvis from 'evlis';


export default function setup(option) {

    const Context = option.Context;
    let onSelectObject = option.onSelectObject;
    let onObjectEditChange = option.onObjectEditChange;

    let worldOctree;

    const playerCollider = new Capsule(new THREE.Vector3(0, 50, -100), new THREE.Vector3(0, 60, -100), 3.5);

    let playerSpeed = 150;
    const playerVelocity = new THREE.Vector3();
    const playerDirection = new THREE.Vector3();

    let bDrag = false;
    let playerOnFloor = false;
    let mouseTime = 0;
    const keyStates = {};

    const GRAVITY = 30;
    const STEPS_PER_FRAME = 5;


    return new Elvis({
        camera: {
            fov: 45,
            far: 5000,
            near: 1,
            position: new THREE.Vector3(0, 10, -10),
            lookat: new THREE.Vector3(0, 10, 0)

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
            this.keyStates = {};

            this.camera.rotation.order = 'YXZ';

            const camera = scope.camera;


            /////////////////////
            //확장함수 정의
            async function loadScene(filepath) {
                console.log('load scene');
                worldOctree = new Octree();
                // console.log('save scene');
                // let data = this.root_dummy.toJSON()
                let _path = filepath.split('/').slice(0, -1).join('/')
                let _file = filepath.split('/').slice(-1).join('/')


                let data = await (await (fetch(`/api/v2/webdisk/readFile`, {
                    method: 'POST',
                    body: `${_path}\n${_file}`,
                    headers: {
                        'Content-Type': 'text/plain',
                        'authorization': localStorage.getItem('jwt_token')
                    }
                }))).json();
                // console.log(_res)


                const loader = new THREE.ObjectLoader();
                const object = await loader.parseAsync(data);

                worldOctree.fromGraphNode(object);

                // object.traverse(function (child) {
                //     console.log(child)
                // });

                // console.log(object);
                this.scene.remove(this.root_dummy);
                this.root_dummy = object;
                this.scene.add(this.root_dummy);

                // scene.add(object);

            }

            function getForwardVector() {

                camera.getWorldDirection(playerDirection);
                playerDirection.y = 0;
                playerDirection.normalize();

                return playerDirection;

            }

            function getSideVector() {

                camera.getWorldDirection(playerDirection);
                playerDirection.y = 0;
                playerDirection.normalize();
                playerDirection.cross(camera.up);

                return playerDirection;

            }

            function controls(deltaTime) {

                // gives a bit of air control
                const speedDelta = deltaTime * (playerOnFloor ? playerSpeed : playerSpeed * 0.5);
                // const 

                if (keyStates['KeyW']) {

                    playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));

                }

                if (keyStates['KeyS']) {

                    playerVelocity.add(getForwardVector().multiplyScalar(- speedDelta));

                }

                if (keyStates['KeyA']) {

                    playerVelocity.add(getSideVector().multiplyScalar(- speedDelta * 0.8));

                }

                if (keyStates['KeyD']) {

                    playerVelocity.add(getSideVector().multiplyScalar(speedDelta * 0.8));

                }

                if (playerOnFloor) {

                    if (keyStates['Space']) {

                        playerVelocity.y = 15;

                    }

                }

            }

            function playerCollisions() {

                const result = worldOctree.capsuleIntersect(playerCollider);

                playerOnFloor = false;

                if (result) {

                    playerOnFloor = result.normal.y > 0;

                    if (!playerOnFloor) {

                        playerVelocity.addScaledVector(result.normal, - result.normal.dot(playerVelocity));

                    }

                    playerCollider.translate(result.normal.multiplyScalar(result.depth));

                }

            }

            function updatePlayer(deltaTime) {
                let damping = Math.exp(- 4 * deltaTime) - 1;

                if (!playerOnFloor) {

                    playerVelocity.y -= GRAVITY * deltaTime;

                    // small air resistance
                    damping *= 0.1;

                }

                playerVelocity.addScaledVector(playerVelocity, damping);

                const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
                playerCollider.translate(deltaPosition);

                playerCollisions();

                // console.log(playerCollider.end);

                camera.position.copy(playerCollider.end);

            }

            this.loadScene = loadScene;
            this.updatePlayer = updatePlayer;
            this.controls = controls;

            //////////

            try {

                //shadow map setup
                scope.renderer.shadowMap.enabled = true;
                scope.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

                //dummy object setup
                this.root_dummy = new THREE.Group();
                this.scene.add(this.root_dummy);

                console.log(`start loading scene`);
                // await theApp.sceneManager.loadScene(`${theApp.root_path}/scene.json`);
                await this.loadScene(`${theApp.root_path}/scene.json`);
                console.log('scene load complete');

                this.touchData = {
                    startX: 0,
                    startY: 0,
                    endX: 0,
                    endY: 0,
                    clientX : 0,
                    clientY : 0,
                    startTick: 0
                };

                this.joystick = nipplejs.create({
                    zone: document.getElementById("joystick"),
                    mode: "static",
                    position: { left: "40%", top: "50%" },
                    color: "green",
                    size: 150
                });

                this.joystick.on('move', function (evt, data) {
                    // console.log(data)
                    if(data.direction) {
                        if(data.direction.angle === 'up'){
                            keyStates['KeyW'] = true;
                        }else{
                            keyStates['KeyW'] = false;
                        }
    
                        if(data.direction.angle === 'down'){
                            keyStates['KeyS'] = true;
                        }else{
                            keyStates['KeyS'] = false;
                        }
    
                        if(data.direction.angle === 'left'){
                            keyStates['KeyA'] = true;
                        }else{
                            keyStates['KeyA'] = false;
                        }
    
                        if(data.direction.angle === 'right'){
                            keyStates['KeyD'] = true;
                        }else{
                            keyStates['KeyD'] = false;
                        }

                    }
                    else {
                        keyStates['KeyW'] = false;
                        keyStates['KeyS'] = false;
                        keyStates['KeyA'] = false;
                        keyStates['KeyD'] = false;

                    }
                })
                .on('end', function (evt, data) {
                    keyStates['KeyW'] = false;
                    keyStates['KeyS'] = false;
                    keyStates['KeyA'] = false;
                    keyStates['KeyD'] = false;
                });

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
                //동적으로 창의 크기가 바뀌면 이부분이 콜백된다.
                this.updateAll({
                    resize: {
                        width: window.innerWidth,
                        height: window.innerHeight
                    }
                });
            },
            onUpdate: function (event) {
                const deltaTime = Math.min(0.05, event.deltaTick) / STEPS_PER_FRAME;

                for (let i = 0; i < STEPS_PER_FRAME; i++) {

                    this.controls(deltaTime);
                    this.updatePlayer(deltaTime);


                }


                this.updateAll();
            },
            onMouseMove: function (event) {
                // let mx = (event.offsetX / this.window_size.width) * 2 - 1;
                // let my = - (event.offsetY / this.window_size.height) * 2 + 1;
                // if (document.pointerLockElement === document.body) {
                if (bDrag) {
                    this.camera.rotation.y -= event.movementX / 500;
                    let _x = this.camera.rotation.x;
                    _x += event.movementY / 500;

                    if (_x < -2.5 && _x > -4.5) {
                        this.camera.rotation.x = _x;
                    }
                }
                // console.log(event.movementX);
            },
            onTouchStart: function (event) {
                event.preventDefault();
                let mx = event.touches[0].clientX / this.window_size.width * 2 - 1;
                let my = event.touches[0].clientY / this.window_size.height * 2 - 1;

                this.touchData.startX = mx;
                this.touchData.startY = my;
                this.touchData.clientX = event.touches[0].clientX;
                this.touchData.clientY = event.touches[0].clientY;
                this.touchData.startTick = this.clock.getElapsedTime()
            },

            onTouchMove: function (event) {
                // event.touches[0].movementX;

                event.preventDefault();

                // let mx =  ( event.offsetX / this.window_size.width ) * 2 - 1;
                let mx = event.touches[0].clientX / this.window_size.width * 2 - 1;
                let my = event.touches[0].clientY / this.window_size.height * 2 - 1;

                let movX = event.touches[0].clientX - this.touchData.clientX;
                let movY = event.touches[0].clientY - this.touchData.clientY;
                this.touchData.clientX = event.touches[0].clientX;
                this.touchData.clientY = event.touches[0].clientY;


                this.camera.rotation.y -= movX / 500;
                this.camera.rotation.x += movY / 500;

                // this.gui.txMousePos.setValue(`${mx.toFixed(2)}, ${my.toFixed(2)}`);
                // this.gui.txTouchStatus.setValue('touchmove');
            },
            onMouseDown: function (event) {
                // document.body.requestPointerLock();
                bDrag = true;
            },
            onMouseUp: function (event) {
                // document.exitPointerLock();
                bDrag = false;
            },
            onKeyDown: function (event) {
                keyStates[event.code] = true;
                // if (!this.pauseKeyInput) {
                //     switch (event.keyCode) {
                //         default:
                //             break;
                //     }
                // }
            },
            onKeyUp: function (event) {
                keyStates[event.code] = false;
            }

        }
    });

}

