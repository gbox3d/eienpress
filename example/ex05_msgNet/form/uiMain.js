import * as THREE from 'three';
import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";
import uiMenuBarSetup from './uiMenuBar.js';

import { comFileFindFile } from "../../../modules/comLibs/utils.js";
import objectViewerSetup from '../../../modules/elvisPlugins/objectViewer.js';
import { gameObject } from '../../../modules/elvisPlugins/gameObject.js';


import 'md5';
import objMng from '../../../modules/elvisPlugins/objMng.js';

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

    const roomName = 'test';

    const host_url = _Context.host_url;

    //menu bar 등록 
    const _menuBar = await uiMenuBarSetup(_Context);
    _rootElm.querySelector('.ui-menu-bar').appendChild(_menuBar.element);

    //메뉴 이밴트 처리 
    _menuBar.setCallback(async (menuName, btnName) => {
        console.log(menuName);

        if (btnName) {
            if (btnName === 'Hello') {
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
            else if (btnName === 'net') {
                let socket = _Context.clientSocket.socket;

                switch (menuName) {
                    case 'join':
                        {
                            let _result = await new Promise((resolve, reject) => {

                                socket.emit('join', {
                                    userId: _Context.userId,
                                    userName: _Context.userName
                                    // jwt_token : localStorage.getItem('jwt_token')
                                }, (evt) => {
                                    // console.log(evt);
                                    resolve(evt);
                                });
                            });

                            console.log(_result);

                            if (_result.r === 'ok') {
                            }
                        }
                        break;
                    case 'enter':
                        {
                            let _result = await new Promise((resolve, reject) => {
                                socket.emit('enterRoom', roomName, (evt) => {
                                    // console.log(evt);
                                    resolve(evt);
                                });
                            });
                            //join room success
                            console.log('join room', _result);

                            if (_result.r === 'ok') {

                                objViewer.objMng.addHostGameObject({
                                    socket: socket,
                                    roomName: roomName,
                                    sceneMng : objViewer,
                                    user : {
                                        userId : _Context.userId,
                                        id : socket.id,
                                        userName : _Context.userName
                                    }
                                });
                            }

                            // _Context.roomName = roomName;
                        }
                        break;
                    case 'exit':
                        {
                            socket.emit('leaveRoom', 'test', (evt) => {
                                console.log(evt);
                                objViewer.objMng.removeGameObject({
                                    socketId : socket.id
                                });
                            });

                            objViewer.objMng.removeAllGameObject();

                        }
                        break;
                    case 'userlist':
                        {

                            socket.emit('reqUserList', 'all', (evt) => {
                                console.log(evt);
                            });
                        }
                        break;
                    case 'send':
                        {
                            socket.emit('message', {
                                roomName: 'test',
                                message: 'hello'
                            }, (evt) => {
                                console.log(evt);
                            });
                        }
                }
            }
        }

    });

    // //환경멥 로딩
    let basicEnvMapId = await comFileFindFile({
        filename: 'basic_envmap'
    });

    const objViewer = await objectViewerSetup({
        Context: theApp,
        window_size: {
            width: 640,
            height: 240
        },
        isGrid: true,
        container: _glContainer,
        envMapFile: basicEnvMapId,
        cameraPosition: new THREE.Vector3(-169, 62, -140)
    });
    _Context.sceneMng = objViewer;

    objViewer.showEnvMap(true);

    objViewer.objMng.initGameObjectSystem();

    // let hostObj = new gameObject(_Context);
    // hostObj.name = 'host';

    // objViewer.objMng.addGameObject({
    //     entity: hostObj,
    // });

    objViewer.elvis.orbitControl.enablePan = false;
    objViewer.elvis.orbitControl.enableZoom = false;

    _Context.body_container.appendChild(_rootElm);
    console.log('complete setup uiMain');

    return {
        element: _rootElm,
        menubar: _menuBar,
        objViewer: objViewer
    }

}