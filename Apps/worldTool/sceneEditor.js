import * as THREE from 'three';
// import WEBGL from 'WebGL';
// import Stats from 'state';
import { OrbitControls } from 'OrbitControls';
import { TransformControls } from 'TransformControls';
import { FBXLoader } from 'fbxLoader';
import { GLTFLoader } from 'GLTFLoader';

import Elvis from 'evlis';


export default function setup(option) {

    const Context = option.Context;
    // let select_node = null;
    let onSelectObject = option.onSelectObject;
    let onObjectEditChange = option.onObjectEditChange;


    return new Elvis({
        camera: {
            fov: 45,
            far: 5000,
            near: 1,
            position: new THREE.Vector3(0, 50, 100),
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

            /////////////////////
            //확장함수 정의
            function addObject(geometry, material, dist) {

                let _direction = new THREE.Vector3();
                this.camera.getWorldDirection(_direction);


                console.log(_direction);

                let pos = this.camera.position.clone().add(_direction.multiplyScalar(dist));

                // let geometry = this.geometryList[geometry_name];
                // let material = this.materialList[material_name];

                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.copy(pos);
                // mesh.rotation.copy(rotation);
                // mesh.scale.copy(scale);
                this.root_dummy.add(mesh);
                return mesh;
            }

            function addObjectByAspect(geometry, material, dist) {

                let _direction = new THREE.Vector3();
                this.camera.getWorldDirection(_direction);

                let aspect = material.userData.aspect ? material.userData.aspect : 1;

                let pos = this.camera.position.clone().add(_direction.multiplyScalar(dist));
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.copy(pos);
                mesh.scale.set(aspect, 1, 1);
                this.root_dummy.add(mesh);
                return mesh;
            }
            async function addFbxGeometry(filepath, scale) {

                let _path = filepath.split('/').slice(0, -1).join('/')
                let _file = filepath.split('/').slice(-1).join('/')

                // let _path = '/home/ubiqos/work/repository/test2'
                // let _file = 'Kitamuki1.jpg'
                let resp = await (fetch(`/api/v2/webdisk/readFile`, {
                    method: 'POST',
                    body: `${_path}\n${_file}`,
                    headers: {
                        'Content-Type': 'text/plain',
                        'authorization': localStorage.getItem('jwt_token')
                    }
                }))

                if (resp.status === 200) {

                    let blob = await resp.blob();
                    let _url = URL.createObjectURL(blob);

                    const loader = new FBXLoader();
                    // console.log(loader);

                    let object = await new Promise((resolve, reject) => {
                        loader.load(_url,
                            (object) => resolve(object),
                            (xhr) => { //progress
                                console.log(xhr)
                            },
                            (err) => {
                                reject(err);
                            }
                        );
                    });

                    object.traverse(function (child) {
                        // console.log(child)
                        if (child.isMesh) {
                            console.log(child)
                            // child.geometry.computeVertexNormals();
                            child.geometry.computeBoundingBox();
                            child.geometry.computeBoundingSphere();

                            child.geometry.scale(scale, scale, scale);

                            scope.geometryList[child.geometry.uuid] = child.geometry;
                            // child.material.map = texture;
                            // child.castShadow = true;
                            // child.receiveShadow = true;
                        }

                    });
                    Context.geometryList.updateGeometryList();

                }
            }
            async function addFbxObject(filepath, scaleScalar) {
                let _path = filepath.split('/').slice(0, -1).join('/')
                let _file = filepath.split('/').slice(-1).join('/')

                console.log(_path)
                console.log(_file)

                // let _path = '/home/ubiqos/work/repository/test2'
                // let _file = 'Kitamuki1.jpg'
                let resp = await (fetch(`/api/v2/webdisk/readFile`, {
                    method: 'POST',
                    body: `${_path}\n${_file}`,
                    headers: {
                        'Content-Type': 'text/plain',
                        'authorization': localStorage.getItem('jwt_token')
                    }
                }))

                // let sceneObj = await resp.json();

                if (resp.status === 200) {

                    let blob = await resp.blob();
                    let _url = URL.createObjectURL(blob);

                    const loader = new FBXLoader();
                    // console.log(loader);

                    try {
                        let object = await new Promise((resolve, reject) => {
                            loader.load(_url, (object) => resolve(object),
                                (xhr) => {
                                    //progress
                                    console.log(xhr)
                                },
                                (err) => {
                                    reject(err);
                                    // console.log(e)
                                });
                        });
                        object.traverse(function (child) {
                            // console.log(child)
                            if (child.isMesh) {
                                child.geometry.scale(scaleScalar, scaleScalar, scaleScalar);
                                child.geometry.computeBoundingBox();
                                child.geometry.computeBoundingSphere();
                                // child.geometry.computeVertexNormals();
                                // child.geometry.computeTangents();

                                scope.geometryList[child.geometry.uuid] = child.geometry;
                                scope.materialList[child.material.uuid] = child.material;
                                // child.material.map = texture;
                                // child.castShadow = true;
                                // child.receiveShadow = true;
                            }
                        });

                        scope.root_dummy.add(object);
                        return object;

                    }
                    catch (err) {
                        console.log(err)

                    }
                }

            }

            async function addGltfObject(filepath, scaleScalar) {
                let object = await new Promise((resolve, reject) => {

                    new GLTFLoader().load(filepath, function (gltf) {

                        // gltf.scene.traverse(function (child) {
                        //     console.log(child);

                        //     object.traverse(function (child) {
                        //         // console.log(child)

                        //     });
                        // });
                        return resolve(gltf.scene);
                    });
                });

                object.traverse(function (child) {
                    if (child.isMesh) {
                        child.geometry.scale(scaleScalar, scaleScalar, scaleScalar);
                        child.geometry.computeBoundingBox();
                        child.geometry.computeBoundingSphere();
                        // child.geometry.computeVertexNormals();
                        // child.geometry.computeTangents();

                        scope.geometryList[child.geometry.uuid] = child.geometry;
                        scope.materialList[child.material.uuid] = child.material;
                    }
                });

                object.children[0].scale.multiplyScalar(scaleScalar)
                scope.root_dummy.add(object.children[0]);
                return object
            }

            const textureLoader = new THREE.TextureLoader();
            async function loadTextureFromWebDisk(filepath) {
                let _path = filepath.split('/').slice(0, -1).join('/')
                let _file = filepath.split('/').slice(-1).join('/')
                let texture = null

                let resp = await (fetch(`/api/v2/webdisk/readFile`, {
                    method: 'POST',
                    body: `${_path}\n${_file}`,
                    headers: {
                        'Content-Type': 'text/plain',
                        'authorization': localStorage.getItem('jwt_token')
                    }
                }))

                if (resp.status == 200) {
                    let blob = await resp.blob();
                    texture = await new Promise((resolve, reject) => {
                        let imgUrl = URL.createObjectURL(blob); //url 객체로 변환
                        // let texture = new THREE.Texture(blob);
                        textureLoader.load(imgUrl, function (texture) {
                            resolve(texture);
                        });
                    })
                }
                // console.log(texture);
                return texture;
            }


            function getObject(uuid) {
                return this.root_dummy.getObjectByProperty('uuid', uuid);
            }
            function getSelectObject() {
                return scope.select_node;
            }

            function setSelectObject(uuid) {
                let _node = scope.root_dummy.getObjectByProperty('uuid', uuid);

                console.log('select node', _node)

                if (scope.dirLightHelper) {
                    scope.scene.remove(scope.dirLightHelper);
                    scope.dirLightHelper = null
                }

                if (_node) {

                    switch (_node.type) {
                        case 'Mesh':
                        case 'Group':
                        case 'SkinnedMesh':
                            break;
                        case 'DirectionalLight':
                            {
                                // this.dirLightHelper = new THREE.DirectionalLightHelper(_node, 10);
                                scope.dirLightHelper = new THREE.CameraHelper(_node.shadow.camera);
                                scope.scene.add(scope.dirLightHelper)
                            }
                            break;
                    }
                    this.trn_control.attach(_node);
                    scope.select_node = _node;
                    onSelectObject?.call(this, _node);
                    return scope.select_node;
                }
            }

            function delObject(obj) {

                //detach trnasform control
                scope.trn_control.detach(obj);

                //remove from scene
                scope.root_dummy.remove(obj);

            }

            function cloneObject() {
                let _node = scope.select_node;
                if (_node) {
                    let _clone = _node.clone();
                    scope.root_dummy.add(_clone);
                    scope.trn_control.attach(_clone);
                    onSelectObject?.call(this, _clone);
                }
            }

            function focusObject(obj) {

                obj = obj ? obj : scope.select_node;

                console.log(obj);

                if (obj) {
                    // console.log(this.select_node.position)
                    this.orbitControl.target.copy(obj.position);
                    this.orbitControl.update();
                }
                else {
                    this.orbitControl.target.set(0, 0, 0); //원점으로 이동
                    this.orbitControl.update();

                }

            }

            // scene io
            async function saveScene(filepath) {
                console.log('save scene');
                let data = this.root_dummy.toJSON()
                let _path = filepath.split('/').slice(0, -1).join('/')
                let _file = filepath.split('/').slice(-1).join('/')

                return await (await (fetch(`/api/v2/webdisk/writeTextFile`, {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        'Content-Type': 'text/plain',
                        'write-name': _file,
                        'write-directory': _path,
                        'authorization': localStorage.getItem('jwt_token')
                    }
                }))).json();
                // console.log(_res)
                // return _res;
            }

            async function loadScene(filepath) {
                console.log('load scene');

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

                object.traverse(function (child) {
                    console.log(child)
                    if (child.isMesh) {
                        scope.geometryList[child.geometry.uuid] = child.geometry;
                        scope.materialList[child.material.uuid] = child.material;
                    }
                });

                // console.log(object);
                this.scene.remove(this.root_dummy);
                this.root_dummy = object;
                this.scene.add(this.root_dummy);

                // scene.add(object);

            }

            //matrial 관리 
            async function addTextureBasicMatrial(filepath) {
                let _path = filepath.split('/').slice(0, -1).join('/')
                let _file = filepath.split('/').slice(-1).join('/')

                // let _path = '/home/ubiqos/work/repository/test2'
                // let _file = 'Kitamuki1.jpg'
                let resp = await (fetch(`/api/v2/webdisk/readFile`, {
                    method: 'POST',
                    body: `${_path}\n${_file}`,
                    headers: {
                        'Content-Type': 'text/plain',
                        'authorization': localStorage.getItem('jwt_token')
                    }
                }))

                const textureLoader = new THREE.TextureLoader();

                let blob = await resp.blob();

                // console.log(resp);

                if (resp.status == 200) {
                    let material = await new Promise((resolve, reject) => {

                        let imgUrl = URL.createObjectURL(blob); //url 객체로 변환
                        // let texture = new THREE.Texture(blob);
                        textureLoader.load(imgUrl, function (texture) {
                            texture.needsUpdate = true;
                            let material = new THREE.MeshBasicMaterial({ map: texture, color: 0xffffff, name: _file });
                            // scope.materialList['Kitamuki1.jpg'] = material;
                            material.userData.path = `${_path}`;
                            material.userData.file = `${_file}`;
                            material.userData.type = 'Basic.Tex';
                            material.userData.aspect = texture.image.width / texture.image.height;

                            resolve(material);
                        });
                    })
                    this.materialList[material.uuid] = material;
                    return material;
                }
            }
            async function setMaterial_Map(material_id, filepath) {
                let _path = filepath.split('/').slice(0, -1).join('/')
                let _file = filepath.split('/').slice(-1).join('/')
                let resp = await (fetch(`/api/v2/webdisk/readFile`, {
                    method: 'POST',
                    body: `${_path}\n${_file}`,
                    headers: {
                        'Content-Type': 'text/plain',
                        'authorization': localStorage.getItem('jwt_token')
                    }
                }))
                // const textureLoader = new THREE.TextureLoader();

                if (resp.status == 200) {
                    let blob = await resp.blob();
                    let texture = await new Promise((resolve, reject) => {
                        let imgUrl = URL.createObjectURL(blob); //url 객체로 변환
                        // let texture = new THREE.Texture(blob);
                        textureLoader.load(imgUrl, function (texture) {
                            // texture.needsUpdate = true;
                            // let material = new THREE.MeshBasicMaterial({ map: texture, color: 0xffffff, name: _file });
                            // scope.materialList['Kitamuki1.jpg'] = material;
                            resolve(texture);
                        });
                    })
                    let material = this.materialList[material_id];
                    material.map = texture;
                    material.needsUpdate = true; //변경사항 반영을 위해서 반드시 필요함
                    material.userData.path = `${_path}`;
                    material.userData.file = `${_file}`;
                    material.userData.aspect = texture.image.width / texture.image.height;

                }
            }
            async function setMaterial_NormalMap(material_id, filepath) {
                let _path = filepath.split('/').slice(0, -1).join('/')
                let _file = filepath.split('/').slice(-1).join('/')
                let resp = await (fetch(`/api/v2/webdisk/readFile`, {
                    method: 'POST',
                    body: `${_path}\n${_file}`,
                    headers: {
                        'Content-Type': 'text/plain',
                        'authorization': localStorage.getItem('jwt_token')
                    }
                }))
                // const textureLoader = new THREE.TextureLoader();

                if (resp.status == 200) {
                    let blob = await resp.blob();
                    let texture = await new Promise((resolve, reject) => {
                        let imgUrl = URL.createObjectURL(blob); //url 객체로 변환
                        // let texture = new THREE.Texture(blob);
                        textureLoader.load(imgUrl, function (texture) {
                            // texture.needsUpdate = true;
                            // let material = new THREE.MeshBasicMaterial({ map: texture, color: 0xffffff, name: _file });
                            // scope.materialList['Kitamuki1.jpg'] = material;
                            resolve(texture);
                        });
                    })
                    let material = this.materialList[material_id];
                    material.normalMap = texture;
                    material.needsUpdate = true; //변경사항 반영을 위해서 반드시 필요함
                    // material.userData.path = `${_path}`;
                    material.userData.normalMap = {
                        path: _path,
                        file: _file,
                        aspect: texture.image.width / texture.image.height
                    }
                    // material.userData.aspect = texture.image.width / texture.image.height;

                }
            }

            function addAmbientLight(color) {
                let light = new THREE.AmbientLight(color);
                this.root_dummy.add(light);
                return light;
            }

            function addDirectionalLight(color) {
                let light = new THREE.DirectionalLight(color);
                light.castShadow = true;
                //Set up shadow properties for the light
                // light.shadow.mapSize.width = 512; // default
                // light.shadow.mapSize.height = 512; // default
                const d = 10;
                light.shadow.camera.left = -d;
                light.shadow.camera.right = d;
                light.shadow.camera.top = d;
                light.shadow.camera.bottom = -d;


                light.shadow.camera.near = 0.5; // default
                light.shadow.camera.far = 500; // default

                // light.shadow.mapSize.width = 2048;
                // light.shadow.mapSize.height = 2048;
                this.root_dummy.add(light);

                // const helper = new THREE.CameraHelper(light.shadow.camera);
                // this.scene.add(helper);
                // light.userData.cameraHelper = helper;

                return light;
            }

            function addHemiLight(skyColor, groundColor) {
                // let light = new THREE.HemisphereLight(color);
                const light = new THREE.HemisphereLight(skyColor, groundColor, 1);
                // scene.add( light );
                this.root_dummy.add(light);
                return light;
            }



            this.addObject = addObject;
            this.addObjectByAspect = addObjectByAspect;
            this.delObject = delObject;
            this.cloneObject = cloneObject;


            this.saveScene = saveScene;
            this.loadScene = loadScene;
            this.focusObject = focusObject;
            this.addTextureBasicMatrial = addTextureBasicMatrial;

            this.setMaterial_Map = setMaterial_Map;
            this.setMaterial_NormalMap = setMaterial_NormalMap;

            this.loadTextureFromWebDisk = loadTextureFromWebDisk;

            this.addFbxGeometry = addFbxGeometry;
            this.addFbxObject = addFbxObject;
            this.addGltfObject = addGltfObject;

            this.addAmbientLight = addAmbientLight;
            this.addDirectionalLight = addDirectionalLight;
            this.addHemiLight = addHemiLight;

            this.setSelectObject = setSelectObject;
            this.getSelectObject = getSelectObject;
            this.getObject = getObject;


            //////////

            try {

                //shadow map setup
                scope.renderer.shadowMap.enabled = true;
                scope.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

                //그리드헬퍼
                const helper = new THREE.GridHelper(5000, 50, 0x00ff00, 0xff0000);
                //helper.setColors(0x00ff00,0xff0000);
                scope.scene.add(helper);

                //오빗컨트롤
                //카메라의 현재 위치 기준으로 시작한다.
                var orbitControl = new OrbitControls(this.camera, this.renderer.domElement);
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
                    // console.log(event);
                    onObjectEditChange?.call(this, this.select_node);
                });

                this.scene.add(this.trn_control);

                //dummy object setup
                this.root_dummy = new THREE.Group();
                this.scene.add(this.root_dummy);

                this.geometryList = {};
                //default geometry
                {
                    let planeGeometry = new THREE.PlaneGeometry(10, 10, 1, 1)
                    planeGeometry.name = 'PlaneGeometry';
                    planeGeometry.computeBoundingBox();
                    planeGeometry.computeBoundingSphere();
                    planeGeometry.computeVertexNormals();
                    planeGeometry.computeTangents();
                    this.geometryList[planeGeometry.uuid] = planeGeometry;

                    let boxGeometry = new THREE.BoxGeometry(10, 10, 10);
                    boxGeometry.name = 'BoxGeometry';
                    boxGeometry.computeBoundingBox();
                    boxGeometry.computeBoundingSphere();
                    boxGeometry.computeVertexNormals();
                    boxGeometry.computeTangents();
                    this.geometryList[boxGeometry.uuid] = boxGeometry;

                }

                //material
                this.materialList = {}

                {
                    let _material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, name: "wireFrame" });
                    this, this.materialList[`${_material.uuid}`] = _material;

                    let default_pong_material = new THREE.MeshPhongMaterial({ color: 0xffffff, name: "pong" });
                    this, this.materialList[`${default_pong_material.uuid}`] = default_pong_material;
                }

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


                // this.stats.update()
                this.updateAll();
            },
            onMouseMove: function (event) {
                let mx = (event.offsetX / this.window_size.width) * 2 - 1;
                let my = - (event.offsetY / this.window_size.height) * 2 + 1;
                // mousePos.innerHTML = `${_.round(mx, 2)}, ${_.round(my, 2)}`;
            },
            onMouseDown: function (event) {

                if (this.orbitControl.enabled) { //오빗컨트롤이 활성화 상태일때만..
                    let mx = (event.offsetX / this.window_size.width) * 2 - 1;
                    let my = - (event.offsetY / this.window_size.height) * 2 + 1;
                    // mousePos.innerHTML = `${_.round(mx, 2)}, ${_.round(my, 2)}`;

                    let _rayCaster = this.trn_control.getRaycaster();
                    _rayCaster.setFromCamera(new THREE.Vector2(mx, my), this.camera);

                    //레이캐스팅 충돌 검사
                    let intersects = _rayCaster.intersectObjects(this.root_dummy.children);
                    if (intersects.length > 0) {
                        let node = intersects[0].object;

                        if (this.select_node !== node) {

                            this.trn_control.attach(node);
                            this.select_node = node;
                            onSelectObject?.call(this, node);
                        }
                    }
                    else {
                        //없으면 선택 해제
                        // if (this.select_node &&
                        //     !this.trn_control.axis //기즈모 호버링 여부 판단 
                        // ) {
                        //     this.trn_control.detach();
                        //     this.select_node = null;
                        // }
                    }

                }


            },
            onKeyDown: function (event) {
                if (this.pauseKeyInput) {
                    return;
                }
                let control = this.trn_control
                switch (event.keyCode) {
                    case 16: // Shift
                        // snap control
                        control.setTranslationSnap(1);
                        control.setRotationSnap(THREE.MathUtils.degToRad(15));
                        control.setScaleSnap(0.25);
                        break;
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
                    case 187:
                    case 107: // +,=,num+
                        control.setSize(this.trn_control.size + 0.1);
                        break;
                    case 189:
                    case 10: // -,_,num-
                        control.setSize(Math.max(this.trn_control.size - 0.1, 0.1));
                        break;
                    case 27: //deselect
                        control.detach();
                        this.select_node = null;
                        break;
                }
            },
            onKeyUp: function (event) {
                if (this.pauseKeyInput) {
                    return;
                }
                let control = this.trn_control
                switch (event.keyCode) {
                    case 16: // Shift
                        control.setTranslationSnap(null);
                        control.setRotationSnap(null);
                        control.setScaleSnap(null);
                        break;
                }
            }

        }
    });

}

