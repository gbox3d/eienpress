import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";

import * as THREE from 'three';
// import WEBGL from 'WebGL';
// import Stats from 'state';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

import Elvis from 'evlis';
import { TextureLoader, Vector3 } from 'three';

import ObjectMngSetup from './objMng.js';


export default async function ({
    container,
    window_size,
    envMapFileFormat, envMapFile,
    cameraPosition = new THREE.Vector3(0, 100, 200),
    cameraTarget = new THREE.Vector3(),
    cameraFov = 45,
    cameraNear = 1, cameraFar = 15000,
    isGrid = true,
    onSelectObject = null,
    onObjectEditChange = null,
    onPointerIntersectDown = null,
    Context = null,
    cameraControlMode = 'walk',
    basePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
}) {

    const host_url = Context.host_url;
    const _HDRILoader = envMapFileFormat === 'exr' ? new EXRLoader() : new RGBELoader();
    const grid_helper = new THREE.GridHelper(5000, 50, 0x00ff00, 0xff0000);

    const scope = await new Promise((resolve, reject) => {

        const elvis = new Elvis({
            camera: {
                fov: cameraFov,
                far: cameraFar,
                near: cameraNear,
                position: cameraPosition,
                lookat: cameraTarget
            },
            window_size: window_size,
            renderer: {
                type: 'webgl',
                container: container,
                clear: {
                    color: 0x000000,
                    alpha: 1
                }
            },
            setup: async function () {

                this.userData = {}

                //초기화 코드는 여기에서 코딩한다.
                const scope = this;
                this.pauseKeyInput = false;
                this.select_node = null;

                // scope.userData = {}
                scope.keyStates = {};
                this.cameraSpeed = 500;
                this.bEnableKeyInput = false;
                this.bSetupComplete = false;

                scope.intersectObjects = [];
                scope.prefabDic = {};

                ////////////////////////////////////////////////////////////////////////////////
                //engine start
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
                        // scope.scene.userData.envMapTexure = texture;
                    }



                    scope.scene.add(grid_helper);
                    if (!isGrid) {
                        grid_helper.visible = false;
                    }

                    //오빗컨트롤
                    //카메라의 현재 위치 기준으로 시작한다.
                    const orbitControl = new OrbitControls(this.camera, this.renderer.domElement);
                    orbitControl.target.set(0, 0, 0);
                    orbitControl.update();
                    this.orbitControl = orbitControl;

                    //트랜스폼 컨트롤러
                    this.trn_control = new TransformControls(this.camera, this.renderer.domElement);
                    this.trn_control.addEventListener('change', function () {
                        scope.updateAll();
                    });
                    this.trn_control.addEventListener('dragging-changed', function (event) {
                        orbitControl.enabled = !event.value;
                    });
                    this.trn_control.addEventListener('objectChange', (event) => {
                        onObjectEditChange?.call(this, this.select_node);
                    });

                    scope.scene.add(this.trn_control);

                    //dummy object setup
                    this.root_dummy = new THREE.Group();
                    this.root_dummy.name = 'root_dummy';
                    this.scene.add(this.root_dummy);

                    //cube cursor setup
                    {
                        const dir = new THREE.Vector3(0, -1, 0);
                        const length = 10;
                        //normalize the direction vector (convert to vector of length 1)
                        dir.normalize();

                        const _helper = new THREE.ArrowHelper(
                            dir,
                            new THREE.Vector3(0, 0, 0),
                            length,
                            0xff0000,
                            5,
                            5
                        );
                        _helper.name = 'helper';

                        // const geometry = new THREE.SphereGeometry(7, 16, 8);
                        // const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
                        // const cube = new THREE.Mesh(geometry, material);
                        // cube.name = 'cubeCursor';

                        // this.scene.add(_helper);
                        this.cubeCorsor = new THREE.Group();
                        this.cubeCorsor.name = 'cubeCursor';
                        this.cubeCorsor.add(_helper);
                        let _container = new THREE.Group();
                        _container.name = 'cubeCursorContainer';
                        this.cubeCorsor.add(_container);

                        this.cubeCorsor.visible = false;
                        this.scene.add(this.cubeCorsor);

                    }

                    //target display helper
                    // const orbitTargetHelper = new THREE.AxesHelper(10);
                    {
                        const dir = new THREE.Vector3(0, -1, 0);
                        const length = 5;
                        //normalize the direction vector (convert to vector of length 1)
                        dir.normalize();

                        const orbitTargetHelper = new THREE.ArrowHelper(
                            dir,
                            new THREE.Vector3(0, 0, 0),
                            length,
                            0xffff00,
                            2.5,
                            2.5
                        );

                        scope.scene.add(orbitTargetHelper);
                        orbitTargetHelper.position.copy(orbitControl.target.clone().sub(dir.clone().multiplyScalar(length)));

                        orbitControl.addEventListener('change', function () {
                            orbitTargetHelper.position.copy(orbitControl.target.clone().sub(dir.clone().multiplyScalar(length)));
                        });

                    }


                    //setup complete
                    this.startRender();
                    // onComplete(this);
                    console.log('setup complete');
                    scope.bSetupComplete = true;

                    resolve(this);

                    // return true;

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
                    // this.updateAll({
                    //     resize: {
                    //         width: window.innerWidth,
                    //         height: window.innerHeight
                    //     }
                    // });
                },
                onUpdate: function (event) {

                    // let angleSpeed = parseInt(angleSpeedSlider.value);
                    // this.cube.rotation.x += THREE.MathUtils.degToRad(angleSpeed) * event.deltaTick;
                    // this.cube.rotation.y += THREE.MathUtils.degToRad(angleSpeed) * event.deltaTick;

                    updateCamera(event.deltaTick);

                    // this.stats.update()
                    this.updateAll();
                },
                onMouseMove: function (event) {

                    if (this.bSetupComplete) {

                        let mx = (event.offsetX / this.window_size.width) * 2 - 1;
                        let my = - (event.offsetY / this.window_size.height) * 2 + 1;

                        let _rayCaster = this.trn_control.getRaycaster();

                        _rayCaster.setFromCamera(new THREE.Vector2(mx, my), this.camera);

                        // //레이캐스팅 충돌 검사
                        let intersects = _rayCaster.intersectObjects(this.root_dummy.children);
                        this.intersectObjects = intersects;

                        if (intersects.length > 0) {

                            let _cursorHelper = this.cubeCorsor.getObjectByName('helper');
                            let _faceDir = intersects[0].face.normal.clone()
                            
                            _faceDir.applyQuaternion(intersects[0].object.getWorldQuaternion(new THREE.Quaternion()));

                            let _dir = _faceDir.multiplyScalar(-1)
                            _cursorHelper.setDirection(_dir);
                            _cursorHelper.position.copy((_dir.clone().multiplyScalar(-10)));

                            this.cubeCorsor.position.copy(intersects[0].point);
                            this.cubeCorsor.visible = true;
                        }
                        else {

                            if (this.keyStates['AltLeft']) {
                                let _ray = _rayCaster.ray;
                                let _basePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

                                let _intersect = new THREE.Vector3();
                                _ray.intersectPlane(_basePlane, _intersect);

                                let _cursorHelper = this.cubeCorsor.getObjectByName('helper');
                                let _dir = new THREE.Vector3(0, -1, 0);

                                _cursorHelper.setDirection(_dir);
                                _cursorHelper.position.copy((_dir.clone().multiplyScalar(-10)));

                                this.cubeCorsor.position.copy(_intersect);

                                this.cubeCorsor.visible = true;
                            }
                            else {
                                this.cubeCorsor.visible = false;
                            }
                        }
                    }
                    // mousePos.innerHTML = `${_.round(mx, 2)}, ${_.round(my, 2)}`;
                },
                onPointerDown: function (event) {
                    // onMouseDown: function (event) {

                    console.log('onPointerDown');

                    if (this.orbitControl.enabled && this.bSetupComplete) { //오빗컨트롤이 활성화 상태일때만..
                        let mx = (event.offsetX / this.window_size.width) * 2 - 1;
                        let my = - (event.offsetY / this.window_size.height) * 2 + 1;
                        // console.log(mx, my);
                        // mousePos.innerHTML = `${_.round(mx, 2)}, ${_.round(my, 2)}`;

                        let _rayCaster = this.trn_control.getRaycaster();
                        _rayCaster.setFromCamera(new THREE.Vector2(mx, my), this.camera);

                        //transform controller collider check
                        if (!checkIntersecctTransformController()) return;
                        // console.log('checkIntersecctTransformController false');
                        // //레이캐스팅 충돌 검사
                        let intersects = _rayCaster.intersectObjects(this.root_dummy.children);
                        if (intersects.length > 0) {

                            const _nearIntersec = intersects[0];

                            onPointerIntersectDown?.call(this, {
                                type: 'intersect-object',
                                altkey: this.keyStates['AltLeft'] ? true : false,
                                intersect: _nearIntersec
                            });
                        }
                        else {

                            let _ray = _rayCaster.ray;
                            let _basePlane = basePlane;

                            let _intersect = new THREE.Vector3();
                            _ray.intersectPlane(_basePlane, _intersect);

                            onPointerIntersectDown?.call(this, {
                                altkey: this.keyStates['AltLeft'] ? true : false,
                                type: 'intersect-base-plane',
                                intersect: {
                                    diatance: scope.camera.position.distanceTo(_intersect),
                                    face: {
                                        normal: _basePlane.normal
                                    },
                                    point: _intersect
                                }
                            });
                        }

                    }
                },
                onMouseOver: function (event) {
                    // console.log('mouse over');
                    this.bEnableKeyInput = true;
                },
                onMouseLeave: function (event) {
                    // console.log('mouse leave');
                    this.bEnableKeyInput = false;
                },
                onKeyDown: function (event) {

                    if (this.bEnableKeyInput === true) {
                        let control = this.trn_control
                        console.log(event.keyCode, event.code);
                        this.keyStates[event.code] = true;

                        switch (event.keyCode) {
                            case 81: // Q
                                control.setSpace(this.trn_control.space == "local" ? "world" : "local");
                                break;
                            case 87: // W
                                control.setMode("translate");
                                break;
                            case 69: // E
                                control.setMode("rotate");
                                break;
                            case 82: // R
                                control.setMode("scale");
                                break;
                            case 27: //deselect
                                control.detach();
                                this.select_node = null;
                                break;
                        }

                    }

                },
                onKeyUp: function (event) {
                    if (this.bEnableKeyInput === true) {
                        this.keyStates[event.code] = false;
                    }
                }

            }
        });
    });

    scope.defaultMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.5,
        roughness: 0.5,
    });

    scope.defaultMaterial_WF = new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        wireframe: true
    });

    //확장함수
    const setEnableKeyInput = function (bEnable) {
        scope.bEnableKeyInput = bEnable;
    }

    //트랜스폼 컨트롤러와 충돌체크 함수
    const checkIntersecctTransformController = function (_rayCaster) {

        if (scope.trn_control.dragging || scope.trn_control.axis) return false;

        return true;
    }

    const toGltf = function ({ title, description, entity, binary = true }) {
        // console.log('save scene');
        scope.root_dummy.userData.title = title
        scope.root_dummy.userData.description = description

        return new Promise((resolve, reject) => {
            const exporter = new GLTFExporter();
            exporter.parse(entity, function (result) {
                resolve(result);
            },
                // called when there is an error in the generation
                function (error) {
                    console.log('An error happened');
                },
                {
                    binary: binary
                }
            );
        });
    }


    const updateCamera = function (delta) {
        let _forward = new THREE.Vector3();
        let _side = new THREE.Vector3();

        _forward.subVectors(scope.orbitControl.target, scope.camera.position);

        if (cameraControlMode === 'fly') {
        }
        else if (cameraControlMode === 'walk') {
            _forward.y = 0;
        }

        _forward.normalize();
        _side.crossVectors(_forward, scope.camera.up);
        _side.normalize();

        _forward = _forward.multiplyScalar(scope.cameraSpeed * delta);
        _side = _side.multiplyScalar(scope.cameraSpeed * delta);

        let bChanged = false;
        if (scope.keyStates['ArrowUp']) {
            scope.camera.position.add(_forward);
            scope.orbitControl.target.add(_forward);
            scope.camera.target.copy(scope.orbitControl.target);
            bChanged = true;
        }
        if (scope.keyStates['ArrowDown']) {
            scope.camera.position.sub(_forward);
            scope.orbitControl.target.sub(_forward);
            scope.camera.target.copy(scope.orbitControl.target);
            bChanged = true;
        }
        if (scope.keyStates['ArrowLeft']) {
            scope.camera.position.sub(_side);
            scope.orbitControl.target.sub(_side);
            scope.camera.target.copy(scope.orbitControl.target);
            bChanged = true;

        }
        if (scope.keyStates['ArrowRight']) {
            scope.camera.position.add(_side);
            scope.orbitControl.target.add(_side);
            scope.camera.target.copy(scope.orbitControl.target);
            bChanged = true;
        }

        if (bChanged) {
            scope.orbitControl.dispatchEvent({
                type: 'change'
            });
        }
    }
    
    const objMng = await ObjectMngSetup({
        scope: scope
    });

    function setSelectEntity(entity) {

        if (entity) {
            // scope.orbitControl.target.copy(entity.position);
            // scope.camera.target.copy(entity.position);
            scope.trn_control.attach(entity);
            scope.select_node = entity;
        }
    }
    function getSelectEntity() {
        return scope.select_node
    }

    function copyEntityToCursor(entity) {
        let _entity = entity.clone();
        _entity.position.set(0, 0, 0);

        if (_entity) {
            removeCursoredEntity();
            const cubeCursorContainer = scope.cubeCorsor.getObjectByName('cubeCursorContainer')
            cubeCursorContainer.add(_entity);
        }

    }

    function pasteEntityToCursor({ position, parent, isClone = false }) {
        const cubeCursorContainer = scope.cubeCorsor.getObjectByName('cubeCursorContainer')
        let _entity = cubeCursorContainer.children[0];

        if (_entity) {

            if (isClone) {
                _entity = _entity.clone();
            }
            else {
                cubeCursorContainer.remove(_entity);
            }

            _entity.position.copy(position);
            // scope.root_dummy.attach(_entity);
            if (parent) {
                parent.attach(_entity);

            }
            else {
                scope.root_dummy.attach(_entity);
            }
            // setSelectEntity(_entity)
        }

        return _entity
    }

    function getCursoredEntity() {
        const cubeCursorContainer = scope.cubeCorsor.getObjectByName('cubeCursorContainer')
        return cubeCursorContainer.children[0]
    }

    function removeCursoredEntity() {
        const cubeCursorContainer = scope.cubeCorsor.getObjectByName('cubeCursorContainer')

        while (cubeCursorContainer.children.length > 0) {
            cubeCursorContainer.remove(cubeCursorContainer.children[0])
        }
        // let _entity = cubeCursorContainer.children[0];
        // if (_entity) {
        //     cubeCursorContainer.remove(_entity);
        // }
    }


    return {
        elvis: scope,
        objMng: objMng,
        setEnableKeyInput,
        toGltf,
        showEnvMap: (bShow) => {

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
        toggleEnvMap: () => {
            if (scope.scene.background) {
                scope.scene.background = null;
            }
            else {
                scope.scene.background = scope.scene.environment;
            }
        },
        toggleGrid: () => {
            grid_helper.visible = !grid_helper.visible;
        },
        resetCamera: function () {
            // scope.camera.position.set(0, 100, 200);
            // scope.camera.lookAt(0, 0, 0);
            scope.orbitControl.reset();
        },
        getCameraTarget: function () {
            return scope.orbitControl.target;
        },
        setSelectEntity,
        getSelectEntity,

        copyEntityToCursor,
        pasteEntityToCursor,
        getCursoredEntity,
        getEntityByuuid(uuid) {
            return scope.root_dummy.getObjectByProperty('uuid', uuid)
        },
        removeCursoredEntity,

    }

}

