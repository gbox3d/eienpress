export default function (_Context) {

    ////////////////////////////////////

    const _rootElm = document.querySelector('#attribute-editor')

    // let _form = _rootElm.querySelector('form.Image')

    function _onSheetChange(e) {
        _Context.editor.onChangeSheetIndex(parseInt(e.target.value))

        console.log(`change sheet ${e.target.value}`)
    }

    function _onTextureClick(e) {
        e.preventDefault()

        _Context.textureSeletBox.show(async (selItem) => {

            if (selItem && selItem.textureName) {
                console.log('texture selected', selItem)

                let _obj = _Context.editor.fbCanvas.getActiveObject()

                if (_obj) {
                    let textureName = selItem.textureName

                    await _obj.setTextureName(textureName);
                    deserializeAttr(_obj)
                    _Context.editor.fbCanvas.requestRenderAll()
                }
            }

        });
    }

    function _onChangeTileIndex(e) {

        console.log(e.target.value)

        let _obj = _Context.editor.fbCanvas.getActiveObject()

        if (_obj) {
            _obj.setTileIndex(parseInt(e.target.value))
            _Context.editor.fbCanvas.requestRenderAll()
        }
    }

    function _selectForm(obj) {

        _.each(_rootElm.querySelectorAll('form'), (form) => {
            form.hidden = true
        })
        let _form = null
        switch (obj.type) {
            case 'RmdImage':
                // _form.hidden = true
                _form = _rootElm.querySelector('form.Image')
                _form.hidden = false
                _form.querySelector('#sheet-select').removeEventListener('change', _onSheetChange)
                _form.querySelector('#texture-select').removeEventListener('click', _onTextureClick)
                _form.querySelector('#sheet-select').addEventListener('change', _onSheetChange);
                _form.querySelector('#texture-select').addEventListener('click', _onTextureClick);

                break;
            case 'RmdTileImage':
                // _form.hidden = true
                _form = _rootElm.querySelector('form.tiledImage')
                _form.hidden = false
                _form.querySelector('#sheet-select').removeEventListener('change', _onSheetChange)
                _form.querySelector('#texture-select').removeEventListener('click', _onTextureClick)
                _form.querySelector('#sheet-select').addEventListener('change', _onSheetChange);
                _form.querySelector('#texture-select').addEventListener('click', _onTextureClick);

                _form.tileIndex.removeEventListener('change', _onChangeTileIndex)
                _form.tileIndex.addEventListener('change', _onChangeTileIndex);

                break;
            case 'RmdFramedImage':
                // _form.hidden = true
                _form = _rootElm.querySelector('form.framedImage')
                _form.hidden = false
                break;
            case 'activeSelection':
                _form = _rootElm.querySelector('form.activeSelection')
                _form.hidden = false
                break;

        }
        return _form
    }

    function deserializeAttr(obj) {
        // console.log(obj.type)

        let _form = _selectForm(obj)

        if (!_form) {
            console.log(`unkown type ${obj.type}`)
            return
        }

        //공통 속성

        _form.left.value = obj.left
        _form.top.value = obj.top
        _form.scaleX.value = obj.scaleX
        _form.scaleY.value = obj.scaleY
        _form.angle.value = obj.angle

        if (_form.classList.contains('Image')) {
            _form.objId.value = obj.id
            _form.width.value = obj.width
            _form.height.value = obj.height
            _form.texture.value = obj.textureName

            //sheet selector
            let sheet_selector = _form.querySelector('#sheet-select')
            sheet_selector.innerHTML = ''

            for (let i = 0; i < obj.get('_elements').length; i++) {
                let _option = document.createElement('option')
                _option.value = i
                _option.innerText = `sheet ${i}`
                sheet_selector.appendChild(_option)
            }

            sheet_selector.value = obj.get('sheetIndex')
        }
        else if (_form.classList.contains('tiledImage')) {
            _form.objId.value = obj.id
            _form.tileSize.value = obj.tileSize
            _form.tileIndex.value = obj.tileIndex
            _form.texture.value = obj.textureName

            //sheet selector
            let sheet_selector = _form.querySelector('#sheet-select')
            sheet_selector.innerHTML = ''

            for (let i = 0; i < obj.get('_elements').length; i++) {
                let _option = document.createElement('option')
                _option.value = i
                _option.innerText = `sheet ${i}`
                sheet_selector.appendChild(_option)
            }

            sheet_selector.value = obj.get('sheetIndex')
        }
        else if (_form.classList.contains('framedImage')) {
            //todo ...
        }
        else if (_form.classList.contains('activeSelection')) {
        }


    }

    // _form.addEventListener('update', (e) => {
    //     console.log(e.detail)
    //     deserializeAttr(e.detail.obj)
    // })


    return {
        element: _rootElm,
        selectFrom: _selectForm,
        deserializeAttr: deserializeAttr
    }


}