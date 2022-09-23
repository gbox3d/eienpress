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

import { comFileFindFile, comFileDownload, comFileUpload, textDataUpload, makeFileObj } from "../comLibs/utils.js";
import elvisObjLoader from './elvisObjLoader.js';

export default async function ({ scope }) {

    const mEntityRepository = {}
    const mTextureRepository = {}
    const mMaterialRepository = {}

    // const mDefaultTexture = new THREE.TextureLoader().load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
    const mDefaultStandardMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.5,
        roughness: 0.5,
        // map: mDefaultTexture
    });

    

    //확장함수
    const loadFbx = async function ({ material, modelFile, onProgress, repo_ip
    }) {
        if (!mEntityRepository[modelFile]) {
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
                else {
                    //메트리얼 텍스춰 모두 지정안되어있을때
                    object.traverse((child) => {
                        if (child.isMesh) {
                            child.material = scope.defaultMaterial;
                        }
                    });
                }

                //fbx 파일로 만든 오브잭트는 바로 프펩이된다
                // object.userData.isPrefabRoot = true;
                object.userData.geometryFile = {
                    modelFile: modelFile,
                    repo_ip: repo_ip,
                    format: 'fbx'
                }
                mEntityRepository[modelFile] = object;
                return object;

            }
            catch (err) {
                console.log(err)
                return null;

            }
        }
        else {
            return mEntityRepository[modelFile];
        }
    }

    const loadTexture = async function ({ textureFile, onProgress, repo_ip, type }) {

        if (!mTextureRepository[textureFile]) {

            let loader = new TextureLoader();

            if (type == 'application/exr') {
                loader = new EXRLoader();
            }
            else if (type == 'application/hdr') {
                loader = new RGBELoader();
            }
            else {
                loader = new TextureLoader();
            }

            const texture = await new Promise((resolve, reject) => {
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
            console.log(`repo added ${textureFile}`)
            mTextureRepository[textureFile] = texture;
        }

        return mTextureRepository[textureFile];
    }

    async function loadMaterial({
        fileID,
        onProgress,
        repo_ip,
        reload = false
    }) {

        if (mMaterialRepository[fileID] && reload === false) return mMaterialRepository[fileID];

        let resp = await comFileDownload({
            fileID: fileID,
            hostUrl: repo_ip ? repo_ip : ''
        })

        let matJsondata = await resp.json()

        console.log(matJsondata)

        const _loader = new THREE.MaterialLoader();

        let material = _loader.parse(matJsondata);

        console.log(material)

        mMaterialRepository[fileID] = material;

        //diifuse map 있으면 로드
        if (material.userData?.texture?.id) {
            const fileInfo = material.userData.texture;
            let _tex = await loadTexture({
                textureFile: fileInfo.id,
                repo_ip: fileInfo.repo_ip,
                onProgress: onProgress ? onProgress : null,
                type : fileInfo.type
            });
            material.map = _tex;
        }

        if(material.userData?.normalMap?.id) {
            const fileInfo = material.userData.normalMap;

            let _tex = await loadTexture({
                textureFile: fileInfo.id,
                repo_ip: fileInfo.repo_ip,
                onProgress: onProgress ? onProgress : null,
                type : fileInfo.type
            });
            material.normalMap = _tex;
        }

        if(material.userData?.roughnessMap?.id) {
            const fileInfo = material.userData.roughnessMap;

            let _tex = await loadTexture({
                textureFile: fileInfo.id,
                repo_ip: fileInfo.repo_ip,
                onProgress: onProgress ? onProgress : null,
                type : fileInfo.type
            });
            material.roughnessMap = _tex;
        }

        if(material.userData?.metalnessMap?.id) {
            const fileInfo = material.userData.metalnessMap;

            let _tex = await loadTexture({
                textureFile: fileInfo.id,
                repo_ip: fileInfo.repo_ip,
                onProgress: onProgress ? onProgress : null,
                type : fileInfo.type
            });
            material.metalnessMap = _tex;
        }

        if(material.userData?.displacementMap?.id) {
            const fileInfo = material.userData.displacementMap;

            let _tex = await loadTexture({
                textureFile: fileInfo.id,
                repo_ip: fileInfo.repo_ip,
                onProgress: onProgress ? onProgress : null,
                type : fileInfo.type
            });
            material.displacementMap = _tex;
        }

        return material;
    }

    async function disposeMaterial({fileID}) {
        if (mMaterialRepository[fileID]) {
            mMaterialRepository[fileID].dispose();
            delete mMaterialRepository[fileID];
        }
    }


    function setMaterialToEntity({ entity, material, materialFile }) {

        // let _root = selectPrefabRoot(entity);
        // _root.userData.materialFile = materialFile;

        if (entity.isMesh) {
            entity.material = material;
            // entity.userData.materialFile = materialFile;
        }

        let bDone = false;
        entity.traverseAncestors(parent => {
            if (parent.isPrefabRoot) {
                if (!bDone) {
                    bDone = true;
                    parent.materialFile = {
                        id: materialFile.id,
                        repo_ip: materialFile.repo_ip
                    };
                }
            }
        });

        // entity.traverse((child) => {
        //     if (child.isMesh) {
        //         child.material = material;
        //     }
        // });
    }

    const addObject_fbx = async function ({ file_id, material = null, repo_ip }) {
        let _obj = await loadFbx({
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

    const addObject = async function ({
        parent = null,
        entity = null,
        modelFile, textureFile, fileId,
        diffuseColor,
        onProgress,
        roughness = 0.5,
        metalness = 0.5,
        bumpScale = 0.01,
    }) {

        if (entity) {
            parent ? parent.add(entity) : scope.root_dummy.add(entity);
            return entity;
        }
        else {
            try {

                let object = fileId ? mEntityRepository[fileId] : undefined;
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
                    fileId ? mEntityRepository[fileId] = object : null;
                    // mObjectRepository[fileId] = object;
                }

                parent ? parent.add(object) : scope.root_dummy.add(object);

                return object;
            }
            catch (e) {
                console.log(e);
            }

        }
    }

    const clearObject = function () {

        scope.select_node ? scope.trn_control?.detach(scope.select_node) : null;

        while (scope.root_dummy.children.length > 0) {
            scope.root_dummy.remove(scope.root_dummy.children[0]);
        }
    }

    const addPlane = function ({
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

    /////////////////////////////
    /*
    isPrefabRoot가 true인 오브젝트를 찾아 반환한다. 만약 없으면 자기 자신을 보낸다.
    */
    function selectPrefabRoot(entity) {

        let _ent = entity ? entity : scope.select_node;

        // let __ent = _ent;

        while (_ent && !_ent?.isPrefabRoot) {

            // if () {
            //     // scope.select_node = _ent;
            //     return _ent;
            //     break;
            // }

            _ent = _ent.parent;

        }
        return _ent;
    }


    async function savePrefab({ entity, name = 'nope' }) {
        const _prefabRoot = selectPrefabRoot(entity);
        if (_prefabRoot) {

            const _data = _prefabRoot.toJSON();

            console.log(_data)

            const str_data = JSON.stringify(_data);

            const _res = await textDataUpload({
                name: name,
                data: str_data,
                directory: 'prefab'
            })

            console.log(_res)
            return _res
        }
        else {
            return {
                r: 'error',
                msg: 'no prefab root'
            };
        }
    }
    async function loadPrefab({ fileID, repo_ip }) {

        if (mEntityRepository[fileID]) {

            console.log(`${fileID} is already loaded`)

            return mEntityRepository[fileID].clone();
        }
        else {

            let resp = await comFileDownload({
                fileID: fileID,
                hostUrl: repo_ip
            })

            let _jsondata = await resp.json()

            const _loader = new elvisObjLoader(this);
            const obj = await _loader.parseAsync(_jsondata)

            // addObject({
            //     entity: obj
            // })

            console.log(obj)
            mEntityRepository[fileID] = obj

            return obj.clone();
        }

    }

    ////////////////////////////////
    //scene 
    async function saveScene({ entity, name = 'nope' }) {

        const _entity = entity ? entity : scope.root_dummy;

        let _json = _entity.toJSON();

        _json.images = [];
        _json.textures = [];
        _json.materials = [];
        // _json.geometries = [];
        // const object = _json.object

        console.log(_json);

        try {
            const str_data = JSON.stringify(_json);

            const _res = await textDataUpload({
                name: name,
                data: str_data,
                directory: 'scene'
            })

            console.log(_res)
            return _res

        }
        catch (e) {
            return {
                r: 'error',
                msg: 'no prefab root'
            };
        }
    }

    async function loadScene({ fileID, repo_ip }) {

        let _jsondata = await (await comFileDownload({
            fileID: fileID,
            hostUrl: repo_ip
        })).json();

        console.log(_jsondata)

        const _loader = new elvisObjLoader(this);
        const obj = await _loader.parseAsync(_jsondata)

        console.log(obj)

        return obj;
    }

    return {
        addObject,
        addEntity: addObject,
        addObject_fbx,
        clearObject,
        addPlane,
        loadTexture,
        loadFbx,
        // mTextureRepository,
        // mEntityRepository,
        // mMaterialRepository,
        addMeshObject({ geometry, material, position, rotation, scale, parent }) {
            const object = new THREE.Mesh(geometry, material ? material : scope.defaultMaterial);
            position ? object.position.copy(position) : null;
            rotation ? object.rotation.copy(rotation) : null;
            scale ? object.scale.copy(scale) : null;
            parent ? parent.add(object) : scope.root_dummy.add(object);
            // parent.add(object);
            return object;
        },
        removeObject(id) {

            let object = id ? scope.root_dummy.getObjectById(id) : scope.select_node ? scope.select_node : null;

            if (object) {
                console.log(object);
                scope.trn_control?.detach(object);
                object.removeFromParent();
            }
            // object.parent.remove(object);
        },
        updateTranform({
            objId,
            position,
            rotation,
            scale
        }) {
            const _obj = objId ? scope.root_dummy.getObjectById(objId) : scope.select_node;
            if (_obj) {
                position ? _obj.position.copy(position) : null
                rotation ? _obj.rotation.copy(rotation) : null
                scale ? _obj.scale.copy(scale) : null
            }
        },

        //material
        loadMaterial,
        disposeMaterial,
        setMaterialToEntity,

        //prefab
        selectPrefabRoot,
        savePrefab,
        loadPrefab,

        saveScene,
        loadScene,
        defaultMaterial: {
            standard : mDefaultStandardMaterial
        }
    }

}