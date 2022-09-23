import * as THREE from 'three';
import WEBGL from 'WebGL';

// import { comFileFindFile } from "../../modules/comLibs/utils.js";
// import objectViewerSetup from '../../modules/comModules/objectViewer.js';


//forms
import uiMainSetup from './form/uiMain.js';

//models
import waitModalSetup from '../../modules/comModules/waitModal.js';
import progressBoxSetup from '../../modules/comModules/progressBox.js';
import messageModal from '../../modules/comModules/messageModal.js';
import fileSelectBoxSetup from '../../modules/comModules/fileSelectBoxFromDB.js';


// import fileSelectorSetup from './modal/.js';

async function main() {

    console.log(`THREEJS Version : ${THREE.REVISION} `);
    console.log(`WebGL Support : ${WEBGL.isWebGL2Available()}`);

    const glWindow = document.querySelector('.gl-container');
    const loginStatus = document.querySelector('#userStatus')

    try {
        
        globalThis.theApp = {
            host_url: '',
            // menubar_container: document.querySelector('.menubar-container'),
            // ui_container: document.querySelector('.ui-container'),
            modalContainer: document.querySelector('.modal-container'),
            body_container: document.querySelector('.body-container'),
            // modalContainer: document.querySelector('.modal-container')
        }

        theApp.progressBox = progressBoxSetup(theApp);
        theApp.waitModal = waitModalSetup(theApp);
        theApp.messageModal = messageModal(theApp);
        theApp.fileSelectBox = fileSelectBoxSetup(theApp);
        
        

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
            theApp.uiMain = await uiMainSetup(theApp);


            // theApp.uiMenuBar = await uiMenuBarSetup(theApp);
            // theApp.uiMain = await uiMainSetup(theApp);

            // //환경멥 로딩
            // let basicEnvMapId = await comFileFindFile({
            //     filename : 'basic_envmap'
            // });

            // theApp.objViewer = await objectViewerSetup({
            //     Context: theApp,
            //     container: glWindow,
            //     envMapFile: basicEnvMapId,
            //     cameraPosition : new THREE.Vector3(-169, -62, -140),
            //     isGrid : false
            // });

            // const geometry = new THREE.TorusGeometry(30,
            //     10, 30, 30);
            // const gameobject = theApp.objViewer.elvis.createGameObject({
            //     geometry: geometry,
            //     material: theApp.objViewer.elvis.defaultMaterial
            // });

            // theApp.objViewer.elvis.root_dummy.add(gameobject.entity);
            // theApp.objViewer.showEnvMap(true);


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