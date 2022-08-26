export default function (_Context) {

    const _rootElm = document.querySelector('#top-container .navbar')

    //메뉴 처리, process menu
    //create image object
    _rootElm.querySelector('[name=create] [name=image]').addEventListener('click', async function () {
        let _obj = await _Context.editor.addRmdImage('blank')

        _Context.editor.fbCanvas.setActiveObject(_obj)
        _Context.editor.fbCanvas.requestRenderAll()
        // _Context.select
        _Context.attrEditorFrom.deserializeAttr(_obj);
        _Context.layerEditor.updateList(_Context.editor.fbCanvas.getObjects(), _obj);
    });

    _rootElm.querySelector('[name=create] [name=tiledImage]').addEventListener('click', async function () {
        let _obj = await _Context.editor.addRmdTiledImage('blank')

        _Context.editor.fbCanvas.setActiveObject(_obj)
        _Context.editor.fbCanvas.requestRenderAll()
        // _Context.select
        _Context.attrEditorFrom.deserializeAttr(_obj);
        _Context.layerEditor.updateList(_Context.editor.fbCanvas.getObjects(), _obj);
    });

    return {
        element: _rootElm
    }

}