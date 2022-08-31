import * as THREE from 'three';
import WEBGL from 'WebGL';

import { comFileFindFile } from "../../modules/comLibs/utils.js";
import objectViewerSetup from '../../modules/comModules/objectViewer.js';

//forms
// import uiMainSetup from './form/uiMain.js';
// import uiMenuBarSetup from './form/uiMenuBar.js';

//models
import waitModalSetup from '../../modules/comModules/waitModal.js';
import progressBoxSetup from '../../modules/comModules/progressBox.js';
import messageModal from '../../modules/comModules/messageModal.js';


// import fileSelectorSetup from './modal/.js';

async function main() {

    console.log(`THREEJS Version : ${THREE.REVISION} `);
    console.log(`WebGL Support : ${WEBGL.isWebGL2Available()}`);

    const glWindow = document.querySelector('.gl-container');
    const loginStatus = document.querySelector('#userStatus')

    try {
        
        globalThis.theApp = {
            host_url: '',
            menubar_container: document.querySelector('.menubar-container'),
            ui_container: document.querySelector('.ui-container'),
            modalContainer: document.querySelector('.modal-container')
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

        if (res.r === 'ok') {

            loginStatus.innerHTML = `${res.user.userName} 님 환영합니다.`;

            theApp.root_path = res.repository + '/' + res.user.userId;
            // theApp.uiMenuBar = await uiMenuBarSetup(theApp);
            // theApp.uiMain = await uiMainSetup(theApp);

            //환경멥 로딩
            let basicEnvMapId = await comFileFindFile({});

            theApp.objViewer = await new Promise(resolve => {
                objectViewerSetup({
                    Context: theApp,
                    container: glWindow,
                    // envMapFileFormat : '', // exr, hdr, pic , default : hdr
                    envMapFile: basicEnvMapId,
                    onComplete: function (scene) { // 모듈 초기화 완료
                        console.log('sceneEditorSetup complete');
                        console.log(scene);
                        resolve(scene);
                    }
                });
            });

            //plane 추가 
            let redPlaneObj = theApp.objViewer.addPlane({color : 0xff0000});
            redPlaneObj.position.set(0,0,0);

            let greenPlaneObj = theApp.objViewer.addPlane({color : 0x00ff00});
            greenPlaneObj.position.set(0,0,-50);
            
            let bluePlaneObj = theApp.objViewer.addPlane({color : 0x0000ff});
            bluePlaneObj.position.set(0,0,50);

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