import * as THREE from 'three';
import WEBGL from 'three/addons/capabilities/WebGL.js';

// import {io} from 'socket.io-client';
//forms
import uiMainSetup from './form/uiMain.js';

//models
import waitModalSetup from 'ideon/waitModal.js';
import progressBoxSetup from 'ideon/progressBox.js';
import messageModal from 'ideon/messageModal.js';

import clientSocketSetup from './clientSocket.js';

async function main() {

    console.log(`THREEJS Version : ${THREE.REVISION} `);
    console.log(`WebGL Support : ${WEBGL.isWebGL2Available()}`);

    const loginStatus = document.querySelector('#userStatus')
    const socketIfo = document.querySelector('#socketIfo')

    try {

        globalThis.theApp = {
            host_url: '',
            modalContainer: document.querySelector('.modal-container'),
            body_container: document.querySelector('.body-container'),
            // modalContainer: document.querySelector('.modal-container')
        }

        theApp.progressBox = progressBoxSetup(theApp);
        theApp.waitModal = waitModalSetup(theApp);
        theApp.messageModal = messageModal(theApp);

        theApp.waitModal.show({
            msg: 'connecting to server...'
        })


        let res = await (await (fetch(`${theApp.host_url}/api/v2/users/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/text',
                'authorization': localStorage.getItem('jwt_token')
            }
        }))).json();

        console.log(res);

        // function addGuestUser(evt) {
        //     let remoteObj = new dummyObject(theApp);
        //     remoteObj.remoteUser = evt.user;
        //     remoteObj.remoteSocketId = evt.user.id;

        //     theApp.sceneMng.objMng.addGameObject({
        //         entity: remoteObj
        //     });

        //     remoteObj.receiveControl(
        //         {
        //             data : evt.data,
        //             user : evt.user
        //         }
        //     );
        // }

        // function removeGuestUser(evt) {
        //     let remoteObj = theApp.sceneMng.elvis.getObjectByProperty('remoteSocketId', evt.user.id);

        //     if (remoteObj) {
        //         remoteObj.removeFromParent();
        //     }
        // }



        if (res.r === 'ok') {

            loginStatus.innerHTML = `${res.user.userName} 님 환영합니다.`;
            theApp.root_path = res.repository + '/' + res.user.userId;
            theApp.uiMain = await uiMainSetup(theApp);
            theApp.userName = res.user.userName;
            theApp.userId = res.user.userId;

            theApp.clientSocket = await clientSocketSetup({
                sceneMng : theApp.uiMain.objViewer
            });

            document.querySelector('#socketInfo [name="socketId"]').innerText = `socketid : ${theApp.clientSocket.socket.id}`;

            // theApp.socket = socket;
            theApp.waitModal.close();

        }
        else {
            loginStatus.innerHTML = `로그인이 필요합니다. <a href="/login">로그인</a>`;
            // alert('로그인이 필요합니다.');
        }
    }
    catch (err) {
        console.error(err);
    }
}



export default main;