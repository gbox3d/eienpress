import * as THREE from 'three';
import WEBGL from 'WebGL';
import { FBXLoader } from 'fbxLoader';

import sceneEditorSetup from '../../../Apps/worldTool/sceneEditor.js';

async function main() {

    console.log(`THREEJS Version : ${THREE.REVISION} `);
    console.log(`WebGL Support : ${WEBGL.isWebGL2Available()}`);

    const glWindow = document.querySelector('.gl-container');
    const loginStatus = document.querySelector('#userStatus')


    try {

        globalThis.theApp = {
            host_url: '',
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

            theApp.root_path = res.repository + '/' + res.user.userId;
            console.log(theApp.root_path);

            theApp.sceneEditor = await new Promise(resolve => {
                sceneEditorSetup({
                    Context: theApp,
                    container: glWindow,
                    onComplete: function (sceneEditor) { // 모듈 초기화 완료
                        console.log('sceneEditorSetup complete');
                        console.log(sceneEditor);

                        resolve(sceneEditor);
                    },
                    onSelectObject: function (obj) { // 선택된 오브젝트가 바뀌면 호출된다.
                        console.log('sceneEditorSetup select object');
                        console.log(obj);


                    },
                    onObjectEditChange: function (obj) { // 오브젝트 의 속성값이 변하면 호출된다.
                        // theApp.objectList.updateProperty( obj );
                    },
                });
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