import * as THREE from 'three';
import WEBGL from 'WebGL';

import sceneEditorSetup from './sceneEditor.js';

import geometryListSetup from './form/geometryList.js';
import materialListSetup from './form/materialList.js';
import objectListSetup from './form/objectList.js';
import uiMainSetup from './form/uiMain.js';


import fileSelectBoxSetup from './modal/fileSelectBox.js';
import msgBoxSetup from './modal/msgBox.js';

// import 'lodash';

// import { GLTFExporter } from 'GLTFExporter';
// import {GLTFLoader} from 'GLTFLoader';
// import {DRACOLoader} from 'DRACOLoader';

async function main() {

    console.log(`THREEJS Version : ${THREE.REVISION} `);
    console.log(`WebGL Support : ${WEBGL.isWebGL2Available()}`);

    const glWindow = document.querySelector('.gl-container');
    const loginStatus = document.querySelector('#userStatus')


    try {

        globalThis.theApp = {
            host_url: '',
            // root_path: ``,
            modalContainer: document.querySelector('.modal-container'),
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

            theApp.sceneEditor = await new Promise(resolve => {
                sceneEditorSetup({
                    Context : theApp,
                    container: glWindow,
                    onComplete: function (scene) { // 모듈 초기화 완료
                        console.log('sceneEditorSetup complete');
                        console.log(scene);
                        resolve(scene);
                    },
                    onSelectObject: function (obj) { // 선택된 오브젝트가 바뀌면 호출된다.
                        console.log('sceneEditorSetup select object');
                        console.log(obj);

                        obj.material?theApp.materialList.setSelect(obj.material.uuid):null;
                        obj.geometry?theApp.geometryList.setSelect(obj.geometry.uuid):null;
                        
                        theApp.objectList.setSelect(obj.uuid);
                    },
                    onObjectEditChange: function (obj) { // 오브젝트 의 속성값이 변하면 호출된다.
                        theApp.objectList.updateProperty( obj );
                    },
                });
            });
            
            theApp.uiMain = uiMainSetup(theApp);
            theApp.geometryList = geometryListSetup(theApp);
            theApp.materialList = materialListSetup(theApp);
            theApp.objectList = objectListSetup(theApp);
            theApp.fileSelectBox = fileSelectBoxSetup(theApp);
            theApp.msgBox = msgBoxSetup(theApp);
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