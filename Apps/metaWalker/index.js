import * as THREE from 'three';
import WEBGL from 'WebGL';

import waitModalSetup from '../../../modules/comModules/waitModal.js';
import progressBoxSetup from '../../../modules/comModules/progressBox.js';
import messageModal from '/modules/comModules/messageModal.js';

import { comFileFindFile } from "../../../modules/comLibs/utils.js";

import sceneWalkerSetup from '../../modules/elvisPlugins/sceneWalker.js';
// import { walker } from './object/walker.js';

import clientSocketSetup from './clientSocket.js';
import { walkerGameObject } from '../../../modules/elvisPlugins/gameObject.js';

// import objMng from '../../modules/elvisPlugins/objMng.js';

async function main() {

    // 634e8283526a0a6df4d8f5c1
    //test gallery : https://cam2us.ubiqos.co.kr:24030/Apps/gWalker/?gid=628a00bf6fdf6bbe514dfe50

    console.log(`THREEJS Version : ${THREE.REVISION} `);
    console.log(`WebGL Support : ${WEBGL.isWebGL2Available()}`);

    globalThis.theApp = {
        host_url: '',
        modalContainer: document.querySelector('.modal-container')
    }

    theApp.waitModal = waitModalSetup(theApp);
    theApp.progressBox = progressBoxSetup(theApp);
    theApp.messageModal = messageModal(theApp);

    theApp.chatWindow = document.querySelector('#chatWindow');


    function _addChatMessage(user, message) {

        const _ul = theApp.chatWindow.querySelector('#chatList')
        const _li = document.createElement('li');

        _li.innerHTML = `${user.userName} : ${message}`;
        _ul.appendChild(_li);
        _ul.scrollTop = _ul.scrollHeight;
    }
    theApp.chatWindow.querySelector('#chatInput').addEventListener('focusin', (e) => {
        console.log('focus in');
        theApp.renderEngine.setEnableKeyInput(false);
    });

    theApp.chatWindow.querySelector('#chatInput').addEventListener('focusout', (e) => {
        console.log('focus out');
        theApp.renderEngine.setEnableKeyInput(true);
    });

    theApp.chatWindow.querySelector('#chatInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const msg = e.target.value;
            if (msg) {

                theApp.clientSocket.sendMessage(msg);
                _addChatMessage(theApp.user, msg);
            }
            e.target.value = '';
        }
    });

    theApp.chatWindow.querySelector('#chatSend').addEventListener('click', (e) => {
        console.log('chatSend');
        const msg = theApp.chatWindow.querySelector('#chatInput').value;
        if (msg) {
            theApp.clientSocket.sendMessage(msg);
            _addChatMessage(theApp.user, msg);

        }
        e.target.value = '';
    });



    try {
        theApp.waitModal.show({
            msg: 'connecting to server...'
        });

        const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });

        console.log(params.gid);
        theApp.sceneFileId = params.gid;

        let res = await (await (fetch(`${theApp.host_url}/api/v2/users/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/text',
                'authorization': localStorage.getItem('jwt_token')
            }
        }))).json();

        console.log(res);

        if (res?.r === 'ok') {

            theApp.userName = res.user.userName;
            theApp.userId = res.user.userId;
            theApp.user = res.user;
            theApp.user.room = theApp.sceneFileId;



            // //환경멥 로딩
            let basicEnvMapId = await comFileFindFile({
                filename: 'basic_envmap'
            });

            const renderEngine = await sceneWalkerSetup({
                Context: theApp,
                // sceneFileID: params.gid,
                // envMapFile: basicEnvMapId,
                onSelectObject: (obj) => {
                    console.log(obj.parent.name);
                }
            });

            //환경멥 세팅 
            {
                const basicEnvMap = await comFileFindFile({
                    filename: 'basic_envmap'
                });

                await renderEngine.objMng.setEnvMap({
                    type: basicEnvMap[0].fileType,
                    file_id: basicEnvMap[0]._id,
                    repo_ip: basicEnvMap[0].repo_ip,
                    onProgress: (progress) => {
                        // console.log(progress)
                        // _Context.progressBox.update(progress);
                    },
                    bShow: true
                });
            }

            renderEngine.objMng.initGameObjectSystem();

            //socket io setup
            theApp.clientSocket = await clientSocketSetup({
                renderEngine,
                ioServerUrl: 'http://gears001.iptime.org:21041',
                onMessage: (evt) => {
                    _addChatMessage(evt.user, evt.msg);
                }
            });

            const socket = theApp.clientSocket.socket;
            //join server
            {

                let result = await new Promise((resolve, reject) => {
                    socket.emit('join', {
                        userId: theApp.userId,
                        userName: theApp.userName
                    }, (evt) => {
                        resolve(evt);

                    });
                });

                console.log('join server ', result);


                if (result.r !== 'ok') {
                    // theApp.waitModal.hide();
                    theApp.messageModal.show({
                        msg: 'server connection error'
                    });

                    return;
                }
            }

            //enter room
            {
                let result = await new Promise((resolve, reject) => {
                    socket.emit('enterRoom', theApp.sceneFileId, (evt) => {
                        resolve(evt);
                    });
                });
                //join room success
                console.log('enter room', result);

                theApp.clientSocket.setUserInfo({
                    userId: theApp.userId,
                    userName: theApp.userName,
                    room: theApp.sceneFileId
                });

                if (result.r === 'ok') {

                    //scene 로딩
                    renderEngine.objMng.clearObject();
                    const scene = await renderEngine.objMng.loadScene({
                        fileID: theApp.sceneFileId,
                        repo_ip: theApp.host_url
                    });

                    console.log(scene);

                    renderEngine.objMng.addEntity({
                        entity: scene,
                    })

                    console.log(renderEngine);

                    const hostPlayer = new walkerGameObject({
                        engine: renderEngine,
                        playerHeight: 25,
                        playerWidth: 5,
                        socket: socket,
                        user: theApp.user
                    });
                    renderEngine.objMng.addGameObject({
                        entity: hostPlayer,
                    });

                    theApp.renderEngine = renderEngine;

                }
                else {
                    theApp.messageModal.show({
                        msg: 'room enter error'
                    });
                    return
                }
            }

            theApp.waitModal.close();
        }
        else {

            theApp.waitModal.close();

            await theApp.messageModal.showWait({
                msg: '로그인이 필요합니다.'
            });

            //goto login page
            window.location.href = '/login';


        }

    }
    catch (e) {
        console.log(e);
        theApp.waitModal.close();
        theApp.messageModal.show({
            msg: `Error : ${e}`
        });
        // theApp.waitModal.show(`에러 발생 : ${e.message}`);
        // alert(`에러 발생 : ${e.message}`);
    }

}



export default main;