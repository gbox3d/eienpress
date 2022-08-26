import * as THREE from 'three';
import WEBGL from 'WebGL';

import waitModalSetup from '../../../modules/comModules/waitModal.js';
import progressBoxSetup from '../../../modules/comModules/progressBox.js';
import objectInfoBoxSetup from '../../modules/comModules/objectInfoBox.js';

import sceneWalkerSetup from './sceneWalker.js';

import {getGalleryDetail, getObjectDetail} from '../../modules/comLibs/utils.js';

async function main() {

    //test gallery : https://cam2us.ubiqos.co.kr:24030/Apps/gWalker/?gid=628a00bf6fdf6bbe514dfe50


    console.log(`THREEJS Version : ${THREE.REVISION} `);
    console.log(`WebGL Support : ${WEBGL.isWebGL2Available()}`);

    globalThis.theApp = {
        host_url: '',
        modalContainer: document.querySelector('.modal-container')
    }

    theApp.waitModal = waitModalSetup(theApp);
    theApp.progressBox = progressBoxSetup(theApp);
    theApp.objectInfoBox = await objectInfoBoxSetup(theApp);

    try {
        theApp.waitModal.show('connecting to server');

        const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });

        console.log(params.gid);

        const galleryInfo = await (await fetch(`${theApp.host_url}/com/gallery/detail/pub/${params.gid}`)).json();

        console.log(galleryInfo);

        if (galleryInfo.r === 'ok') {
            theApp.waitModal.update('connect ok');
            await theApp.waitModal.closeWait(500);

            theApp.sceneManager = await new Promise(resolve => {
                sceneWalkerSetup({
                    Context: theApp,
                    galleryInfo: galleryInfo.data,
                    // container: glWindow,
                    onComplete: function (smgr) { // 모듈 초기화 완료
                        console.log('sceneManagerSetup complete');
                        resolve(smgr);
                    },
                    onSelectObject: async function (obj) { // 선택된 오브젝트가 바뀌면 호출된다.
                        console.log('select object');
                        console.log(obj.parent.userData);
                        if(obj.userData.type === 0) {

                            const result = await getObjectDetail({
                                id : obj.userData.fileId
                            });
                            console.log(result)
                            if(result.r === 'ok') {
                                theApp.objectInfoBox.show({
                                    title: result.data.title,
                                    msg : result.data.description,
                                    modelFile: result.data.modelFile,
                                    textureFile: result.data.textureFile,
                                    fileId : result.data._id
                                });
                            }
                            else {
                                
                                theApp.waitModal.show('error');
                                theApp.waitModal.closeWait(1000);
                            }
                        }
                    },
                    onObjectEditChange: function (obj) { // 오브젝트 의 속성값이 변하면 호출된다.
                        // theApp.objectList.updateProperty( obj );
                    },
                });
            });
        }
    }
    catch (e) {
        console.log(e);
        theApp.waitModal.show(`에러 발생 : ${e.message}`);
        // alert(`에러 발생 : ${e.message}`);
    }

}



export default main;