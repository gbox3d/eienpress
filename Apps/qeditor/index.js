import * as THREE from 'three';
import WEBGL from 'WebGL';

import waitModalSetup from '../../../modules/comModules/waitModal.js';
import progressBoxSetup from '../../../modules/comModules/progressBox.js';
import fileSelectBoxSetup from '../../../modules/comModules/fileSelectBox.js';

import cuEditorSetup from './cuEditor.js';
import galleryRegSettup from './modal/galleryReg.js';
import spaceRegSetup from './modal/spaceReg.js';

import uiMainSetup from './form/uiMain.js';
import uiGalleryEditorSetup from './form/uiGalleryEditor.js';


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
            jwt_token: localStorage.getItem('jwt_token'),
        }

        let res = await (await (fetch(`${theApp.host_url}/api/v2/users/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/text',
                'authorization': theApp.jwt_token
            }
        }))).json();

        console.log(res);

        if (res.r === 'ok') {

            loginStatus.innerHTML = `${res.user.userName} 님 환영합니다.`;

            theApp.root_path = res.repository + '/' + res.user.userId;
            console.log(theApp.root_path);

            theApp.editor = await new Promise(resolve => {

                cuEditorSetup({
                    Context: theApp,
                    container: glWindow,
                    onComplete: function (scene) { // 모듈 초기화 완료
                        console.log('sceneEditorSetup complete');
                        console.log(scene);
                        resolve(scene);
                    },
                    onSelectObject: function (obj) { // 선택된 오브젝트가 바뀌면 호출된다.
                        console.log('sceneEditorSetup select object');
                        console.log(obj);
                        theApp.uiGalleryEditor.updateObjectProperty({
                            object: obj
                        })
                        // this.orbitControl.enabled
                        // theApp.uiMain.TrigersTab.updateTab(obj)

                        
                    },
                    onObjectEditChange: function (obj) { // 오브젝트 의 속성값이 변하면 호출된다.
                        // theApp.objectList.updateProperty(obj);
                        theApp.uiGalleryEditor.updateObjectProperty({
                            object: obj
                        })
                    },
                });

            })

            theApp.waitModal = waitModalSetup(theApp);
            theApp.progressBox = progressBoxSetup(theApp);
            theApp.fileSelectBox = fileSelectBoxSetup(theApp);
            
            theApp.galleryReg =  galleryRegSettup(theApp);
            theApp.spaceRegModal = spaceRegSetup(theApp);

            theApp.uiMain = await uiMainSetup(theApp);
            theApp.uiGalleryEditor = uiGalleryEditorSetup(theApp);
            
            //check hover mouse pointer
            glWindow.addEventListener('onfocus', (e) => {
                theApp.editor.controls.enabled = true;
                console.log('onfocus');
            });
            glWindow.addEventListener('onblur', (e) => {
                theApp.editor.controls.enabled = false;
            });

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