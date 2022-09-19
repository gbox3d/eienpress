import * as THREE from 'three';
import elvisObject3d from '../../../modules/elvisPlugins/elvisObject3d.js';
import { comFileFindFile, comFileDownload, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";
import uiMenuBarSetup from './uiMenuBar.js';

// import { , comFileGetDetail } from "../../../modules/comLibs/utils.js";
// import objectViewerSetup from '';
import quEditorSetup from '../../../modules/elvisPlugins/queditor.js';




import 'md5';

export default async function (_Context) {

    const _htmlText = `
    <div class="ui-view">
        <div class='ui-menu-bar'></div>
        <div class='gl-container'></div>
    </div>
    `;

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');
    const _rootElm = htmlDoc.querySelector('.ui-view');
    const _glContainer = htmlDoc.querySelector('.gl-container');


    const host_url = _Context.host_url;

    //menu bar 등록 
    const _menuBar = await uiMenuBarSetup(_Context);
    _rootElm.querySelector('.ui-menu-bar').appendChild(_menuBar.element);

    //메뉴 이밴트 처리 
    _menuBar.setCallback(async (menuName, btnName) => {
        console.log(menuName);

        if (btnName) {
            if (btnName === 'Editor') {
                switch (menuName) {
                    case 'clear scene':
                        quEditor.objMng.clearObject();
                        break;
                    case 'camera reset':
                        quEditor.resetCamera();
                        break;
                    case 'enviroment map':
                        {
                            // objViewer.hideEnvMap();
                            quEditor.toggleEnvMap();
                        }
                        break;
                    case 'grid':
                        {
                            // objViewer.showGrid();
                            quEditor.toggleGrid();
                        }
                        break;
                    case 'delete':
                        {
                            //remove select object
                            quEditor.objMng.removeObject();
                            // console.log(quEditor.scope.select_node);

                        }
                        break;
                    case 'rotateX':
                        {
                            quEditor.getSelectEntity()?.rotateX(THREE.MathUtils.degToRad(-90));
                        }
                        break;
                    case 'scale down':
                        {
                            quEditor.getSelectEntity()?.scale.multiplyScalar(0.5);
                        }
                        break;
                    case 'scale up':
                        {
                            quEditor.getSelectEntity()?.scale.multiplyScalar(2);
                        }
                        break;
                    case 'set zero pos':
                        {
                            quEditor.objMng.updateTranform({
                                position: new THREE.Vector3(0, 0, 0),
                                rotation: new THREE.Euler(0, 0, 0),
                                scale: new THREE.Vector3(1, 1, 1)
                            })

                        }
                        break;
                    case 'clone':
                        {
                            if (quEditor.getSelectEntity()) {
                                let _clone = quEditor.getSelectEntity().clone();
                                quEditor.objMng.addObject({
                                    entity: _clone,
                                });
                            }
                        }
                        break;
                    case 'select prefab root':
                        {
                            quEditor.elvis.select_node = quEditor.objMng.selectPrefabRoot();
                            quEditor.elvis.trn_control.attach(quEditor.elvis.select_node);
                            console.log(quEditor.elvis.select_node);

                        }
                        break;
                }
            }
            else if (btnName === 'Entity') {

                let _rootDummy = new elvisObject3d({
                    isPrefabRoot: true,
                    assetType: `prefab.builtIn.${menuName}`
                });
                // _rootDummy.userData.isPrefabRoot = true;
                // _rootDummy.userData.type = `prefab.builtIn.${menuName}`;

                // let geometry;
                quEditor.objMng.addObject({
                    entity: _rootDummy
                });

                switch (menuName) {
                    case 'cube':
                        {
                            let geometry = new THREE.BoxGeometry(30, 30, 30);

                            objViewer.objMng.addMeshObject({
                                geometry: geometry,
                                parent: _rootDummy,
                            });
                        }
                        break;
                    case 'plane':
                        {
                            _rootDummy.makePrefabEntity('prefab.builtIn.plane');
                            let geometry = new THREE.PlaneGeometry(30, 30);
                            objViewer.objMng.addMeshObject({
                                geometry: geometry,
                                parent: _rootDummy,
                            });
                        }
                        break;
                    case 'sphere':
                        {
                            let geometry = new THREE.SphereGeometry(30, 30, 30);
                            objViewer.objMng.addMeshObject({
                                geometry: geometry,
                                parent: _rootDummy,
                            });
                        }
                        break;
                    case 'cylinder':
                        {
                            const geometry = new THREE.CylinderGeometry(30, 30, 30, 30);
                            objViewer.objMng.addMeshObject({
                                geometry: geometry
                            });
                        }
                        break;
                    case 'torus':
                        {
                            const geometry = new THREE.TorusGeometry(30,
                                10, 30, 30);
                            objViewer.objMng.addMeshObject({
                                geometry: geometry,
                                parent: _rootDummy,
                            });
                        }
                        break;
                    case 'cone':
                        {
                            const geometry = new THREE.ConeGeometry(30, 30, 30);
                            objViewer.objMng.addMeshObject({
                                geometry: geometry,
                                parent: _rootDummy,
                            });
                        }
                        break;
                    case 'from fbx':
                        {

                            //select file from file list
                            // const fileID = await comFileFindFile({
                            //     filename: 'chair.fbx'
                            // })

                            let selectFile = await new Promise((resolve, reject) => {
                                _Context.fileSelectBox.show(
                                    (evt) => {
                                        console.log(evt);
                                        resolve(evt);

                                    },
                                    'model'
                                )
                            });

                            // console.log(slectFile);
                            const fileID = selectFile.id

                            if (fileID) {

                                if (_.endsWith(selectFile.type, 'fbx')) {

                                    let res = await (await (fetch(`${host_url}/com/file/findOne/${fileID}`, {
                                        method: 'GET',
                                        headers: {
                                            'Content-Type': 'application/text',
                                            'authorization': localStorage.getItem('jwt_token')
                                        }
                                    }))).json();
                                    console.log(res)

                                    if (res.r === 'ok' && res.data) {
                                        let file_id = res.data._id;

                                        let obj = await objViewer.objMng.loadFbx({
                                            modelFile: file_id,
                                            repo_ip: res.data.repo_ip,
                                        });

                                        _rootDummy.makePrefabEntity('prefab.fbx')
                                        _rootDummy.add(obj);
                                        _rootDummy.geometryFile = {
                                            id: file_id,
                                            repo_ip: res.data.repo_ip,
                                            format: 'fbx'
                                        }

                                        objViewer.objMng.addObject({
                                            entity: _rootDummy
                                        });

                                    }
                                }
                                else {
                                    _Context.messageModal.show({
                                        msg: 'file is not fbx'
                                    })
                                }
                            }
                            else {
                                _Context.messageModal.show({
                                    msg: '취소'
                                })
                            }
                        }
                        break;
                }

            }
            else if (btnName === 'Material') {

                switch (menuName) {
                    case 'set texture':
                        {
                            let selectFile = await new Promise((resolve, reject) => {
                                _Context.fileSelectBox.show(
                                    (evt) => {
                                        // console.log(evt);
                                        resolve(evt);
                                    },
                                    'texture'
                                )
                            });

                            console.log(selectFile)

                            let _tex = await quEditor.objMng.loadTexture({
                                textureFile: selectFile.id,
                                repo_ip: selectFile.repo_ip,
                                onProgress: (progress) => {
                                    console.log(progress)
                                    _Context.progressBox.update(progress);
                                }
                            });

                            console.log(_tex)

                            let material = new THREE.MeshStandardMaterial({
                                map: _tex,
                                color: 0xffffff,
                                roughness: 0.5,
                                metalness: 0.5,
                            });
                            material.userData.texture = {
                                id: selectFile.id,
                                repo_ip: selectFile.repo_ip
                            }

                            if (quEditor.elvis.select_node) {

                                const _node = quEditor.elvis.select_node;
                                _node.material = material;

                            }
                            else {
                                _Context.messageModal.show({
                                    msg: 'select object'
                                })
                            }
                        }
                        break;
                    case 'set parameter':
                        {

                        }
                        break;
                    case 'save material':
                        {
                            const sel_node = quEditor.elvis.select_node;
                            if (sel_node) {

                                let material_name = prompt('material name', 'material_name');

                                if (!material_name) break;

                                const matJson = sel_node.material.toJSON();
                                matJson.images = undefined;
                                matJson.map = undefined;
                                matJson.textures = undefined;

                                console.log(matJson)

                                let _data = JSON.stringify(matJson)

                                const fileObj = {
                                    file: {
                                        name: `${material_name}_material.json`,
                                        size: _data.length,
                                        type: 'application/text',
                                    },
                                    data: _data
                                }



                                let hash = md5(fileObj.data)
                                console.log(hash);

                                // console.log(form_data);

                                const _res = await comFileUpload({
                                    fileObj: fileObj,
                                    fileType: 'application/text',
                                    title: material_name,
                                    description: '',
                                    directory: 'material',
                                    isPublic: true,
                                    md5: hash
                                });

                                console.log(_res)
                                if (_res.r === 'ok') {
                                    _Context.messageModal.show({
                                        msg: `save material ${_res.data.insertedId}`
                                    })
                                }
                            }

                        }
                        break;
                    case 'load material':
                        {
                            const sel_node = quEditor.elvis.select_node;
                            if (sel_node) {

                                let sel_file = await new Promise((resolve, reject) => {
                                    _Context.fileSelectBox.show(
                                        (evt) => {
                                            // console.log(evt);
                                            resolve(evt);
                                        },
                                        'material'
                                    )
                                });

                                if (!sel_file) {
                                    await _Context.messageModal.show({
                                        msg: '취소'
                                    })
                                    break;
                                }

                                //load material
                                const material = await quEditor.objMng.loadMaterial({
                                    fileID: sel_file.id,
                                    repo_ip: sel_file.repo_ip,
                                    onProgress: (progress) => {
                                        console.log(progress)
                                    }
                                });

                                //set material
                                // sel_node.material = material;
                                // sel_node.userData.materialFile = sel_file

                                quEditor.objMng.setMaterialToEntity({
                                    entity: sel_node,
                                    material: material,
                                    materialFile: sel_file
                                })

                                // console.log(sel_node)


                            }
                            else {
                                _Context.messageModal.show({
                                    msg: 'select object'
                                })
                            }


                        }
                        break;
                }
            }
            else if (btnName === 'Prefab') {

                switch (menuName) {
                    case 'save':
                        {
                            const _selentity = quEditor.getSelectEntity();

                            if (_selentity) {
                                let _name = prompt('input prefab name', '');
                                if (_name !== '' && _name !== null && _name !== undefined) {
                                    quEditor.objMng.savePrefab(
                                        {
                                            entity: _selentity,
                                            name: _name
                                        }
                                    );
                                }
                                else {
                                    _Context.messageModal.show({
                                        msg: 'please input name'
                                    });
                                }
                            }
                            else {
                                _Context.messageModal.show({
                                    msg: 'select object'
                                })
                            }

                        }
                        break;
                    case 'load':
                        {
                            let sel_file = await new Promise((resolve, reject) => {
                                _Context.fileSelectBox.show(
                                    (evt) => {
                                        // console.log(evt);
                                        resolve(evt);
                                    },
                                    'prefab'
                                )
                            });

                            console.log(sel_file)

                            _Context.messageModal.show({
                                msg: 'load prefab'
                            })

                            if (!sel_file) {
                                await _Context.messageModal.show({
                                    msg: '취소'
                                })
                                break;
                            }
                            else {
                                const entity = await quEditor.objMng.loadPrefab({
                                    fileID: sel_file.id,
                                    repo_ip: sel_file.repo_ip
                                });

                                quEditor.objMng.addEntity({
                                    entity: entity
                                });

                                quEditor.setSelectEntity(entity);
                                console.log(entity)
                            }

                            _Context.messageModal.close();


                        }
                        break;
                    case 'resolve':
                        {
                            const _selentity = quEditor.getSelectEntity();
                            _selentity.resolve(quEditor.objMng);
                        }
                        break;
                }
            }
            else if (btnName === 'Scene') {
                switch (menuName) {
                    case 'save':
                        {
                            let _name = prompt('input scene name', '');
                            if (_name !== '' && _name !== null && _name !== undefined) {

                                let _r = await quEditor.objMng.saveScene({
                                    name: _name,
                                    entity: quEditor.elvis.root_dummy
                                });

                                console.log(_r)
                            }
                        }
                        break;
                    case 'load':
                        {
                            let sel_file = await new Promise((resolve, reject) => {
                                _Context.fileSelectBox.show(
                                    (evt) => {
                                        // console.log(evt);
                                        resolve(evt);
                                    },
                                    'scene'
                                )
                            });

                            console.log(sel_file)

                            if (sel_file) {
                                let _scene = await quEditor.objMng.loadScene({
                                    fileID: sel_file.id,
                                    repo_ip: sel_file.repo_ip
                                });

                                quEditor.elvis.scene.remove(quEditor.elvis.root_dummy);
                                quEditor.elvis.scene.add(_scene);
                                quEditor.elvis.root_dummy = _scene;

                            }
                            else {
                                _Context.messageModal.show({
                                    msg: '파일을 선택하세요.'
                                })
                            }

                        }
                        break;
                    case 'resolve':
                        {
                            let _list = []
                            quEditor.elvis.root_dummy.traverse( (entity) => {
                                if (entity.isPrefabRoot) {
                                    // console.log(entity)
                                    _list.push(entity)
                                    // await entity.resolve(quEditor.objMng);
                                }
                            });

                            console.log(_list)

                            for (let i = 0; i < _list.length; i++) {
                                await _list[i].resolve(quEditor.objMng);
                            }
                            
                        }

                }
            }
        }

    });

    // //환경멥 로딩
    let basicEnvMapId = await comFileFindFile({
        filename: 'basic_envmap'
    });


    const quEditor = await quEditorSetup({
        Context: theApp,
        window_size: {
            width: 1024,
            height: 768
        },
        isGrid: true,
        container: _glContainer,
        // envMapFileFormat : '', // exr, hdr, pic , default : hdr
        envMapFile: basicEnvMapId,
        onSelectObject: (obj) => {
            console.log(obj);
            // let _root = quEditor.objMng.selectPrefabRoot(obj)
            // console.log(_root)
        }
        // Context: theApp,
        // container: _glContainer,
        // envMapFile: basicEnvMapId,
        // cameraPosition: new THREE.Vector3(-169, -62, -140),
        // isGrid: false
    });

    quEditor.showEnvMap(true);

    const objViewer = quEditor
    theApp.quEditor = quEditor;

    _Context.body_container.appendChild(_rootElm);

    console.log('complete setup uiMain');

    return {
        element: _rootElm,
        menubar: _menuBar,
        quEditor: quEditor
    }

}