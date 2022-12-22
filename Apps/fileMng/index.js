import * as THREE from 'three';
import WEBGL from 'three/addons/capabilities/WebGL.js';


//forms
import uiMainSetup from './form/uiMain.js';


//models
import waitModalSetup from '../../modules/comModules/waitModal.js';
import progressBoxSetup from '../../modules/comModules/progressBox.js';
import messageModal from '../../modules/comModules/messageModal.js';
import fileUploadFormSetup from '../../modules/comModules/fileUploadForm.js';


// import fileSelectorSetup from './modal/.js';

async function main() {

    console.log(`THREEJS Version : ${THREE.REVISION} `);
    console.log(`WebGL Support : ${WEBGL.isWebGL2Available()}`);

    // const glWindow = document.querySelector('.gl-container');
    const loginStatus = document.querySelector('#userStatus')

    try {


        globalThis.theApp = {
            host_url: '',
            body_container : document.querySelector('.body-container'),
            modalContainer: document.querySelector('.modal-container')
        }

        theApp.progressBox = progressBoxSetup(theApp);
        theApp.waitModal = waitModalSetup(theApp);
        theApp.messageModal = messageModal(theApp);
        theApp.fileUploadForm = fileUploadFormSetup(theApp);


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

        if (res.r === 'ok') {

            loginStatus.innerHTML = `${res.user.userName} 님 환영합니다.`;

            theApp.root_path = res.repository + '/' + res.user.userId;
            console.log(theApp.root_path);
            theApp.uiMain = await uiMainSetup(theApp);
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