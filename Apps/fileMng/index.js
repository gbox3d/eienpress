import * as THREE from 'three';
import WEBGL from 'WebGL';

import objectViewerSetup from '../../../modules/comModules/objectViewer.js';

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

    const glWindow = document.querySelector('.gl-container');
    const loginStatus = document.querySelector('#userStatus')

    try {

        globalThis.theApp = {
            host_url: '',
            ui_container: document.querySelector('.ui-container'),
            modalContainer: document.querySelector('.modal-container')
        }

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

            theApp.root_path = res.repository+ '/' + res.user.userId;
            console.log(theApp.root_path);

            theApp.objViewer = await new Promise(resolve => {
                objectViewerSetup({
                    Context: theApp,
                    container: glWindow,
                    envMapFile : '63085141f020b41956bff664',
                    onComplete: function (scene) { // 모듈 초기화 완료
                        console.log('sceneEditorSetup complete');
                        console.log(scene);
                        resolve(scene);
                    }
                });
            });
            // theApp.objectReg = objectRegSetup(theApp);

            theApp.progressBox = progressBoxSetup(theApp);
            theApp.waitModal = waitModalSetup(theApp);
            theApp.messageModal = messageModal(theApp);
            // theApp.fileSelector = fileSelectorSetup(theApp);
            theApp.fileUploadForm = fileUploadFormSetup(theApp);

            // theApp.attrEditor = attrEditorSetup(theApp);
            theApp.uiMain = uiMainSetup(theApp);
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