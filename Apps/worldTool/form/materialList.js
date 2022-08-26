export default function (_Context) {

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(
        `
    <div class="property-view" >
        <p>materials</p>
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
					<br />
					<label>color</label>
					<input type="color" name="color" value="#ffffff">
					<br />
					
                    <label>map</label>
                    <input type="button" name="map" value="">
                    <br />
                    <label>spec map</label>
                    <input type="button" name="specMap" value="">
                    <br />
                    <label>normal map</label>
                    <input type="button" name="normalMap" value="">
                    <br />
                    <label>normal map scale</label>
                    x: <input type="number" name="normalMapScaleX" value="1" min="0" max="1">
                    y: <input type="number" name="normalMapScaleY" value="1" min="0" max="1">
                    <br />

                    <label>user data</label>
					<textarea name="userData"></textarea>
                    <br />
				</form>
			</div>
			<button class="add">add</button>
			<button class="del">del</button>
    <div>
`
        , 'text/html');

    // const _rootElm = htmlDoc.querySelector('#file-select-box');

    const _rootElm = document.querySelector('.material-list')
    _rootElm.appendChild(htmlDoc.querySelector('.property-view'));

    const sceneEditor = _Context.sceneEditor;
    let selectItem = null;

    function updateMaterialList() {
        // const materialList = document.querySelector('.material-list');
        const _ul = _rootElm.querySelector('ul');
        const _list = sceneEditor.materialList;
        const _uuids = Object.keys(_list);
        _ul.innerHTML = '';
        _uuids.forEach(_id => {
            const li = document.createElement('li');
            li.innerText = _list[_id].name;
            li.dataset.uuid = _id;
            _ul.appendChild(li);
        });
    }

    updateMaterialList();

    function clearSelectAll() {
        const _ul = _rootElm.querySelector('ul');
        const _list = _ul.querySelectorAll('li');
        _list.forEach(li => {
            li.classList.remove('selected');
        });
    }

    const _form = _rootElm.querySelector('form');

    function updateProperty(matrial) {
        
        _form.uuid.value = matrial.uuid;
        _form.name.value = matrial.name;
        _form.type.value = matrial.type;
        _form.color.value = `#${matrial.color.getHexString()}`;
        _form.map.value = matrial.userData.file;
        _form.normalMap.value = matrial.userData.normalMap;

        if(matrial.type === 'MeshPhongMaterial') {
            _form.normalMapScaleX.value = matrial.normalScale.x;
            _form.normalMapScaleY.value = matrial.normalScale.y;
        }

        
        _form.userData.value = JSON.stringify(matrial.userData);
    }

    _rootElm.querySelector('ul').addEventListener('click', (e) => {
        // const _name = e.target.innerText;
        console.log(e.target);

        if (e.target.tagName === 'LI') {
            clearSelectAll();
            e.target.classList.add('selected');

            // let material = sceneEditor.materialList[e.target.dataset.uuid];
            selectItem = sceneEditor.materialList[e.target.dataset.uuid]
            // console.log(selectItem);
            updateProperty(selectItem);

        }
    });

    function setSelectItem(uuid) {
        selectItem = sceneEditor.materialList[uuid]

        clearSelectAll();
        const _ul = _rootElm.querySelector('ul');
        const _list = _ul.querySelectorAll('li');
        _list.forEach(li => {
            if (li.dataset.uuid === uuid) {
                li.classList.add('selected');
            }
        });
        updateProperty(selectItem);
    }

    _rootElm.querySelector('.add').addEventListener('click', (e) => {
        _Context.fileSelectBox.show(
            async (file) => {
                console.log(file)
                let _path = file.split('/').slice(0, -1).join('/')
                let _file = file.split('/').slice(-1).join('/')

                console.log(_path, _file);
                // let material = await createTexureMaterial(file)
                // sceneEditor.materialList[`${_file}`] = material;
                let _r = await sceneEditor.addTextureBasicMatrial(file);

                console.log(_r)

                updateMaterialList();

            }
        );
    });

    _rootElm.querySelector('.del').addEventListener('click', (e) => {
    });

    //form control

    // const _form = _rootElm.querySelector('form');

    _form.map.addEventListener('click', (e) => {
        e.preventDefault()
        if (selectItem !== null) {
            _Context.fileSelectBox.show(
                async (file) => {
                    let _r = await sceneEditor.setMaterial_Map(selectItem.uuid,file);
                    console.log(_r)
                    updateProperty(selectItem);
                }
            );
        }
    });

    _form.normalMap.addEventListener('click', (e) => {
        e.preventDefault()
        if (selectItem !== null) {
            _Context.fileSelectBox.show(
                async (file) => {
                    let _r = await sceneEditor.setMaterial_NormalMap(selectItem.uuid,file);
                    console.log(_r)
                    updateProperty(selectItem);
                }
            );
        }
    });

    _form.normalMapScaleX.addEventListener('change', (e) => {
        if (selectItem !== null) {
            selectItem.matrial.normalScale.x = e.target.value;
        }
    });

    _form.normalMapScaleY.addEventListener('change', (e) => {
        if (selectItem !== null) {
            selectItem.matrial.normalScale.y = e.target.value;
        }
    });


    _rootElm.querySelector('[name="color"]').addEventListener('input', (e) => {
        if (selectItem) {
            console.log(e.target.value);
            selectItem.color.set(e.target.value);
        }
    });

    return {
        element: _rootElm,
        getSelect: () => selectItem,
        setSelect: setSelectItem,
        update: updateMaterialList,
    }


}