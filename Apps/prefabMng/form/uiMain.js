import * as THREE from 'three';
import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";


import { comFileFindFile } from "../../../modules/comLibs/utils.js";

import elvisObject3d from '../../../modules/elvisPlugins/elvisObject3d.js';
import objectViewerSetup from '../../../modules/elvisPlugins/queditor.js';

import uiMenuBarSetup from './uiMenuBar.js';
import objTreeViewSetup from './objTreeView.js';
import attrViewSetup from './attrView.js';

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
            <div class='gl-container'></div>
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
                    modelFile: file_id,
                    repo_ip: res.data.repo_ip,
                });

                return {
                    object: obj,
                    fileInfo: res.data
                };
            }
        }
        else {
            _Context.messageModal.show({
                msg: 'fbx 파일만 지원합니다.'
            })
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

                                _treeView.updateTree(objViewer.elvis.root_dummy);

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


                                }

                                _Context.messageModal.close();

                            }
                            break;
                        case 'save':
                            {
                                const _selentity = objViewer.getSelectEntity();

                                if (_selentity.userData.fileInfo?.id) {
                                    //update
                                    objViewer.objMng.savePrefab(
                                        {
                                            entity: _selentity,
                                            id : _selentity.userData.fileInfo.id, //id 가 주어지면 update
                                            repo_ip: _selentity.userData.fileInfo.repo_ip
                                        }
                                    );


                                }
                                else {
                                    //신규 생성 

                                    if (_selentity.type === "elvisObject3d") {
                                        let _name = prompt('저장할 이름을 입력하세요.');
                                        if (_name) {
                                            // let _data = _selentity.toJSON();
                                            // console.log(_data);

                                            objViewer.objMng.savePrefab(
                                                {
                                                    entity: _selentity,
                                                    name: _name
                                                }
                                            );

                                        }
                                    }
                                    else {
                                        _Context.messageModal.show({
                                            msg: `elvisObject3d 타입만 저장할 수 있습니다.`
                                        })
                                    }

                                }
                                console.log(_selentity);
                            }
                            break;
                    }
                }
                else if (btnName === 'Entity') {
                    switch (menuName) {
                        case 'fbx':
                            {
                                let _rootDummy = new elvisObject3d({
                                    isPrefabRoot: true,
                                    assetType: `prefab.fbx`
                                });

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
                                if (fileID) {

                                    const res = await _loadFbx(selectFile);

                                    if (res) {
                                        let obj = res.object;

                                        console.log(res)

                                        _rootDummy.makePrefabEntity('prefab.fbx')
                                        _rootDummy.add(obj);
                                        _rootDummy.geometryFile = {
                                            id: res.fileInfo._id,
                                            repo_ip: res.fileInfo.repo_ip,
                                            format: 'fbx'
                                        }

                                        objViewer.objMng.addObject({
                                            entity: _rootDummy
                                        });

                                        //setup tree view
                                        _treeView.updateTree(objViewer.elvis.root_dummy);

                                        //message box
                                        _Context.messageModal.show({
                                            msg: 'load complete'
                                        });
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
                                break;
                            }
                        case 'material':
                            {

                            }
                            break;
                    }
                }
                else if (btnName === 'Edit') {
                    switch (menuName) {
                        case 'resolve':
                            {
                                const _selentity = objViewer.getSelectEntity();
                                await _selentity.resolve(objViewer.objMng);
                                _treeView.updateTree(objViewer.elvis.root_dummy); // 트리뷰업데이트
                                _treeView.selectNode(_selentity.uuid); //현제 선택된 엔티티 선택
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

        console.log(obj);

    });
    //트리뷰 초기화 
    _treeView.updateTree(objViewer.elvis.root_dummy);


    //attr view 등록
    const _attrView = await attrViewSetup(
        _Context,
        _rootElm.querySelector('.prefab-attr')
    );


    _Context.body_container.appendChild(_rootElm);
    console.log('complete setup uiMain');

    return {
        element: _rootElm,
        menubar: _menuBar,
        objViewer: objViewer
    }

}