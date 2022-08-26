export default function (_Context) {

    const _htmlText = `<div class='property-view'> 
    <p>geometries</p>
    <ul></ul>
    <div class="property">
        <form>
            <label>name</label>
            <input type="text" name="name" value="" disabled>
            <br />
            <label>type</label>
            <input type="text" name="type" value="" disabled>
            <br />
            <label>uuid</label>
            <input type="text" name="uuid" value="" disabled>
            <hr />
            <label>bounding box</label>
            <div>
                min : <input type="text" name="boundingBoxMin" value="" disabled>
                <br />
                max : <input type="text" name="boundingBoxMax" value="" disabled>
            </div>
            <hr />
            <label>user data</label>
            <textarea name="userData"></textarea>
        </form>
    </div>
    <button class="add">add</button>
    <button class="del">del</button>
    </div>`;

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');

    // const _rootElm = htmlDoc.querySelector('.property-view')
    const _rootElm = document.querySelector('.geometry-list')
    _rootElm.appendChild(htmlDoc.querySelector('.property-view'));

    const sceneEditor = _Context.sceneEditor;
    let selectItem = null;

    function updateGeometryList() {
        // const materialList = document.querySelector('.material-list');
        const _ul = _rootElm.querySelector('ul');
        const _list = sceneEditor.geometryList;
        const uuids = Object.keys(_list);
        _ul.innerHTML = '';
        uuids.forEach(uuid => {
            const li = document.createElement('li');
            li.innerText = _list[uuid].name;
            li.dataset.uuid = uuid;
            _ul.appendChild(li);
        });
    }

    updateGeometryList();

    function clearSelectAll() {
        const _ul = _rootElm.querySelector('ul');
        const _list = _ul.querySelectorAll('li');
        _list.forEach(li => {
            li.classList.remove('selected');
        });
    }
    function setSelectItem(uuid) {
        clearSelectAll();
        selectItem = sceneEditor.geometryList[uuid];
        const _ul = _rootElm.querySelector('ul');
        const _list = _ul.querySelectorAll('li');
        _list.forEach(li => {
            if (li.dataset.uuid == uuid) {
                li.classList.add('selected');
            }
        });
    }

    _rootElm.querySelector('ul').addEventListener('click', (e) => {
        // const _name = e.target.innerText;
        console.log(e.target);

        if (e.target.tagName === 'LI') {
            clearSelectAll();
            e.target.classList.add('selected');
            selectItem = sceneEditor.geometryList[e.target.dataset.uuid];
            // console.log(selectItem);

            const _form = _rootElm.querySelector('form');
            _form.uuid.value = selectItem.uuid;
            _form.name.value = selectItem.name;
            _form.type.value = selectItem.type;
            if (selectItem.boundingBox) {
                _form.boundingBoxMin.value = selectItem.boundingBox.min.toArray().join(',');
                _form.boundingBoxMax.value = selectItem.boundingBox.max.toArray().join(',');
            }

            _form.userData.value = JSON.stringify(selectItem.userData);
        }

    });

    _rootElm.querySelector('.add').addEventListener('click', (e) => {
        //create fbx mesh
        _Context.sceneEditor.addFbxGeometry(
            '/home/ubiqos/work/repository/test2/Meshes/Objects_2/Rack/Rack.fbx',
            0.01
        );
        updateGeometryList();
    });




    return {
        element: _rootElm,
        getSelect: () => selectItem,
        setSelect: setSelectItem,
        updateGeometryList: updateGeometryList,
        update: updateGeometryList
    }

}