import * as THREE from 'three';
import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";
import uiMenuBarSetup from './uiMenuBar.js';

import { comFileFindFile, comFileDownload, comFileGetDetail } from "../../../modules/comLibs/utils.js";
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
                            if (quEditor.getSelectObject()) {
                                let _clone = quEditor.getSelectObject().clone();
                                quEditor.objMng.addObject({
                                    entity: _clone,
                                });
                            }
                        }
                        break;
                }
            }
            else if (btnName === 'Entity') {
                switch (menuName) {
                    case 'cube':
                        {
                            let geometry = new THREE.BoxGeometry(30, 30, 30);

                            objViewer.objMng.addMeshObject({
                                geometry: geometry
                            });
                        }
                        break;
                    case 'plane':
                        {
                            let geometry = new THREE.PlaneGeometry(30, 30);
                            objViewer.objMng.addMeshObject({
                                geometry: geometry
                            });

                        }
                        break;
                    case 'sphere':
                        {
                            let geometry = new THREE.SphereGeometry(30, 30, 30);
                            objViewer.objMng.addMeshObject({
                                geometry: geometry
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
                                geometry: geometry
                            });
                        }
                        break;
                    case 'cone':
                        {
                            const geometry = new THREE.ConeGeometry(30, 30, 30);
                            objViewer.objMng.addMeshObject({
                                geometry: geometry
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
                                    ''
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

                                        objViewer.elvis.root_dummy.add(obj);
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
                                    ''
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
                                matJson.images = null;
                                matJson.map = null;
                                matJson.textures = null;

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
                                    directory: '',
                                    isPublic: true,
                                    md5: hash
                                });

                                console.log(_res)
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
                                        ''
                                    )
                                });

                                if (!sel_file) {
                                    await _Context.messageModal.show({
                                        msg: '취소'
                                    })
                                    break;
                                }

                                // let fileID = await comFileFindFile({
                                //     filename: 'material-test'
                                // });

                                // let _detail = await comFileGetDetail({
                                //     fileID
                                // });

                                // console.log(_detail)

                                let resp = await comFileDownload({
                                    fileID: sel_file.id,
                                    hostUrl: sel_file.repo_ip
                                })

                                let matJsondata = await resp.json()

                                console.log(matJsondata)

                                const _loader = new THREE.MaterialLoader();

                                let material = _loader.parse(matJsondata);

                                console.log(material)

                                if (material.userData.texture) {
                                    let _tex = await quEditor.objMng.loadTexture({
                                        textureFile: material.userData.texture.id,
                                        repo_ip: material.userData.texture.repo_ip,
                                        onProgress: (progress) => {
                                            console.log(progress)
                                            _Context.progressBox.update(progress);
                                        }
                                    });
                                    material.map = _tex;

                                    sel_node.material = material;
                                }
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
        }
        else if (btnName === 'Scene') {
            switch (menuName) {
                case 'save':
                    {

                        // console.log(quEditor.elvis.scene)
                        const _saveObj = quEditor.elvis.root_dummy.clone();
                        let _json = _saveObj.toJSON()
                        console.log(_json)

                    }
                    break;
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
            console.log(obj.id);
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