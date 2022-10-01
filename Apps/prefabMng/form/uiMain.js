import * as THREE from 'three';
import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";


import { comFileFindFile } from "../../../modules/comLibs/utils.js";

import elvisObject3d from '../../../modules/elvisPlugins/elvisObject3d.js';
import objectViewerSetup from '../../../modules/elvisPlugins/queditor.js';

import uiMenuBarSetup from './uiMenuBar.js';
import objTreeViewSetup from './objTreeView.js';
import attrViewSetup from './attrView.js';
import prefabViewSetup from './prefabView.js';

import 'md5';
import attrView from './attrView.js';

export default async function (_Context) {

    const _htmlText = `
    <div class="ui-view">
        <div class='ui-menu-bar'></div>
        <div class='up-frame' >
            <div class='side'>
                <div class='prefab-tree' > </div>
                <div class='prefab-attr' > </div>
            </div>
            <div class='center'>
                <div class='gl-container'></div>
                <div class='prefab-view' > </div>
            </div>
            
        </div>
    </div>
    `;

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');
    const _rootElm = htmlDoc.querySelector('.ui-view');
    const _glContainer = htmlDoc.querySelector('.gl-container');

    const up_frame = _rootElm.querySelector('.up-frame');
    up_frame.style.display = 'flex';

    const _sideframe = _rootElm.querySelector('.side');
    _sideframe.display = 'block';
    _sideframe.style.width = '320px';
    _sideframe.style.height = '1024px';

    const _centerframe = _rootElm.querySelector('.center');
    _centerframe.display = 'block';
    _centerframe.style.width = '1024px';
    _centerframe.style.height = '1024px';

    const host_url = _Context.host_url;

    //menu bar 등록 
    const _menuBar = await uiMenuBarSetup(_Context);
    _rootElm.querySelector('.ui-menu-bar').appendChild(_menuBar.element);


    async function _loadFbx(selectFile) {
        const fileID = selectFile.id;

        if (_.endsWith(selectFile.type, 'fbx')) {

            //get file info detail
            let res = await (await (fetch(`${host_url}/com/file/findOne/${fileID}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/text',
                    'authorization': localStorage.getItem('jwt_token')
                }
            }))).json();

            if (res.r === 'ok' && res.data) {
                let file_id = res.data._id;

                let obj = await objViewer.objMng.loadFbx({
                    fileID: file_id,
                    repo_ip: res.data.repo_ip,
                });

                return {
                    r: 'ok',
                    object: obj,
                    fileInfo: res.data
                };
            }
        }
        else {

            return {
                r: 'err',
                msg: 'not fbx file'
            }
            // _Context.messageModal.show({
            //     msg: 'fbx 파일만 지원합니다.'
            // })
            // alert('not support file type');
        }
    }

    async function _loadGlf(selectFile) {
        const fileID = selectFile.id;

        if (_.endsWith(selectFile.type, 'gltf-buffer')) {

            //get file info detail
            let res = await (await (fetch(`${host_url}/com/file/findOne/${fileID}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/text',
                    'authorization': localStorage.getItem('jwt_token')
                }
            }))).json();

            if (res.r === 'ok' && res.data) {
                let file_id = res.data._id;

                let obj = await objViewer.objMng.loadGlf({
                    fileID: file_id,
                    repo_ip: res.data.repo_ip,
                });

                return {
                    r: 'ok',
                    object: obj,
                    fileInfo: res.data
                };
            }
        }
        else {

            return {
                r: 'err',
                msg: 'glf 파일만 지원합니다.'
            }
            // _Context.messageModal.show({
            //     msg: 'fbx 파일만 지원합니다.'
            // })
            // alert('not support file type');
        }
    }

    ///////////////////////////
    //메뉴 이밴트 처리 
    _menuBar.setCallback(async (menuName, btnName) => {
        console.log(menuName);

        try {
            if (btnName) {
                if (btnName === 'Viewer') {
                    switch (menuName) {
                        case 'clear':
                            objViewer.objMng.clearObject();
                            break;
                        case 'camera reset':
                            objViewer.resetCamera();
                            break;
                        case 'enviroment map':
                            {
                                // objViewer.hideEnvMap();
                                objViewer.toggleEnvMap();
                            }
                            break;
                        case 'grid':
                            {
                                // objViewer.showGrid();
                                objViewer.toggleGrid();
                            }
                            break;
                    }
                }
                else if (btnName === 'File') {
                    switch (menuName) {
                        case 'new':
                            {
                                objViewer.elvis.trn_control?.detach();
                                objViewer.elvis.removeAllChildren(
                                    objViewer.elvis.root_dummy
                                );

                                //변환초기화
                                const root_dummy = objViewer.elvis.root_dummy;

                                const _matrix = new THREE.Matrix4();
                                _matrix.identity();

                                root_dummy.matrixAutoUpdate = false;
                                root_dummy.matrix.identity();
                                root_dummy.applyMatrix4(_matrix);
                                root_dummy.matrixAutoUpdate = true;

                                _treeView.updateTree(root_dummy);
                                _treeView.selectNode(root_dummy.uuid);
                                _attrView.set(root_dummy);
                                _prefabView.set(root_dummy);

                                objViewer.setSelectEntity(root_dummy);

                                objViewer.objMng.clearAllRepository();

                            }
                            break;
                        case 'load':
                            {
                                let sel_file = await new Promise((resolve, reject) => {
                                    _Context.fileSelectBox.show(
                                        (evt) => {
                                            resolve(evt);
                                        },
                                        'prefab'
                                    )
                                });

                                console.log(sel_file)

                                if (!sel_file) {
                                    await _Context.messageModal.show({
                                        msg: '취소'
                                    })
                                    break;
                                }
                                else {
                                    const entity = await objViewer.objMng.loadPrefab({
                                        fileID: sel_file.id,
                                        repo_ip: sel_file.repo_ip
                                    });

                                    objViewer.objMng.addEntity({
                                        entity: entity
                                    });

                                    objViewer.setSelectEntity(entity);
                                    console.log(entity)

                                    //update tree view
                                    _treeView.updateTree(objViewer.elvis.root_dummy);
                                    _treeView.selectNode(entity.uuid);
                                    _attrView.set(entity);
                                    _prefabView.set(entity);


                                }

                                _Context.messageModal.close();

                            }
                            break;
                        case 'save':
                            {
                                const _selentity = objViewer.getSelectEntity();
                                console.log(_selentity);
                                if (_selentity 
                                    && _selentity.name !== 'root_dummy' //root_dummy는 저장하지 않는다.
                                    // && _selentity.isElvisObject3D
                                    ) 
                                {

                                    if (_selentity.name !== '' && _selentity.name) {
                                        let res = await objViewer.objMng.savePrefab(
                                            {
                                                entity: _selentity,
                                                name : _selentity.name,
                                                fileID: _selentity.userData.fileInfo?.id, //id 가 주어지면 update
                                                repo_ip: _selentity.userData.fileInfo?.repo_ip
                                            }
                                        );

                                        if (res.r === 'ok') {
                                            await _Context.messageModal.show({
                                                msg: '저장 성공'
                                            })
                                        }
                                        else {
                                            await _Context.messageModal.show({
                                                msg: '저장 실패'
                                            })
                                        }
                                    }
                                    else {
                                        await _Context.messageModal.show({
                                            msg: '이름을 입력하세요'
                                        })
                                    }
                                }
                                else {
                                    _Context.messageModal.show({
                                        msg: '적합하지않는 오브잭트루트입니다.'
                                    });
                                }

                            }
                            break;
                        case 'export_glf':
                            {
                                const _selentity = objViewer.getSelectEntity();
                                let __selentity = _selentity.clone();
                                __selentity.material = new THREE.MeshStandardMaterial();

                                let res = await objViewer.objMng.saveGlf({
                                    entity: __selentity
                                });

                                console.log(res)

                                _Context.messageModal.show({
                                    msg: '저장되었습니다.'
                                });

                            }
                            break;
                    }
                }
                else if (btnName === 'Entity') {
                    
                    const _selentity = objViewer.getSelectEntity();

                    switch (menuName) {
                        // case 'fbx':
                        //     {
                        //         let _rootDummy = new elvisObject3d({
                        //             isPrefabRoot: true,
                        //             assetType: `prefab.fbx`
                        //         });

                        //         let selectFile = await new Promise((resolve, reject) => {
                        //             _Context.fileSelectBox.show(
                        //                 (evt) => {
                        //                     console.log(evt);
                        //                     resolve(evt);

                        //                 },
                        //                 'model'
                        //             )
                        //         });
                        //         const fileID = selectFile.id
                        //         if (fileID) {

                        //             const res = await _loadFbx(selectFile);

                        //             if (res) {
                        //                 let obj = res.object;

                        //                 console.log(res)

                        //                 _rootDummy.makePrefabEntity('prefab.fbx')
                        //                 _rootDummy.add(obj);
                        //                 _rootDummy.geometryFile = {
                        //                     id: res.fileInfo._id,
                        //                     repo_ip: res.fileInfo.repo_ip,
                        //                     format: 'fbx'
                        //                 }

                        //                 objViewer.objMng.addObject({
                        //                     entity: _rootDummy
                        //                 });

                        //                 //setup tree view
                        //                 _treeView.updateTree(objViewer.elvis.root_dummy);

                        //                 //message box
                        //                 _Context.messageModal.show({
                        //                     msg: 'load complete'
                        //                 });
                        //             }
                        //             else {
                        //                 _Context.messageModal.show({
                        //                     msg: 'load fail'
                        //                 });
                        //             }
                        //         }
                        //         else {
                        //             _Context.messageModal.show({
                        //                 msg: '취소'
                        //             })
                        //         }
                        //         break;
                        //     }
                        // case 'file':
                        //     {
                        //         let parent_entity = objViewer.getSelectEntity();
                        //         if (!parent_entity?.isElvisObject3D) {
                        //             _Context.messageModal.show({
                        //                 msg: '부모는 elvisObject3d여야 합니다.'
                        //             });
                        //             break;
                        //         }

                        //         let selectFile = await new Promise((resolve, reject) => {
                        //             _Context.fileSelectBox.show(
                        //                 (evt) => {
                        //                     console.log(evt);
                        //                     resolve(evt);

                        //                 },
                        //                 'model'
                        //             )
                        //         });
                        //         const fileID = selectFile.id

                        //         console.log(selectFile)

                        //         if (fileID) {

                        //             let res
                        //             if (selectFile.type === 'application/gltf-buffer') {

                        //                 parent_entity.makePrefabEntity('prefab.glf')
                        //                 res = await _loadGlf(selectFile);
                        //             }
                        //             else if (selectFile.type === 'application/fbx') {
                        //                 parent_entity.makePrefabEntity('prefab.fbx')
                        //                 res = await _loadFbx(selectFile);
                        //             }
                        //             else {
                        //                 _Context.messageModal.show({
                        //                     msg: '지원하지 않는 파일 형식입니다.'
                        //                 });
                        //                 break;
                        //             }

                        //             console.log(res)

                        //             if (res.r === 'ok') {

                        //                 parent_entity.geometryFile = {
                        //                     id: res.fileInfo._id,
                        //                     repo_ip: res.fileInfo.repo_ip,
                        //                     format: selectFile.type
                        //                 }

                        //                 objViewer.objMng.addObject({
                        //                     entity: res.object,
                        //                     parent: parent_entity
                        //                 });

                        //                 //setup tree view
                        //                 _treeView.updateTree(objViewer.elvis.root_dummy);

                        //                 //message box
                        //                 _Context.messageModal.show({
                        //                     msg: 'load complete'
                        //                 });
                        //                 // }
                        //                 // else {

                        //                 // }
                        //             }
                        //             else {
                        //                 _Context.messageModal.show({
                        //                     msg: 'load fail'
                        //                 });
                        //             }
                        //         }
                        //         else {
                        //             _Context.messageModal.show({
                        //                 msg: '취소'
                        //             })
                        //         }

                        //     }
                        //     break;
                        case 'group':
                            {
                                let entity = new THREE.Group();

                                objViewer.objMng.addEntity({
                                    entity: entity,
                                    parent: _selentity ? _selentity : objViewer.elvis.root_dummy
                                });
                                _treeView.updateTree(objViewer.elvis.root_dummy); // 트리뷰업데이트
                                _treeView.selectNode(entity.uuid); //현제 선택된 엔티티 선택
                                _attrView.set(entity);
                                objViewer.setSelectEntity(entity);
                            }
                            break;
                        case 'elvisObject3d':
                            {
                                let entity = new elvisObject3d();

                                objViewer.objMng.addEntity({
                                    entity: entity,
                                    parent: _selentity ? _selentity : objViewer.elvis.root_dummy
                                });
                                _treeView.updateTree(objViewer.elvis.root_dummy); // 트리뷰업데이트
                                _treeView.selectNode(entity.uuid); //현제 선택된 엔티티 선택
                                _attrView.set(entity);
                                _prefabView.set(entity);

                                objViewer.setSelectEntity(entity);


                            }
                            break;
                        case 'plane':
                            {
                                const _selentity = objViewer.getSelectEntity();
                                let geometry = new THREE.PlaneGeometry(30, 30);
                                let entity = objViewer.objMng.addMeshObject({
                                    geometry: geometry,
                                    parent: _selentity ? _selentity : objViewer.elvis.root_dummy,
                                });
                                _treeView.updateTree(objViewer.elvis.root_dummy); // 트리뷰업데이트
                                _treeView.selectNode(entity.uuid); //현제 선택된 엔티티 선택
                                _attrView.set(entity);
                                objViewer.setSelectEntity(entity);
                            }
                            break;
                        case 'box':
                            {
                                const _selentity = objViewer.getSelectEntity();
                                let geometry = new THREE.BoxGeometry(30, 30, 30);
                                let entity = objViewer.objMng.addMeshObject({
                                    geometry: geometry,
                                    parent: _selentity ? _selentity : objViewer.elvis.root_dummy,
                                });
                                _treeView.updateTree(objViewer.elvis.root_dummy); // 트리뷰업데이트
                                _treeView.selectNode(entity.uuid); //현제 선택된 엔티티 선택
                                _attrView.set(entity);
                                objViewer.setSelectEntity(entity);

                            }
                            break;
                        case 'sphere':
                            {
                                const _selentity = objViewer.getSelectEntity();
                                let geometry = new THREE.SphereGeometry(30, 30, 30);
                                let entity = objViewer.objMng.addMeshObject({
                                    geometry: geometry,
                                    parent: _selentity ? _selentity : objViewer.elvis.root_dummy,
                                });
                                _treeView.updateTree(objViewer.elvis.root_dummy); // 트리뷰업데이트
                                _treeView.selectNode(entity.uuid); //현제 선택된 엔티티 선택
                                _attrView.set(entity);
                                objViewer.setSelectEntity(entity);

                            }
                            break;

                    }
                }
                else if (btnName === 'Edit') {
                    switch (menuName) {
                        case 'resolve':
                            {
                                _Context.progressBox.show();
                                const _selentity = objViewer.getSelectEntity();
                                // await _selentity.resolve(objViewer.objMng, (progress) => {
                                //     _Context.progressBox.update(progress);
                                // });
                                await objViewer.objMng.resolvePrefab({
                                    entity: _selentity,
                                    progress: (progress) => {
                                        _Context.progressBox.update(progress);
                                    }
                                });

                                _treeView.updateTree(objViewer.elvis.root_dummy); // 트리뷰업데이트
                                _treeView.selectNode(_selentity.uuid); //현제 선택된 엔티티 선택

                                _prefabView.set(_selentity);

                                _Context.progressBox.closeDelay(100);

                                _Context.messageModal.show({
                                    msg: 'resolve complete'
                                });
                            }
                            break;
                        case 'rx90':
                            {
                                const _selentity = objViewer.getSelectEntity();
                                if (_selentity) {
                                    _selentity.rotateX(THREE.MathUtils.degToRad(-90));
                                    _attrView.set(_selentity);
                                }

                            }
                            break;
                    }
                }
            }
        }
        catch (e) {
            console.log(e);
            _Context.messageModal.show({
                msg: e.message,
            })
        }
    });

    ///////////////////////////
    //3d viewer 등록
    const objViewer = await objectViewerSetup({
        Context: theApp,
        window_size: {
            width: 800,
            height: 600
        },
        isGrid: true,
        container: _glContainer,
        envMapFile: await comFileFindFile({ filename: 'basic_envmap' }),
        onSelectObject: (obj) => {
            console.log('select : ', obj)
            _treeView.selectNode(obj.uuid);
            _attrView.set(obj);
            _prefabView.set(obj);
        },
        onObjectEditChange: (obj) => {
            // console.log('edit change : ', obj)
            _attrView.set(obj);
        }
        // cameraPosition: new THREE.Vector3(-169, -62, -140),
    });
    objViewer.showEnvMap(true);
    _Context.objViewer = objViewer;

    /////////////////////////////
    //tree view 등록
    const _treeView = await objTreeViewSetup(
        _Context,
        _rootElm.querySelector('.prefab-tree')
    );
    _treeView.setOnSelectItem((item_uuid) => {
        //select item
        let obj = objViewer.elvis.scene.getObjectByProperty('uuid', item_uuid)
        objViewer.setSelectEntity(obj);

        _attrView.set(obj);
        _prefabView.set(obj);

        console.log(obj);

    });
    //트리뷰 초기화 
    _treeView.updateTree(objViewer.elvis.root_dummy);


    //attr view 등록
    const _attrView = await attrViewSetup(
        _Context,
        _rootElm.querySelector('.prefab-attr')
    );

    //prefab view 등록
    const _prefabView = await prefabViewSetup(
        _Context,
        _rootElm.querySelector('.prefab-view')
    );

    _prefabView.setCallback(
        {
            onMaterialChange: async (entity) => {

                if (entity?.isElvisObject3D) {

                    let selectFile = await new Promise((resolve, reject) => {
                        _Context.fileSelectBox.show(
                            (evt) => {
                                // console.log(evt);
                                resolve(evt);
                            },
                            'material'
                        )
                    });

                    if (selectFile) {
                        console.log(selectFile);

                        _Context.progressBox.show();
                        const material = await _Context.objViewer.objMng.loadMaterial({
                            fileID: selectFile.id,
                            repo_ip: selectFile.repo_ip,
                            onProgress: (progress) => {
                                _Context.progressBox.update(progress);
                            }
                        });

                        entity.traverse((child) => {
                            if (child.isMesh) {
                                child.material = material;
                            }
                        });

                        entity.materialFile = {
                            id: selectFile.id,
                            repo_ip: selectFile.repo_ip,
                            size: parseInt(selectFile.size),
                            type: selectFile.type
                        };

                        // if (entity.isMesh) {
                        //     entity.material = material;
                        // }
                        // else if (entity.isElvisObject3D) {
                        //     entity.traverse((child) => {
                        //         if (child.isMesh) {
                        //             child.material = material;
                        //         }
                        //     });

                        //     entity.materialFile = {
                        //         id: selectFile.id,
                        //         repo_ip: selectFile.repo_ip
                        //     }
                        // }

                        _prefabView.set(entity);

                        await _Context.progressBox.closeDelay(100);
                    }
                    else {
                        console.log('cancel');
                        _Context.messageModal.show({
                            msg: 'cancel',
                        });
                    }
                }
                else {
                    _Context.messageModal.show({
                        msg: `not elvis object`,
                    });
                }

            },
            onGeometryChange: async (entity) => {

                let parent_entity = entity;

                if (!parent_entity?.isElvisObject3D) {
                    _Context.messageModal.show({
                        msg: '부모는 elvisObject3d여야 합니다.'
                    });
                    return;
                }

                let selectFile = await new Promise((resolve, reject) => {
                    _Context.fileSelectBox.show(
                        (evt) => {
                            console.log(evt);
                            resolve(evt);

                        },
                        'model'
                    )
                });
                const fileID = selectFile.id

                console.log(selectFile)

                if (fileID) {

                    _Context.progressBox.show();

                    let res
                    if (selectFile.type === 'application/gltf-buffer') {

                        parent_entity.makePrefabEntity('prefab.glf')
                        res = await _loadGlf(selectFile);
                    }
                    else if (selectFile.type === 'application/fbx') {
                        parent_entity.makePrefabEntity('prefab.fbx')
                        res = await _loadFbx(selectFile);
                    }
                    else {
                        _Context.messageModal.show({
                            msg: '지원하지 않는 파일 형식입니다.'
                        });
                        return;
                    }

                    console.log(res)

                    if (res.r === 'ok') {

                        parent_entity.geometryFile = {
                            id: res.fileInfo._id,
                            repo_ip: res.fileInfo.repo_ip,
                            format: selectFile.type
                        }



                        objViewer.objMng.addObject({
                            entity: res.object,
                            parent: parent_entity
                        });

                        if (parent_entity.materialFile) {

                            const material = await _Context.objViewer.objMng.loadMaterial({
                                fileID: parent_entity.materialFile.id,
                                repo_ip: parent_entity.materialFile.repo_ip,
                                onProgress: (progress) => {
                                    _Context.progressBox.update(progress);
                                }
                            });

                            res?.object?.traverse((child) => {
                                if (child.isMesh) {
                                    child.material = material;
                                }
                            });
                        }

                        //setup tree view
                        _treeView.updateTree(objViewer.elvis.root_dummy);
                        _prefabView.set(parent_entity);

                        await _Context.progressBox.closeDelay(100);

                        //message box
                        _Context.messageModal.show({
                            msg: 'load complete'
                        });
                        // }
                        // else {

                        // }
                    }
                    else {
                        _Context.messageModal.show({
                            msg: 'load fail'
                        });
                    }
                }
                else {
                    _Context.messageModal.show({
                        msg: '취소'
                    })
                }
            }
        }
    )


    _Context.body_container.appendChild(_rootElm);
    console.log('complete setup uiMain');

    return {
        element: _rootElm,
        menubar: _menuBar,
        objViewer: objViewer
    }

}