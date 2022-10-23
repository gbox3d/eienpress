import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";
import 'md5';

export default async function (_Context, container) {

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

    function _onAllowDrop(ev) {
        ev.preventDefault();

        // console.log(ev);
    }

    function _onDrag(ev) {
        ev.dataTransfer.setData("uuid", ev.target.dataset.uuid);
    }

    let _onDropedItem = null;
    function _onDrop(ev) {
        ev.preventDefault();
        _onDropedItem?.(ev);



        // let uuid = ev.dataTransfer.getData("uuid");

        // let _elem = _rootElm.querySelector(`[data-uuid='${uuid}']`);
        // if (_elem) {
        //     ev.target.closest('ul').querySelector(`ul[data-uuid='${uuid}']`).appendChild(_elem);
        // }


        // console.log(uuid)
        // let _tr_entity = _Context.objViewer.getEntityByuuid(uuid);
        // let _targetEntity = _Context.objViewer.getEntityByuuid(ev.target.dataset.uuid);
        // _targetEntity.attach(_tr_entity);
        // _updateTree(_Context.objViewer.elvis.root_dummy);
    }


    function _updateTree(obj, treeElm = null) {
        if (obj) {
            // console.log(obj)

            const _li = document.createElement('li');
            _li.innerHTML = `${obj.type}` + (obj.name ? `[${obj.name}]` : '');
            _li.dataset.uuid = obj.uuid;
            _li.draggable = true;
            _li.ondragover = _onAllowDrop;
            // _li.onall = _onAllowDrop;
            _li.ondragstart = _onDrag;
            _li.ondrop = _onDrop;


            let _ul = treeElm ? treeElm : _TreeElm;
            _ul.appendChild(_li);

            let _childUl = document.createElement('ul');
            _ul.dataset.uuid = obj.uuid;
            _ul.appendChild(_childUl);

            if (!obj.isElvisObject3D) {
                for (let i = 0; i < obj.children.length; i++) {
                    _updateTree(obj.children[i], _childUl);
                }
            }

        }

        return
    }

    function clearSelect() {
        const _li = _TreeElm.querySelectorAll('li');
        for (let i = 0; i < _li.length; i++) {
            _li[i].classList.remove('selected');
        }
    }

    function selectNode(uuid) {
        const _li = _TreeElm.querySelectorAll('li');
        for (let i = 0; i < _li.length; i++) {
            if (_li[i].dataset.uuid == uuid) {
                _li[i].classList.add('selected');
            }
            else {
                _li[i].classList.remove('selected');
            }
        }
    }

    let onSelectItem;
    _TreeElm.addEventListener('click', function (e) {
        const _target = e.target;
        if (_target.tagName === 'LI') {
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
        updateTree: (entity,selEntity=null) => {
            _TreeElm.innerHTML = '';
            _updateTree(entity);
            if(selEntity){
                selectNode(selEntity.uuid);
            }
        },
        setOnSelectItem: function (fn) {
            onSelectItem = fn;
        },
        setOnDropedItem(fn) {
            _onDropedItem = fn;
        },
        selectNode: selectNode,
    }

}