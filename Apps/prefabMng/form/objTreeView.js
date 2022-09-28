import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";
import 'md5';

export default async function (_Context,container) {

    const host_url = _Context.host_url;

    const _htmlText = `
    <div class="ui-view">
        <div class='w3-container' >
            <div class='tree-frame'>
                <ul class='myTree' ></ul>
            </div>
        </div>
    </div>
    `;

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');
    const _rootElm = htmlDoc.querySelector('.ui-view');
    const _TreeFrame = _rootElm.querySelector('.tree-frame');

    container.appendChild(_rootElm);
    
    _rootElm.style.width = '320px';
    _rootElm.style.height = '512px';
    _rootElm.style.overflow = 'auto';
    _rootElm.style.border = '1px solid #ccc';

    const _TreeElm = _TreeFrame.querySelector('ul.mytree');
    _TreeElm.style.height = '400px';
    _TreeElm.style.overflow = 'auto';

    

    function _updateTree(obj,treeElm=null) {
        if(obj) {
            console.log(obj)
            const _li = document.createElement('li');
            _li.innerHTML = obj.type;
            _li.dataset.uuid = obj.uuid;

            let _ul = treeElm ? treeElm : _TreeElm;
            _ul.appendChild(_li);

            let _childUl = document.createElement('ul');
            _ul.appendChild(_childUl);

            for(let i=0; i<obj.children.length; i++) {
                _updateTree(obj.children[i],_childUl);
            }
        }
        return 
    }

    function clearSelect() {
        const _li = _TreeElm.querySelectorAll('li');
        for(let i=0; i<_li.length; i++) {
            _li[i].classList.remove('selected');
        }
    }

    function selectNode(uuid) {
        const _li = _TreeElm.querySelectorAll('li');
        for(let i=0; i<_li.length; i++) {
            if(_li[i].dataset.uuid == uuid) {
                _li[i].classList.add('selected');
            }
            else {
                _li[i].classList.remove('selected');
            }
        }
    }

    let onSelectItem;
    _TreeElm.addEventListener('click',function(e) {
        const _target = e.target;
        if(_target.tagName === 'LI') {
            clearSelect();
            _target.classList.add('selected');

            const _uuid = _target.dataset.uuid;
            onSelectItem?.(_uuid);
            // const _obj = _Context.scene.getObjectByProperty('uuid',_uuid);
            // console.log(_obj)
        }
    });


    console.log('complete setup tree view');

    return {
        element: _rootElm,
        updateTree: (entity) => {
            _TreeElm.innerHTML = '';
            _updateTree(entity);
        },
        setOnSelectItem : function (fn) {
            onSelectItem = fn;
        },
        selectNode: selectNode,
    }

}