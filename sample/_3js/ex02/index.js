import * as THREE from 'three';
import WEBGL from 'WebGL';
import { FBXLoader } from 'fbxLoader';

import sceneEditorSetup from '../worldTool/sceneEditor.js';

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

            const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
            hemiLight.position.set(0, 200, 0);
            theApp.sceneEditor.scene.add(hemiLight);

            const dirLight = new THREE.DirectionalLight(0xffffff);
            dirLight.position.set(0, 200, 100);
            dirLight.castShadow = true;
            dirLight.shadow.camera.top = 180;
            dirLight.shadow.camera.bottom = - 100;
            dirLight.shadow.camera.left = - 120;
            dirLight.shadow.camera.right = 120;
            theApp.sceneEditor.scene.add(dirLight);

            // let resp = await (fetch(`/api/v2/webdisk/readFile`, {
            //     method: 'POST',
            //     body: `/home/ubiqos/work/repository/test2/Meshes/Objects_2/Sofa_2/\nBase.png`,
            //     headers: {
            //         'Content-Type': 'text/plain',
            //         'authorization': localStorage.getItem('jwt_token')
            //     }
            // }))
            // const textureLoader = new THREE.TextureLoader();
            // let texture = null
            // if (resp.status == 200) {
            //     let blob = await resp.blob();
            //     texture = await new Promise((resolve, reject) => {
            //         let imgUrl = URL.createObjectURL(blob); //url 객체로 변환
            //         // let texture = new THREE.Texture(blob);
            //         textureLoader.load(imgUrl, function (texture) {
            //             // texture.needsUpdate = true;
            //             // let material = new THREE.MeshBasicMaterial({ map: texture, color: 0xffffff, name: _file });
            //             // scope.materialList['Kitamuki1.jpg'] = material;
            //             resolve(texture);
            //         });
            //     })
            // }
            // console.log(texture);

            

            let object = await theApp.sceneEditor.addFbxObject('/home/ubiqos/work/repository/test2/Meshes/Objects_2/Sofa_2/Sofa_2.fbx', {
            });

            object.scale.multiplyScalar(0.01);

            let texture = await theApp.sceneEditor.loadTextureFromWebDisk('/home/ubiqos/work/repository/test2/Meshes/Objects_2/Sofa_2/Base.png');

            object.traverse(function (child) {
                if (child.isMesh) {
                    child.material.map = texture;
                    child.material.needsUpdate = true;
                }
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