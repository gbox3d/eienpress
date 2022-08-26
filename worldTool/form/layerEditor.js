export default function (_Context) {


    const _form = document.querySelector('#layer-editor')

    const _ul = _form.querySelector('ul')

    function _updateList(_layers, _activeLayer) {

        let layers = _layers ? _layers : _Context.editor.fbCanvas.getObjects()
        let activeLayer = _activeLayer ? _activeLayer : _Context.editor.fbCanvas.getActiveObject()

        _Context.utils.clearChileNode(_ul)

        _.each(layers, (layer) => {
            // console.log(layer)
            let _li = document.createElement('li')
            _li.innerText = `${layer.id} : ${layer.type}`
            _li.dataset.objId = layer.id

            //is activeLayer array
            if (Array.isArray(activeLayer)) {
                _.each(activeLayer, (active) => {
                    if (active.id === layer.id) {
                        _li.classList.add('active')
                    }
                })
            }
            else {
                if (layer === activeLayer) {
                    _li.classList.add('active')
                }
            }

            _ul.appendChild(_li)
        });
    }

    _form.querySelector('button.up').addEventListener('click', (evt) => {

        evt.preventDefault()
        _Context.editor.moveUpLayer()

        let activeObj = _Context.editor.fbCanvas.getActiveObject()

        if(activeObj.type === 'activeSelection') {
            _updateList(_Context.editor.fbCanvas.getObjects(), activeObj.getObjects())
        }
        else {
            _updateList(_Context.editor.fbCanvas.getObjects(), activeObj)

        }
        _Context.editor.fbCanvas.requestRenderAll();
    })
    _form.querySelector('button.down').addEventListener('click', (evt) => {
        evt.preventDefault()

        _Context.editor.moveDownLayer()

        let activeObj = _Context.editor.fbCanvas.getActiveObject()

        if(activeObj.type === 'activeSelection') {
            _updateList(_Context.editor.fbCanvas.getObjects(), activeObj.getObjects())
        }
        else {
            _updateList(_Context.editor.fbCanvas.getObjects(), activeObj)
        }

        _Context.editor.fbCanvas.requestRenderAll();
    })
    _form.querySelector('button.remove').addEventListener('click', (evt) => {
        evt.preventDefault()
        _Context.editor.removeLayer()
        _updateList()
        _Context.editor.fbCanvas.requestRenderAll();
    })

    return {
        element: _form,
        updateList: _updateList
    }
}