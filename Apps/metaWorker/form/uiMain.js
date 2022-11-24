import * as THREE from 'three';
import uiMenuBarSetup from './uiMenuBar.js';

import { comFileFindFile } from "../../../modules/comLibs/utils.js";
// import objectViewerSetup from '../../../modules/elvisPlugins/objectViewer.js';
import objectViewerSetup from '../../../modules/elvisPlugins/queditor.js';

import objTreeViewSetup from '../../../modules/comModules/objTreeView.js';
import attrViewSetup from '../../../modules/comModules/attrView.js';
import prefabViewSetup from './prefabView.js';


import 'md5';

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

    const host_url = _Context.host_url;

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

    //menu bar 등록 
    const _menuBar = await uiMenuBarSetup(_Context);
    _rootElm.querySelector('.ui-menu-bar').appendChild(_menuBar.element);

    const _refreshAllView = (_entity) => {
        _treeView.updateTree(objViewer.elvis.root_dummy); // 트리뷰업데이트
        _treeView.selectNode(_entity.uuid); //현제 선택된 엔티티 선택
        _attrView.set(_entity);
        _prefabView.set(_entity);
        objViewer.setSelectEntity(_entity);
    }

    //메뉴 이밴트 처리 
    _menuBar.setCallback(async (menuName, btnName) => {
        console.log(menuName);

        if (btnName) {
            if (btnName === 'Setup') {
                switch (menuName) {
                    case 'clear':
                        objViewer.objMng.clearObject();
                        break;
                    case 'camera reset':
                        objViewer.resetCamera();
                        break;
                    case 'enviroment map':
                        {
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
                if (menuName === 'new') {
                    objViewer.objMng.clearObject();
                    _treeView.updateTree(objViewer.elvis.root_dummy);
                }
                else if (menuName === 'save') {

                    const _selentity = objViewer.getSelectEntity();

                    if (!_selentity) {
                        _Context.messageModal.show({
                            msg: '저장할 오브젝트를 선택해 주세요.',
                        });
                        return;
                    }
                    if (_selentity.isElvisObject3D) {
                        _Context.messageModal.show({
                            msg: 'elvisobject3d 는 저장할 수 없습니다.',
                        });
                        return;
                    }
                    if (_selentity.name === 'root_dummy') {
                        _Context.messageModal.show({
                            msg: 'root_dummy 는 저장할 수 없습니다.',
                        });
                        return;
                    }

                    if (_selentity.name == '' || !_selentity.name) {
                        _Context.messageModal.show({
                            msg: '이름을 입력해 주세요.',
                        });
                        return;
                    }

                    console.log(`save ${_selentity.name}`);

                    let res = await objViewer.objMng.saveScene(
                        {
                            entity: _selentity,
                            fileID: _selentity.userData.fileInfo?.id,
                            repo_ip: _selentity.userData.fileInfo?.repo_ip,
                            name: _selentity.name,
                        }
                    );
                    console.log(res);

                    if (res.r === 'ok') {

                        _Context.messageModal.show({
                            msg: '저장되었습니다.',
                        });
                    }
                    else {
                        _Context.messageModal.show({
                            msg: '저장에 실패했습니다.',
                        });
                    }

                }
                else if (menuName === 'load') {

                    let sel_file = await new Promise((resolve, reject) => {
                        _Context.fileSelectBox.show(
                            (evt) => {
                                resolve(evt);
                            },
                            'scene'
                        )
                    });

                    console.log(sel_file)

                    if (!sel_file) {
                        await _Context.messageModal.show({
                            msg: '취소'
                        });
                        return;
                    }
                    else {

                        objViewer.objMng.clearObject();

                        const scene = await objViewer.objMng.loadScene({
                            fileID: sel_file.id,
                            repo_ip: sel_file.repo_ip
                        });

                        console.log(scene);

                        // const entity = await objViewer.objMng.loadPrefab({
                        //     fileID: sel_file.id,
                        //     repo_ip: sel_file.repo_ip
                        // });

                        objViewer.objMng.addEntity({
                            entity: scene,
                        });
                        // //update tree view
                        _treeView.updateTree(objViewer.elvis.root_dummy);
                        // _treeView.selectNode(entity.uuid);
                        // _attrView.set(entity);
                        // _prefabView.set(entity);
                    }

                    _Context.messageModal.close();

                }
            }
            else if (btnName === 'Add') {

                let _root = objViewer.getSelectEntity();

                if (menuName === 'prefab') {
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
                        return;
                    }
                    else {

                        //load prefab
                        const entity = await objViewer.objMng.loadPrefab({
                            fileID: sel_file.id,
                            repo_ip: sel_file.repo_ip
                        });

                        entity.position.copy(objViewer.getCameraTarget());

                        //resolve prefab
                        _Context.progressBox.show();
                        await objViewer.objMng.resolvePrefab({
                            entity: entity,
                            progress: (progress) => {
                                _Context.progressBox.update(progress);
                            }
                        });
                        _Context.progressBox.closeDelay(100);

                        //커서에 올리기 
                        if (entity) {
                            objViewer.copyEntityToCursor(entity);
                        }



                        // //register prefab
                        // objViewer.objMng.attachEntity({
                        //     entity: entity,
                        //     parent: _root
                        // });

                        // objViewer.setSelectEntity(entity);
                        // console.log(entity);

                        // // //update tree view
                        // _treeView.updateTree(objViewer.elvis.root_dummy);
                        // _treeView.selectNode(entity.uuid);
                        // _attrView.set(entity);

                    }


                    // console.log(objViewer.elvis.camera.target);
                }
                else if (menuName === 'group') {

                    let _entity = new THREE.Group();
                    _entity.position.copy(objViewer.elvis.orbitControl.target);
                    objViewer.objMng.addEntity({
                        entity: _entity,
                        parent: _root
                    });
                    // objViewer.setSelectEntity(_entity);

                    //update tree view
                    _treeView.updateTree(objViewer.elvis.root_dummy);
                    _treeView.selectNode(_root?.uuid);
                    // _attrView.set(_entity);

                }
            }
            else if (btnName === 'Edit') {
                if (menuName === 'del') {

                    let _selEntity = objViewer.getSelectEntity()

                    if (_selEntity?.name !== 'root_dummy') {

                        objViewer.objMng.deleteEntity({
                            entity: objViewer.getSelectEntity()
                        });
                        objViewer.setSelectEntity();
                        _treeView.updateTree(objViewer.elvis.root_dummy);
                        _attrView.set(null);
                    }
                }
                else if(menuName === 'clone'){
                    let _selEntity = objViewer.getSelectEntity()

                    if (_selEntity?.name !== 'root_dummy') {

                        let _entity = _selEntity.clone();
                        objViewer.objMng.addEntity({
                            entity: _entity,
                            parent: _selEntity.parent
                        });
                        objViewer.setSelectEntity(_entity);

                        //update tree view
                        _treeView.updateTree(objViewer.elvis.root_dummy);
                        _treeView.selectNode(_entity.uuid);
                        _attrView.set(_entity);
                    }
                }
                else if (menuName === 'copy') {

                    const entity = objViewer.getSelectEntity();
                    if (entity) {
                        objViewer.copyEntityToCursor(entity);
                    }
                }
                else if (menuName === 'paste') {
                    let entity = objViewer.pasteEntityToCursor(
                        {
                            position: objViewer.elvis.orbitControl.target.clone(),
                            isClone: false //붙이고지우기 
                        }
                    );

                    if (entity) {
                        _treeView.updateTree(objViewer.elvis.root_dummy);
                        // _treeView.selectNode(entity.uuid);
                        _attrView.set(entity);
                    }

                }
                else if (menuName === 'clrCursor') {
                    objViewer.removeCursoredEntity();
                }
                else if (menuName === 'resolveAll') {
                    _Context.progressBox.show();

                    await objViewer.elvis.root_dummy.traverse(async (entity) => {
                        if (entity.isElvisObject3D && !entity.resolved) {
                            await objViewer.objMng.resolvePrefab({
                                entity: entity,
                                progress: (progress) => {
                                    _Context.progressBox.update(progress);
                                }
                            });
                        }
                    });

                    _Context.progressBox.closeDelay(100);
                }
            }

        }


    });

    const objViewer = await objectViewerSetup({
        Context: theApp,
        window_size: {
            width: 1024,
            height: 768
        },
        isGrid: true,
        container: _glContainer,
        // envMapFileFormat : '', // exr, hdr, pic , default : hdr
        // envMapFile: basicEnvMapId,
        onPointerIntersectDown: function (evt) {
            console.log(evt);

            let _root = objViewer.getSelectEntity();

            //커서에 오브잭트가 올려져있는 상황 
            if (objViewer.getCursoredEntity()) {

                if (_root?.isElvisObject3D !== true) {

                    if (evt.altkey) {

                        let entity = objViewer.pasteEntityToCursor({
                            position: evt.intersect.point,
                            parent: _root,
                            isClone: true
                        })
                        
                        if (entity) {
                            _refreshAllView(entity);
                        }
                    }
                    else {

                        if (evt.type === 'intersect-object') {

                            let entity = objViewer.pasteEntityToCursor({
                                position: evt.intersect.point,
                                parent: _root,
                                isClone: true
                            })
                            

                            if (entity) {
                                _refreshAllView(entity);
                                // _treeView.updateTree(objViewer.elvis.root_dummy, objViewer.getSelectEntity());
                                // _attrView.set(objViewer.getSelectEntity());
                            }
                        }
                    }
                    objViewer.removeCursoredEntity(); //커서 클리어 
                }
                else {
                    _Context.messageModal.show({
                        msg: 'elvis object3d 는 자식을 가질수없습니다.'
                    })
                }
            }
        },
        onSelectObject: function (entity) {
            _treeView.selectNode(entity.uuid);
            _attrView.set(entity);
        },
        onObjectEditChange: function (entity) {
            // _treeView.updateNode(entity.uuid);
            _attrView.set(entity);
        }

    });

    //setup default envmap
    {
        _Context.progressBox.show();
        const basicEnvMap = await comFileFindFile({
            filename: 'basic_envmap'
        });

        await objViewer.objMng.setEnvMap({
            type: basicEnvMap[0].fileType,
            file_id: basicEnvMap[0]._id,
            repo_ip: basicEnvMap[0].repo_ip,
            onProgress: (progress) => {
                _Context.progressBox.update(progress);
            },
            bShow: true
        });

        _Context.progressBox.closeDelay(100);
    }


    // objViewer.showEnvMap(true);

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

    _treeView.setOnDropedItem((evt) => {

        // let _dest = objViewer.getEntityByuuid(evt.target.dataset.uuid);
        let _dest = objViewer.getEntityByuuid(evt.target.closest('li').dataset.uuid);
        if (_dest.isGroup) {
            let _src = objViewer.getEntityByuuid(evt.dataTransfer.getData('uuid'));

            if (_dest !== _src) {
                _dest.attach(_src);
                _treeView.updateTree(objViewer.elvis.root_dummy, objViewer.getSelectEntity());
            }
        }

    });


    //트리뷰 초기화 
    _treeView.updateTree(objViewer.elvis.root_dummy);


    //attr view 등록
    const _attrView = await attrViewSetup(
        _Context,
        _rootElm.querySelector('.prefab-attr'),
        (entity) => { //onchange
            _treeView.updateTree(objViewer.elvis.root_dummy);
            _refreshAllView(entity);
        }
    );

    // _attrView.setOnChanged((entity) => {
    //     _treeView.updateTree(objViewer.elvis.root_dummy);
    // });



    //prefab view 등록
    const _prefabView = await prefabViewSetup(
        _Context,
        _rootElm.querySelector('.prefab-view')
    );


    _Context.body_container.appendChild(_rootElm);

    console.log('complete setup uiMain');

    return {
        element: _rootElm,
        menubar: _menuBar,
        objViewer: objViewer
    }

}