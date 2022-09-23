import * as THREE from 'three';
import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";
import uiMenuBarSetup from './uiMenuBar.js';

import { comFileFindFile } from "../../../modules/comLibs/utils.js";
import objectViewerSetup from '../../../modules/elvisPlugins/objectViewer.js';


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

            if (btnName === 'Viewer') {
                switch (menuName) {
                    case 'clear':
                        objViewer.objMng.clearObject();
                        break;
                    case 'camera reset':
                        objViewer.resetCamera();
                        break;
                    case 'show env':
                        {
                            objViewer.showEnvMap();
                        }
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
            else if (btnName === 'script') {
                switch (menuName) {
                    case 'hello':
                        {
                            const gameObject = objViewer.elvis.createGameObject({
                                entity: new THREE.Object3D()
                            });

                            await gameObject.setScriptFromUrl(`${host_url}/example/ex02_objectViewer/script_exam/hello.js`);

                            objViewer.elvis.root_dummy.add(gameObject.entity);
                            gameObject.start();

                        }
                        break;
                    case 'rotate':
                        {
                            let _targetObject = objViewer.elvis.root_dummy.children[0];

                            if (_targetObject) {

                                // // let cube = objViewer.addCube({ size: 100, color: 0xff0000 });
                                // let geometry = new THREE.BoxGeometry(50, 50, 50);

                                // let cube = objViewer.addMeshObject({
                                //     geometry: geometry
                                // })

                                const gameObject = objViewer.elvis.createGameObject({
                                    entity: _targetObject
                                });

                                await gameObject.setScriptFromUrl(`${host_url}/example/ex02_objectViewer/script_exam/rotation.js`);
                                gameObject.start();
                            }
                            else {
                                _Context.messageModal.show({
                                    msg: 'target object is not exist'
                                });
                            }

                        }
                        break;
                    case 'test2':
                        {
                            const geometry = new THREE.BoxGeometry(50, 50, 50);
                            const cube = objViewer.addMeshObject({
                                geometry: geometry
                            })


                            const gameObject = objViewer.elvis.createGameObject({
                                entity: cube
                            });

                            gameObject.addScriptFromUrl(`${host_url}/example/ex02_objectViewer/script_exam/destory.js`);
                            gameObject.start();

                        }
                        break;
                    case 'load from fileid':
                        {
                            let _entity = objViewer.elvis.root_dummy.children[0];
                            if (_entity) {

                                const gameObject = objViewer.elvis.createGameObject({
                                    entity: _entity
                                });

                                await gameObject.setScriptFromFileID({
                                    fileID: `63121b8e790b685903324fa3`
                                });
                                gameObject.start();
                            }
                            else {
                                _Context.messageModal.show({
                                    msg: 'target object is not exist'
                                });
                            }
                        }
                        break;

                }
            }
            else if (btnName === 'Object') {
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
                            const fileID = await comFileFindFile({
                                filename: 'chair.fbx'
                            })

                            if (fileID) {

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
                        }
                        break;
                }

            }

        }



    });

    //object viewer 등록
    let basicEnvMapId = await comFileFindFile({});


    const objViewer = await objectViewerSetup({
        Context: theApp,
        window_size: {
            width: 1024,
            height: 768
        },
        isGrid: true,
        container: _glContainer,
        // envMapFileFormat : '', // exr, hdr, pic , default : hdr
        envMapFile: basicEnvMapId
    });


    // console.log(objViewer.elvis.THREE)


    _Context.body_container.appendChild(_rootElm);

    console.log('complete setup uiMain');

    return {
        element: _rootElm,
        menubar: _menuBar,
        objViewer: objViewer
    }

}