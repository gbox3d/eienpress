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

                        console.log('checkIntersecctTransformController false');
                        // //레이캐스팅 충돌 검사
                        let intersects = _rayCaster.intersectObjects(this.root_dummy.children);
                        if (intersects.length > 0) {

                            const _nearIntersec = intersects[0];

                            onPointerIntersectDown?.call(this, {
                                type: 'intersect-object',
                                altkey: this.keyStates['AltLeft'] ? true : false,
                                intersect: _nearIntersec
                            });
                            // console.log(intersects[0])
                            // if (getCursoredEntity().children.length > 0) {

                            // }

                            // let _container = this.cubeCorsor.getObjectByName('cubeCursorContainer');

                            // if (this.cubeCorsor.visible && _container.children.length > 0) { //오브잭트 내려놓기 
                            //     // let _target = this.cubeCorsor.children[0];
                            //     // switch (_target.name) {
                            //     //     case 'triger':
                            //     //         _target.position.copy(_nearIntersec.point);
                            //     //         this.space_dummy.add(_target);
                            //     //     default:
                            //     //         // this.dropObject(this.space_dummy);
                            //     //         break;
                            //     // }

                            // }
                            // else if (this.keyStates['ShiftLeft']) {
                            //     //현제 선택된 오브잭트 놓기 
                            //     this?.select_node?.position.copy(_nearIntersec.point);
                            // }
                            // else {
                            //     // 커서에 아무것도 없으면 오브잭트 선택 
                            //     // let node = intersects[0].object.parent;
                            //     // const _dummy = searchParentDummy(intersects[0].object);

                            //     const _dummy = intersects[0].object

                            //     if (this.select_node !== _dummy) {

                            //         let objType = _dummy.userData.type ? _dummy.userData.type : 4; //정의 되어있지않으면 전시물로 설정

                            //         console.log(objType)

                            //         switch (objType) {
                            //             case 0:
                            //             case 1:
                            //             case 3: //trigger
                            //                 {
                            //                     this.trn_control.attach(_dummy);
                            //                     this.select_node = _dummy;
                            //                     onSelectObject?.call(this, _dummy)
                            //                     // console.log(node.parent.userData)
                            //                 }
                            //                 break;
                            //             case 2: //건물
                            //                 {
                            //                     //건물은 선택된 오브잭트가 없을 경우 선택가능
                            //                     if (!this.select_node) {
                            //                         this.select_node = _dummy;
                            //                         this.trn_control.detach();
                            //                         onSelectObject?.call(this, _dummy)
                            //                     }
                            //                 }
                            //                 break;
                            //             case 4: // 전시물 
                            //                 {
                            //                     console.log(scope.trn_control.dragging)

                            //                     console.log(_dummy.userData)
                            //                     this.trn_control.attach(_dummy);
                            //                     this.select_node = _dummy;
                            //                     onSelectObject?.call(this, _dummy)

                            //                 }
                            //                 break;
                            //             default:
                            //                 break;
                            //         }

                            //     }

                            // }
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
                            // case 187:
                            // case 107: // +,=,num+
                            //     control.setSize(this.trn_control.size + 0.1);
                            //     break;
                            // case 189:
                            // case 10: // -,_,num-
                            //     control.setSize(Math.max(this.trn_control.size - 0.1, 0.1));
                            //     break;
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

    ////////////////////////////////////////////////////////////////////////////////
    //object 
    async function _loadObject({
        modelFile,
        textureFile,
        onProgress,
        diffuseColor,
        envMap
    }) {

        try {
            const textureLoader = new TextureLoader();
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
                            name: `Load remote model ${modelFile.substring(0, 6)}`,
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

    const searchParentDummy = function (obj) {
        let parent = obj.parent;
        while (parent) {
            if (parent.userData.isDummy) {
                return parent;
            }
            parent = parent.parent;
        }
        return null;
    }

    const loadObject = async function ({
        _id,
        onProgress,
        diffuseColor = new THREE.Color(0xffffff)
    }) {

        let result = await (await fetch(`${host_url}/com/object/detail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'authorization': localStorage.getItem('jwt_token')
            },
            body: makeFormBody({
                id: _id
            })
        })).json();

        console.log(result);

        if (result.r === 'ok') {
            const modelFile = result.data.modelFile;
            const textureFile = result.data.textureFile;
            const type = parseInt(result.data.type);

            let object = await _loadObject({
                modelFile,
                textureFile,
                diffuseColor,
                onProgress,
                // envMap: type === 0 ? scope.hdr_envMap : undefined
                envMap: scope.hdr_envMap //일단 다적용 
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

    const makeBoxMeshDummy = function () {

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
        // scope.prefabDic['BuiltInObject.BoxMesh'] = _mesh;
        // console.log(`add prefeb : BuiltInObject.BoxMesh`);
        // }
        _root.add(_mesh);
        return _root
    }

    const cloneSelectedObject = function () {
        // console.log(object)
        const _selObj = scope.select_node
        if (_selObj) {
            scope.setCursor(_.find(scope.prefabDic, { userData: { fileId: _selObj.userData.fileId } }))
        }
    }



    const updateUserData = function ({
        objId,
        userData
    }) {
        const _obj = scope.root_dummy.getObjectById(objId)
        if (_obj) {
            _obj.userData = userData
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    //space
    const initSpace = function ({ title, description }) {
        scope.space_dummy = new THREE.Group();
        scope.space_dummy.name = 'space_dummy';
        scope.space_dummy.userData = {
            type: 'space_dummy',
            title: title,
            description: description
        }
        scope.root_dummy.add(scope.space_dummy);
    }

    const clearScene = function () {
        // scope.root_dummy.remove(scope.root_dummy.children[0]);

        while (scope.root_dummy.children.length > 0) {
            scope.root_dummy.remove(scope.root_dummy.children[0]);
        }
        scope.prefabDic = [];
    }

    const toJSON = function () {

        return scope.root_dummy.toJSON()
    }


    const fromJsonByUrl = async function ({ url, onProgress }) {
        console.log('load scene');

        const loader = new THREE.ObjectLoader();

        const object = await new Promise((resolve, reject) => {
            loader.load(url,
                (object) => resolve(object),
                (xhr) => { //progress
                    // console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
                    onProgress ? onProgress({
                        name: `scene loading size ${_.round(xhr.total / 1000000, 1)} mb`,
                        progress: _.round((xhr.loaded / xhr.total * 100), 1)
                    }) : null;
                },
                (err) => {
                    reject(err);
                }
            );
        })

        // const space_dummy = object.getObjectByName('space_dummy')
        // space_dummy.traverse(function (child) {
        //     if (child.userData.isDummy) {

        //         const fileId = child.userData.fileId;

        //         if (fileId === 'BuiltInObject.BoxMesh') {
        //             child.add(scope.createBoxMesh())
        //             // let _mesh = _.find(scope.prefabList, { userData: { fileId } })
        //             // if (!_mesh) {
        //             //     const _mesh = scope.createBoxMesh()
        //             //     object.add(_mesh);
        //             //     scope.prefabList.push(_mesh)
        //             // }
        //         }
        //     }
        // });

        return object;
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

    const fromGltf = function (url) {
        // console.log('load scene');
        // const loader = new GLTFLoader();

        const loader = new GLTFLoader();
        // loader.load(URL.createObjectURL(glb), (gltf) => {
        loader.load(url, (gltf) => {
            console.log(gltf);
            scope.root_dummy.add(gltf.scene);
        },
            // called while loading is progressing
            function (xhr) {

                console.log((xhr.loaded / xhr.total * 100) + '% loaded');

            },
            // called when loading has errors
            function (error) {

                console.log('An error happened');

            }
        );


    }

    const removeAllChild = function () {
        scope.root_dummy.children.forEach(child => {
            scope.root_dummy.remove(child);
        });
    }

    const setCursor = function (object) {
        // scope.prefabDic[object.uuid] = object;
        // console.log(object)
        if (object)
            scope.cubeCorsor.add(object);
    }

    const makeTrigerNode = function (data) {

        const trigerRoot = new THREE.Group();
        // trigerRoot.rotation.order = 'YXZ';
        trigerRoot.userData = data;
        trigerRoot.name = 'triger';
        // trigerRoot.type = 3;
        const _mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(60, 30, 60), new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            wireframe: true
        }));
        _mesh.position.set(0, 15, 0);
        trigerRoot.add(_mesh);
        return trigerRoot;
    }

    const dropObject = function (parentObject) {

        let object = scope.cubeCorsor.children[0]

        if (object !== undefined) {
            let _clone = object.clone()
            _clone.position.copy(object.parent.position)
            parentObject.add(_clone);

            scope.cubeCorsor.remove(object);
            return _clone;
        }
    }

    const addSpace = function (object) {
        if (scope.space_dummy) {
            scope.space_dummy.add(object);
            return true
        }
        return false
    }

    //clear space dummy and add object
    //트리에서 더미들을 검색하고, 더미에 정의된 오브잭트들을 만들어 자식노드로 다시 붙여서 완성시킨다.
    const setupSpaceDummy = async function (space_dummy, onProgress) {

        // 오브잭트 상세로딩 & 프리펩등록 
        for (let i = 0; i < space_dummy.children.length; i++) {
            let child = space_dummy.children[i]
            // object.traverse(async function (child) {
            // console.log(child)
            if (child.userData.isDummy) {
                const fileId = child.userData.fileId;
                console.log(fileId)
                if (fileId === 'BuiltInObject.BoxMesh') {
                    // child.add(scope.createBoxMesh())
                    let _obj = scope.prefabDic[fileId]
                    if (!_obj) {
                        _obj = scope.makeBoxMeshDummy()
                        scope.prefabDic[fileId] = _obj
                    }
                    child.add(_obj.children[0].clone());
                }
                else if (fileId === 'TriggerObject.StartPoint') {
                    let _obj = scope.prefabDic[fileId]
                    if (!_obj) {
                        _obj = scope.makeTrigerNode(child.userData)
                        scope.prefabDic[fileId] = _obj
                    }
                    child.add(_obj.children[0].clone());
                }
                else if (fileId === 'TriggerObject.Gate') {
                    let _obj = scope.prefabDic[fileId]
                    if (!_obj) {
                        _obj = scope.makeTrigerNode(child.userData)
                        scope.prefabDic[fileId] = _obj
                    }
                    child.add(_obj.children[0].clone());
                }
                else {
                    //load from object id
                    let _obj = scope.prefabDic[fileId]
                    if (!_obj) {
                        _obj = await scope.loadObject({
                            _id: fileId,
                            onProgress: onProgress,
                            diffuseColor: child.userData.diffuseColor
                        })
                        scope.prefabDic[fileId] = _obj
                    }
                    //더미는 자식노드로 붙여서 완성시킨다.
                    child.add(_obj.children[0].clone())
                }
            }
        }

        //space dummy clear
        scope.root_dummy.remove(scope.space_dummy)
        //오브잭트 올리기
        scope.root_dummy.add(space_dummy);
        scope.space_dummy = space_dummy;
        console.log('space dummy setup done')

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
    const getCameraLookAt = function () {
        return scope.camera.target.clone()
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

