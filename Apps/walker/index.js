import * as THREE from 'three';
import WEBGL from 'WebGL';

import sceneWalkerSetup from './sceneWalker.js';


async function login() {
    const loginForm = document.querySelector('#login')
    loginForm.classList.remove('hide')

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        let _form = e.target

        try {
            let _result = await (await fetch('/api/v2/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: _form.userId.value,
                    userPw: _form.userPw.value
                })
            })).json()

            console.log(_result)
            if (_result.r === 'ok') {
                localStorage.setItem('jwt_token', _result.info.token)
                location.href = './'
            }
            else {
                alert(_result.info)
            }
        }
        catch (err) {
            console.log(err)
            alert(err.message)
        }
    })
}

async function main() {

    console.log(`THREEJS Version : ${THREE.REVISION} `);
    console.log(`WebGL Support : ${WEBGL.isWebGL2Available()}`);

    const jwt_token = localStorage.getItem('jwt_token')

    if (jwt_token === null) {
        alert('로그인이 필요합니다.');
        login();
    }
    else {

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

                // loginStatus.innerHTML = `${res.user.userName} 님 환영합니다.`;

                theApp.root_path = `${res.repository}/${res.user.userId}`;
                console.log(theApp.root_path);

                theApp.sceneManager = await new Promise(resolve => {
                    sceneWalkerSetup({
                        Context: theApp,
                        // container: glWindow,
                        onComplete: function (smgr) { // 모듈 초기화 완료
                            console.log('sceneManagerSetup complete');
                            resolve(smgr);
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
                // loginStatus.innerHTML = `로그인이 필요합니다. <a href="/login">로그인</a>`;
                login();
                // alert('로그인이 필요합니다.');
            }
        }
        catch (err) {
            console.error(err);
        }

    }

}



export default main;