import * as THREE from 'three';
import WEBGL from 'three/addons/capabilities/WebGL.js';

//forms
import uiMainSetup from './form/uiMain.js';

//models
import waitModalSetup from 'ideon/waitModal.js';
import progressBoxSetup from 'ideon/progressBox.js';
import messageModal from 'ideon/messageModal.js';


// import fileSelectorSetup from './modal/.js';

async function main() {

    console.log(`THREEJS Version : ${THREE.REVISION} `);
    console.log(`WebGL Support : ${WEBGL.isWebGL2Available()}`);

    try {
        
        globalThis.theApp = {
            host_url: '',
            modalContainer: document.querySelector('.modal-container'),
            body_container: document.querySelector('.body-container'),
        }

        theApp.progressBox = progressBoxSetup(theApp);
        theApp.waitModal = waitModalSetup(theApp);
        theApp.messageModal = messageModal(theApp);

        theApp.uiMain = await uiMainSetup(theApp);

        
    }
    catch (err) {
        console.error(err);
    }
}



export default main;