import * as THREE from 'three';

import { Octree } from 'Octree';
import { Capsule } from 'Capsule';

import { RGBELoader } from 'RGBELoader';
import { FBXLoader } from 'fbxLoader';
import { GLTFLoader } from 'GLTFLoader';
import { GLTFExporter } from 'GLTFExporter';



import Elvis from 'evlis';
import { Euler } from 'three';
import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";



export default function setup(option) {

    const _Context = option.Context;
    const galleryInfo = option.galleryInfo;
    let onSelectObject = option.onSelectObject;
    let onObjectEditChange = option.onObjectEditChange;

    const worldOctree = new Octree();

    const m_playerCollider = new Capsule(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 150, 0), 35);
    const m_rayCaster = new THREE.Raycaster();
    const m_mousePointer = new THREE.Vector2();


    let playerSpeed = 500;
    const playerVelocity = new THREE.Vector3();
    const playerDirection = new THREE.Vector3();
    let playerFsm = 'ready';


    let bDrag = false;
    let playerOnFloor = false;
    let mouseTime = 0;
    const keyStates = {};

    const GRAVITY = 98;
    const STEPS_PER_FRAME = 5;



    console.log('start setup', galleryInfo);

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

            this.bPlayNow = false;

            this.camera.rotation.order = 'YXZ';

            const camera = scope.camera;

            this.playerCollider = m_playerCollider;

            scope.prefabDic = {};
            scope.triggerInfo = {};

            /////////////////////
            //확장함수 정의

            scope.makeBoxMeshDummy = function () {

                const fileId = 'BuiltInObject.BoxMesh'

                const _root = new THREE.Group();

                _root.name = 'BoxMeshDummy';
                _root.userData = {
                    type: 4,
                    isDummy: true,
                    tagName: _root.name,
                    fileId: fileId
                };
                
                const _mesh = new THREE.Mesh(
                    new THREE.BoxBufferGeometry(100, 100, 100),
                    this.defaultMaterial
                );
                _root.add(_mesh);
                return _root
            }

            async function _loadObject({
                host_url,
                modelFile,
                textureFile,
                onProgress,
                diffuseColor,
                envMap
            }) {

                try {
                    const textureLoader = new THREE.TextureLoader();
                    let texture = await new Promise((resolve, reject) => {
                        textureLoader.load(`${host_url}/com/file/download/pub/${textureFile}`, function (texture) {
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

                    console.log('load complete', texture);

                    const fbxLoader = new FBXLoader();
                    // console.log(loader);

                    let object = await new Promise((resolve, reject) => {
                        // loader.load(`/com/file/download/pub/6282fc15be7f388aab7750db`,
                        fbxLoader.load(`/com/file/download/pub/${modelFile}`,
                            (object) => resolve(object),
                            (xhr) => { //progress
                                // console.log(xhr)
                                // console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
                                onProgress ? onProgress({
                                    // name: `Load remote model ${modelFile.substring(0, 6)}`,
                                    name: `loading ${modelFile}`,
                                    progress: (xhr.loaded / xhr.total * 100)
                                }) : null;
                            },
                            (err) => {
                                reject(err);
                            }
                        );
                    });

                    object.traverse(function (child) {
                        if (child.isMesh) {
                            child.material = new THREE.MeshStandardMaterial(
                                {
                                    map: texture,
                                    bumpMap: texture,
                                    bumpScale: 0.01,
                                    color: diffuseColor,
                                    metalness: 0.5,
                                    roughness: 0.5,
                                    envMap: envMap,
                                    // envMap: hdrTexture, //오브잭트 단위로 환경멥을 적용시킨다.
                                }
                            );
                        }
                    });

                    return object;

                }
                catch (err) {
                    console.log(err);
                }
            }

            async function loadObject({
                host_url,
                _id,
                onProgress,
                hdr_envMap,
                diffuseColor = new THREE.Color(0xffffff)
            }) {

                // let result = await (await fetch(`${host_url}/com/object/detail/pub/${_id}`, {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                //         'authorization': localStorage.getItem('jwt_token')
                //     },
                //     body: makeFormBody({
                //         id: _id
                //     })
                // })).json();

                let result = await (await fetch(`${host_url}/com/object/detail/pub/${_id}`)).json();

                console.log(result);

                if (result.r === 'ok') {
                    const modelFile = result.data.modelFile;
                    const textureFile = result.data.textureFile;
                    const type = parseInt(result.data.type);

                    let object = await _loadObject({
                        host_url,
                        modelFile,
                        textureFile,
                        diffuseColor,
                        onProgress,
                        // envMap: type === 0 ? scope.hdr_envMap : undefined
                        envMap: hdr_envMap //일단 다적용 
                    })

                    //더미등록 
                    const dummy = new THREE.Group();
                    dummy.name = 'objectDummy'
                    dummy.add(object);
                    dummy.userData = {
                        isDummy: true,
                        tagName: 'objectDummy',
                        fileId: _id,
                        type: type,
                        modelFile: modelFile,
                        textureFile: textureFile,
                        diffuseColor: diffuseColor
                    }

                    console.log('loadObject', dummy);

                    return dummy;
                }
            }

            //clear space dummy and add object
            //트리에서 더미들을 검색하고, 더미에 정의된 오브잭트들을 만들어 자식노드로 다시 붙여서 완성시킨다.
            async function setupSpaceDummy(space_dummy, onProgress) {

                // 오브잭트 상세로딩 & 프리펩등록 
                for (let i = 0; i < space_dummy.children.length; i++) {
                    let child = space_dummy.children[i]
                    // object.traverse(async function (child) {
                    // console.log(child)
                    if (child.userData.isDummy) {
                        const fileId = child.userData.fileId;
                        console.log(fileId)
                        if (fileId === 'BuiltInObject.BoxMesh') {
                            let _obj = scope.prefabDic[fileId]
                            if (!_obj) {
                                _obj = scope.makeBoxMeshDummy()
                                scope.prefabDic[fileId] = _obj
                            }
                            child.add(_obj.children[0].clone());
                            
                            onProgress ? onProgress({
                                name: `Load prefab ${fileId}`,
                                progress: 100
                            }) : null;
                        }
                        else if (fileId === 'TriggerObject.StartPoint') {

                            scope.triggerInfo.startPoint = child.position.clone();
                            scope.triggerInfo.startRotation = new Euler()
                            scope.triggerInfo.startRotation.setFromQuaternion(child.quaternion, 'YXZ');

                            onProgress ? onProgress({
                                name: `Load prefab ${fileId}`,
                                progress: 100
                            }) : null;
                        }
                        else if (fileId === 'TriggerObject.Gate') {

                            console.log('process gate trigger')

                            // const _mesh = child.children[0];

                            const _gate = {
                                position: child.position.clone(),
                                data: child.userData
                            }

                            scope.triggerInfo.gate ? scope.triggerInfo.gate.push(_gate) : scope.triggerInfo.gate = [_gate];

                            onProgress ? onProgress({
                                name: `Load prefab ${fileId}`,
                                progress: 100
                            }) : null;

                        }
                        else {
                            //load from object id
                            let _obj = scope.prefabDic[fileId]
                            if (!_obj) {
                                _obj = await loadObject({
                                    host_url: '',
                                    _id: fileId,
                                    onProgress: onProgress,
                                    diffuseColor: child.userData.diffuseColor,
                                    hdr_envMap: scope.hdr_envMap
                                })
                                scope.prefabDic[fileId] = _obj
                            }
                            //더미는 자식노드로 붙여서 완성시킨다.
                            child.add(_obj.children[0].clone())
                        }
                    }
                }

                return space_dummy;
            }

            async function loadScene(host_url, id, onProgress) {
                console.log('load scene', id);

                const loader = new THREE.ObjectLoader();

                const object = await new Promise((resolve, reject) => {
                    loader.load(
                        `${host_url}/com/file/download?path=${id}`,
                        (object) => resolve(object),
                        (xhr) => { //progress
                            // console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
                            onProgress ? onProgress({
                                name: 'load scene data',
                                progress: (xhr.loaded / xhr.total * 100)
                            }) : null;
                        },
                        (err) => {
                            reject(err);
                        }
                    );
                });

                let _spaceDummy = object.getObjectByName('space_dummy')

                console.log(_spaceDummy)

                if (_spaceDummy) {

                    onProgress({
                        name: 'setup space dummy',
                        progress: 0
                    });

                    await setupSpaceDummy(_spaceDummy, onProgress)

                    onProgress({
                        name: 'finishing',
                        progress: 100
                    });

                    return _spaceDummy;
                }
                else {
                    alert(`에러 : 씬 파일이 잘못되었습니다.`);
                }
            }

            /////////////////////////////////////////////

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

                const result = worldOctree.capsuleIntersect(m_playerCollider);

                playerOnFloor = false;

                if (result) {

                    playerOnFloor = result.normal.y > 0;

                    if (!playerOnFloor) {

                        playerVelocity.addScaledVector(result.normal, - result.normal.dot(playerVelocity));

                    }

                    m_playerCollider.translate(result.normal.multiplyScalar(result.depth));

                }

            }

            async function appendSpace({ filePath }) {

                // playerFsm = 'stop';
                scope.bPlayNow = false
                _Context.progressBox.show();
                let _spaceDummy = await loadScene(
                    _Context.host_url,
                    filePath,
                    function (progress) {
                        _Context.progressBox.update(progress);
                    });
                _Context.progressBox.close();
                scope.root_dummy.add(_spaceDummy);
                worldOctree.fromGraphNode(_spaceDummy);
                // playerFsm = 'play';
                scope.bPlayNow = true
            }


            function updatePlayer(deltaTime) {


                switch (playerFsm) {
                    case 'ready':
                    case 'stop':
                        break;
                    case 'play':
                        {
                            let damping = Math.exp(- 4 * deltaTime) - 1;

                            if (!playerOnFloor) {

                                playerVelocity.y -= GRAVITY * deltaTime;

                                // small air resistance
                                damping *= 0.1;

                            }

                            playerVelocity.addScaledVector(playerVelocity, damping);

                            const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
                            m_playerCollider.translate(deltaPosition);

                            playerCollisions();
                            camera.position.copy(m_playerCollider.end);

                            if (scope.triggerInfo.gate) {
                                //get distance to gate
                                scope.triggerInfo.gate.forEach(gate => {
                                    const _distance = m_playerCollider.start.distanceTo(gate.position);

                                    if (_distance < 300 && !gate.isOpen && gate.data.code === 'Gate') {
                                        gate.isOpen = true;
                                        console.log('open gate', gate)

                                        console.log(gate.data.target)

                                        console.log(galleryInfo.space)

                                        let spaceFilePath = galleryInfo.space.find((item) => {
                                            return item.filePath.search(gate.data.target) >= 0
                                        });

                                        //load new space
                                        appendSpace({
                                            filePath: spaceFilePath.filePath
                                        });

                                    }
                                })

                            }

                        }
                        break;
                    default:
                        break;
                }


            }

            this.loadScene = loadScene;
            this.updatePlayer = updatePlayer;
            this.controls = controls;

            //////////

            try {

                //tone mapping
                scope.renderer.toneMapping = THREE.ACESFilmicToneMapping;
                scope.renderer.toneMappingExposure = 0.75;
                scope.renderer.outputEncoding = THREE.sRGBEncoding;

                //shadow map setup
                scope.renderer.shadowMap.enabled = true;
                scope.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap



                //tone map setup
                {
                    _Context.progressBox.show()

                    let texture = await new Promise((resolve, reject) => {
                        new RGBELoader()
                            .setPath('/com/file/download/pub/')
                            .load('62837f89be7f388aab7750e9', function (texture) {
                                return resolve(texture);
                            },
                                function (xhr) {
                                    // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                                    _Context.progressBox.update({
                                        name: 'Loading hdr',
                                        progress: xhr.loaded / xhr.total * 100
                                    })
                                    //loadingStatus.innerText = `radios hdr enviroment map : ${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`;
                                },
                                function (err) {
                                    console.log(err);
                                    return reject(err);
                                });
                    });

                    _Context.progressBox.close();

                    console.log('load complete')

                    texture.mapping = THREE.EquirectangularReflectionMapping;
                    // scope.scene.background = texture;
                    // scope.scene.environment = texture;
                    scope.hdr_envMap = texture;

                    //사용자변수 등록 
                    // scope.envMapTexure = texture;
                }


                //dummy object setup
                this.root_dummy = new THREE.Group();
                this.scene.add(this.root_dummy);



                //스타트업 씬 로드
                {
                    //`${_Context.host_url}/com/file/download?path=${galleryInfo.startUpSpace}`
                    //load space
                    _Context.progressBox.show();

                    let _spaceDummy = await loadScene(
                        _Context.host_url,
                        galleryInfo.startUpSpace,
                        function (progress) {
                            _Context.progressBox.update(progress);
                        });
                    _Context.progressBox.close();

                    scope.playerCollider.translate(scope.triggerInfo.startPoint);
                    scope.camera.position.copy(m_playerCollider.end);
                    scope.camera.rotation.y = scope.triggerInfo.startRotation.y;

                    //space dummy 추가 
                    scope.root_dummy.add(_spaceDummy);
                    worldOctree.fromGraphNode(_spaceDummy);

                }



                //touch device setup
                {
                    this.touchData = {
                        startX: 0,
                        startY: 0,
                        endX: 0,
                        endY: 0,
                        clientX: 0,
                        clientY: 0,
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
                    })
                        .on('end', function (evt, data) {
                            keyStates['KeyW'] = false;
                            keyStates['KeyS'] = false;
                            keyStates['KeyA'] = false;
                            keyStates['KeyD'] = false;
                        });

                }

                //cube cursor setup
                {
                    const geometry = new THREE.SphereGeometry(7, 16, 8);
                    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
                    const cube = new THREE.Mesh(geometry, material);
                    cube.name = 'cubeCursor';
                    this.scene.add(cube);
                    this.cubeCorsor = cube;
                    // cube.visible = false;
                }


                //setup complete
                this.startRender();
                option.onComplete(this);
                console.log('setup complete');
                this.bPlayNow = true;
                playerFsm = 'play';


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


                if (this.bPlayNow) {

                    m_rayCaster.setFromCamera(m_mousePointer, this.camera);

                    const deltaTime = Math.min(0.05, event.deltaTick) / STEPS_PER_FRAME;

                    for (let i = 0; i < STEPS_PER_FRAME; i++) {
                        this.controls(deltaTime);
                        this.updatePlayer(deltaTime);
                    }
                }

                this.updateAll();

            },
            onPointerMove(event) {
                // calculate pointer position in normalized device coordinates
                // (-1 to +1) for both components
                m_mousePointer.x = (event.clientX / window.innerWidth) * 2 - 1;
                m_mousePointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

            },
            onPointerUp: function (event) {

                let intersects = m_rayCaster.intersectObjects(this.root_dummy.children);
                if (intersects.length > 0) {
                    console.log(intersects[0]);

                    //find dummy parent
                    let dummyParent = intersects[0].object.parent;
                    while (dummyParent.userData.isDummy !== true && dummyParent.parent) {
                        dummyParent = dummyParent.parent;
                    }

                    onSelectObject(dummyParent);

                    this.cubeCorsor.position.copy(intersects[0].point);
                }

                bDrag = false;

            },
            onPointerDown: function (event) {
                // let intersects = m_rayCaster.intersectObjects(this.root_dummy.children);
                // if (intersects.length > 0) {
                //     // console.log(intersects[0]);
                //     onSelectObject(intersects[0].object);
                //     this.cubeCorsor.position.copy(intersects[0].point);
                // }

                bDrag = true;
            },
            onMouseMove: function (event) {

                // m_rayCaster.setFromCamera(new THREE.Vector2(mx, my), this.camera);
                // let intersects = m_rayCaster.intersectObjects(this.root_dummy.children);
                // if (intersects.length > 0) {
                //     this.cubeCorsor.position.copy(intersects[0].point);
                // }


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

                m_mousePointer.x = mx;
                m_mousePointer.y = -my;

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
            // onMouseDown: function (event) {

            //     bDrag = true;
            // },
            // onMouseUp: function (event) {

            //     // let mx = (event.offsetX / this.window_size.width) * 2 - 1;
            //     // let my = - (event.offsetY / this.window_size.height) * 2 + 1;
            //     // console.log(mx, my);

            //     bDrag = false;
            // },
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

