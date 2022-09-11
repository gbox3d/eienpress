import * as THREE from 'three';
import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";
import uiMenuBarSetup from './uiMenuBar.js';

import { comFileFindFile } from "../../../modules/comLibs/utils.js";
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
                    case 'clear':
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
                                        msg : 'file is not fbx'
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
        // Context: theApp,
        // container: _glContainer,
        // envMapFile: basicEnvMapId,
        // cameraPosition: new THREE.Vector3(-169, -62, -140),
        // isGrid: false
    });

    quEditor.showEnvMap(true);

    const objViewer = quEditor

    _Context.body_container.appendChild(_rootElm);

    console.log('complete setup uiMain');

    return {
        element: _rootElm,
        menubar: _menuBar,
        quEditor: quEditor
    }

}