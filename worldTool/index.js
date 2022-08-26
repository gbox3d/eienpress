const host_url = 'http://cam2us.ubiqos.co.kr:24030'
const root_path = '/home/ubiqos/work/repository'

const fabric = window.fabric;

import '/modules/fabricPlugins/resMng.js'
import '/modules/fabricPlugins/RmdImage.js'
import '/modules/fabricPlugins/RmdTileImage.js'
import '/modules/fabricPlugins/RmdFramedImage.js'

import setup_menuBar from './menu/menuBar.js'
import setup_menu_edit from './menu/edit.js'
import setup_menu_create from './menu/create.js'

import setup_attrEditor from './form/attributeEditor.js'
import setup_layerEditor from './form/layerEditor.js'
import setup_configForm from './form/configForm.js'

import setup_textureSelectBox from './modal/textureSelectBox.js'
import setup_fileSelectBox from './modal/fileSelectBox.js'
import setup_msgBox from './modal/msgBox.js'


import setup_utils from './etc/utils.js'

import Editor from './editor.js'

export default async function main() {

    let reault = await fabric.plugins.resourceDB.init(
        {
            webDiskInfo: {
                root_path: root_path,
                host_url: host_url
            },
            authToken: localStorage.getItem('authToken'),
            database: 'resdb.json'
        });
    // theApp.resourceMng = reault;
    console.log(`resourceMng ready`, reault)

    globalThis.theApp = {
        resourceMng: reault,
        // updateData: (_obj)=> {
        //     theApp.attrEditorFrom.element.dispatchEvent(new CustomEvent('update', {
        //         detail: {
        //             obj: _obj
        //         }
        //     }));
        //     theApp.editor.fbCanvas.renderAll()
        // },
        modalContainer : document.querySelector('#modal-container'),
    }

    theApp.editor = new Editor({
        authToken: localStorage.getItem('authToken'),
        context: theApp,
        gridSize : 32,
        width : 800,
        height : 600,
        bShowGrid : true,
        bSnapChecked : true,
    })

    document.querySelector("#command button").addEventListener("click", () => {
        let _cmd = document.querySelector("#command input").value;
        console.log(_cmd)

        switch (_cmd) {
            case "save":
                theApp.saveCanvas(`${root_path}`, "world/test2.json");
                break;
            case "load":
                theApp.loadCanvas(`${root_path}`, "world/test2.json");
                theApp.fbCanvas.requestRenderAll();
                break;
            case "clear":
                fbCanvas.clear();
                fbCanvas.setBackgroundColor('#000000');
                fbCanvas.requestRenderAll();
                break;
            case "rect":
                theApp.addRect()
                break;
            case "image":
                theApp.addImage('base_front.png')
                break;
            default:
                break;
        }
    });

    setup_menuBar(theApp);
    setup_menu_create(theApp);
    setup_menu_edit(theApp);

    theApp.attrEditorFrom = setup_attrEditor(theApp);
    theApp.layerEditor = setup_layerEditor(theApp);
    theApp.configForm = setup_configForm(theApp);
    
    theApp.textureSeletBox = setup_textureSelectBox(theApp);
    theApp.fileSelectBox = setup_fileSelectBox(theApp);
    theApp.msgBox = setup_msgBox(theApp);


    theApp.utils = setup_utils(theApp);

}
