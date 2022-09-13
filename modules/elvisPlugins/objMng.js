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

export default async function ({ scope }) {

    const mObjectRepository = {}
    const mTextureRepository = {}
    const mMaterialRepository = {}


    //확장함수
    const loadFbx = async function ({ material, modelFile, onProgress, repo_ip
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
            // else if (textureMap) {
            //     const _texture = textureMap;
            //     object.traverse((child) => {
            //         if (child.isMesh) {

            //             // const diffuseColor = new THREE.Color().setRGB(0.8, 0.8, 0.8);

            //             child.material = new THREE.MeshStandardMaterial(
            //                 {
            //                     map: _texture ? _texture : null,
            //                     bumpMap: _texture ? _texture : null,
            //                     bumpScale: bumpScale,
            //                     color: diffuseColor,
            //                     metalness: metalness,
            //                     roughness: roughness
            //                     // envMap: hdrTexture, //오브잭트 단위로 환경멥을 적용시킨다.
            //                 }
            //             );
            //         }
            //     });
            // }
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

    const loadTexture = async function ({ textureFile, onProgress, repo_ip }) {

        if ( !mTextureRepository[textureFile] ) {
            const loader = new TextureLoader();
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



    return {
        addObject,
        addObject_fbx,
        clearObject,
        addPlane,
        loadTexture,
        loadFbx,
        mTextureRepository,
        mObjectRepository,
        mMaterialRepository,
        addMeshObject({ geometry, material, position, rotation, scale }) {
            const object = new THREE.Mesh(geometry, material ? material : scope.defaultMaterial);
            position ? object.position.copy(position) : null;
            rotation ? object.rotation.copy(rotation) : null;
            scale ? object.scale.copy(scale) : null;
            scope.root_dummy.add(object);
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
        }

    }

}