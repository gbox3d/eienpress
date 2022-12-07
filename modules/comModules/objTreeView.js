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
    }

    function _onDrag(ev) {
        console.log('drag', ev);
        ev.dataTransfer.setData("uuid", ev.target.dataset.uuid);
    }

    let _onDropedItem = null;
    function _onDrop(evt) {
        evt.preventDefault();
        _onDropedItem?.(evt);

        console.log('onDrop', evt);
    }


    function _updateTree(obj, treeElm = null) {
        if (obj) {
            // console.log(obj)

            const _li = document.createElement('li');
            let objName = obj.name ? `[${obj.name}]` : '';

            

            if (obj.isGroup) {
                _li.innerHTML = `<span class='extendbtn'>${obj.bFold? '+' : '-' }</span>` + `<span class='item-name' >${obj.type}${objName}</span>`;
                console.log(_li.innerHTML)
            } else {
                _li.innerHTML = `<span class='item-name' > ${obj.type} ${objName} </span>`;
            }

            _li.dataset.uuid = obj.uuid;
            _li.draggable = true;
            _li.ondragover = _onAllowDrop;
            _li.ondragstart = _onDrag;
            _li.ondrop = _onDrop;


            let _ul = treeElm ? treeElm : _TreeElm;
            
            _ul.dataset.uuid = obj.uuid;
            _ul.appendChild(_li);

            let _childUl = document.createElement('ul');
            _li.appendChild(_childUl);

            if(obj.bFold) {
                _childUl.style.display = 'none';
            }   
            
            if( obj.isElvisTrigerObject ||
                obj.isElvisObject3D ||
                obj.isElvisStartPoint
                ) {
                    //todo...
            }
            else {
                for (let i = 0; i < obj.children.length; i++) {
                    _updateTree(obj.children[i], _childUl);
                }
            }
        }

        return
    }

    function clearSelect() {
        const _li = _TreeElm.querySelectorAll('li > span.item-name');
        for (let i = 0; i < _li.length; i++) {
            _li[i].classList.remove('selected');
        }
    }

    function selectNode(uuid) {
        const _li = _TreeElm.querySelectorAll('li');
        for (let i = 0; i < _li.length; i++) {
            if (_li[i].dataset.uuid == uuid) {
                _li[i].querySelector('.item-name')?.classList.add('selected');
            }
            else {
                _li[i].querySelector('.item-name')?.classList.remove('selected');
            }
        }
    }

    let onSelectItem;
    _TreeElm.addEventListener('click', function (e) {
        const _target = e.target;

        console.log(_target)

        // if (_target.tagName === 'LI') {
        //     clearSelect();
        //     _target.classList.add('selected');

        //     const _uuid = _target.dataset.uuid;
        //     onSelectItem?.(_uuid);
        // }

        if (_target.classList.contains('item-name')) {

            clearSelect();

            _target.classList.add('selected');

            const _uuid = _target.parentElement.dataset.uuid;
            onSelectItem?.(_uuid);

        }
        else if (_target.classList.contains('extendbtn')) {

            const _uuid = _target.parentElement.dataset.uuid;

            
            const entity = _Context.objViewer.elvis.scene.getObjectByProperty('uuid', _uuid)

            if (entity?.isGroup && entity.children.length > 0) {
                
                if (_target.innerText === '+') {
                    _target.innerText = '-';
                    _target.parentElement.querySelector('ul').style.display = 'block';
                    entity.bFold = false;
                } else {
                    _target.innerText = '+';
                    _target.parentElement.querySelector('ul').style.display = 'none';
                    entity.bFold = true;
                }
            }

            // const _ul = _target.closest('ul')
            // if(_ul.style.display == 'none'){
            //     _ul.style.display = 'block';
            //     _target.innerHTML = '-';
            // }
            // else{
            //     _ul.style.display = 'none';
            //     _target.innerHTML = '+';
            // }
        }
    });


    console.log('complete setup tree view');

    return {
        element: _rootElm,
        updateTree: (entity, selEntity = null) => {
            _TreeElm.innerHTML = '';
            _updateTree(entity);
            if (selEntity) {
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