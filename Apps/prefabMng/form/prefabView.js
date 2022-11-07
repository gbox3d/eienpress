import 'md5';

export default async function (_Context, container) {

    const _htmlText = `
    <div class="ui-view w3-container">
            <form class='w3-container' >

                <div class="w3-row">
                    <label>file id</label>
                    <input class='w3-input' type='text' name='file_id' value='' disabled>
                </div>
    
                <div class='w3-row'>
                    <label>material</label>
                    <div class='w3-row material'>
                        <div class='w3-col s5'>
                            <input class='w3-input w3-border' type='text' name='material_fileid' disabled />
                        </div>
                        <div class='w3-col s5'>
                            <input class='w3-input w3-border' type='text' name='material_repo_ip' disabled />
                        </div>
                        <div class='w3-col s2'>
                            <button class='w3-button w3-block w3-blue' type='button'>...</button>
                        </div>
                    </div>
                    
                    <div class='w3-row'>
                        <label>resolve</label>
                        <input class="w3-check w3-margin-top" type="checkbox"  name='material_resolve' disabled>
                    </div>

                </div>

                <div class='w3-row'>
                    <label>geomerty</label>
                    <div class='w3-row geometry'>
                        <div class='w3-col s4'>
                            <input class='w3-input w3-border' type='text' name='geometry_fileid' disabled />
                        </div>
                        <div class='w3-col s4'>
                            <input class='w3-input w3-border' type='text' name='geometry_repo_ip' disabled />
                        </div>
                        <div class='w3-col s3'>
                            <input class='w3-input w3-border' type='text' name='geometry_format'  disabled />
                        </div>
                        <div class='w3-col s1'>
                            <button class='w3-button w3-block w3-blue' type='button'>...</button>
                        </div>
                    </div>

                    <div class='w3-row'>
                        <label>resolve</label>
                        <input class="w3-check w3-margin-top" type="checkbox"  name='geometry_resolve' disabled>
                    </div>
                    
                </div>

                <div class='w3-row'>
                    <label>is prefab root</label>
                    <input class="w3-check w3-margin-top" type="checkbox"  name='is_prefab_root' disabled>
                </div>

                
            </form>
    </div>
    `;

    const host_url = _Context.host_url;
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');
    const _rootElm = htmlDoc.querySelector('.ui-view');
    const _form = _rootElm.querySelector('form');

    

    container.appendChild(_rootElm);

    _rootElm.style.width = '800px';
    _rootElm.style.height = '424px';
    _rootElm.style.overflow = 'auto';
    _rootElm.style.border = '1px solid #ccc';

    function _set(entity) {

        console.log('set', entity);
        _form.dataset.uuid = entity.uuid;

        _form.elements.file_id.value = entity.userData?.fileInfo?.id ? entity.userData.fileInfo.id : '';
        
        _form.elements.material_fileid.value = entity.materialFile ? entity.materialFile.id : '';
        _form.elements.material_repo_ip.value = entity.materialFile ? entity.materialFile.repo_ip : '';

        _form.elements.geometry_fileid.value = entity.geometryFile ? entity.geometryFile.id : '';
        _form.elements.geometry_repo_ip.value = entity.geometryFile ? entity.geometryFile.repo_ip : '';

        _form.elements.material_resolve.checked = entity.materialFile?.resolve;
        _form.elements.geometry_resolve.checked = entity.geometryFile?.resolve;

        _form.elements.geometry_format.value = entity.geometryFile?.format ? entity.geometryFile.format : '';

        _form.elements.is_prefab_root.checked = entity.isPrefabRoot ? entity.isPrefabRoot : false;

    }

    function _get() {
        // const _form = _rootElm.querySelector('form');

        return {
            materialFile: {
                id: _form.elements.material_fileid.value,
                repo_ip: _form.elements.material_repo_ip.value
            }

        }

    }

    function _update(entity) {
        const data = _get();
        console.log(data)
    }

    _form.addEventListener('change', (evt) => {
        evt.preventDefault();
        const uuid = _form.dataset.uuid;
        const entity = _Context.objViewer.elvis.scene.getObjectByProperty('uuid', uuid);
        _update(entity);
    });


    _form.querySelector('.material button').addEventListener('click', async (evt) => {
        evt.preventDefault();

        const uuid = _form.dataset.uuid;
        const entity = _Context.objViewer.elvis.scene.getObjectByProperty('uuid', uuid);

        _onMaterialChange ? _onMaterialChange(entity) : null;


    });

    _form.querySelector('.geometry button').addEventListener('click', async (evt) => {
        evt.preventDefault();

        const uuid = _form.dataset.uuid;
        const entity = _Context.objViewer.elvis.scene.getObjectByProperty('uuid', uuid);
        _onGeometryChange ? _onGeometryChange(entity) : null;

    });

    console.log('complete setup tree view');

    let _onMaterialChange
    let _onGeometryChange


    return {
        element: _rootElm,
        set: _set,
        get: _get,
        setCallback: ({onGeometryChange, onMaterialChange}) => {
            _onMaterialChange = onMaterialChange;
            _onGeometryChange = onGeometryChange;
        }   

    }

}