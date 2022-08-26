export default function (_Context) {

    const _rootElm = document.querySelector('#top-container .navbar [name=edit]')

    //save
    _rootElm.querySelector('[name=save]').addEventListener('click', async function () {


        _Context.fileSelectBox.show(async function (_path) {
            console.log(`save to ${_path}`)

            if (_.endsWith(_path, '.json')) {
                let result = _Context.utils.splitPath(_path)
                _Context.editor.saveCanvas(result.directoryName, result.fileName)
            }

        }, '/world');

    });

    //load
    _rootElm.querySelector('[name=load]').addEventListener('click', async function () {
        // console.log('load')

        _Context.fileSelectBox.show(async function (_path) {
            // console.log(`load from ${_path}`)
            _Context.msgBox.show(`Load from ${_path}`)
            // _Context.editor.loadCanvas('',_path)
            let result = _Context.utils.splitPath(_path)
            await _Context.editor.loadCanvas(result.directoryName, result.fileName)

            _Context.msgBox.close();

            // _Context.attrEditorFrom.deserializeAttr(_Context.editor.fbCanvas.getActiveObject());
            _Context.layerEditor.updateList(_Context.editor.fbCanvas.getObjects(), _Context.editor.fbCanvas.getActiveObject());

            // _Context.editor.fbCanvas.requestRenderAll();

        }, '/world');


    });

    //clear
    _rootElm.querySelector('[name=clear]').addEventListener('click', async function () {
        console.log('clear')
        _Context.editor.clearCanvas();
        _Context.layerEditor.updateList();
    });

    //clone
    _rootElm.querySelector('[name=clone]').addEventListener('click', async function () {
        console.log('clone')
        try {
            let clone = await _Context.editor.cloneObject(); //clone active object
            _Context.layerEditor.updateList(_Context.editor.fbCanvas.getObjects(), _Context.editor.fbCanvas.getActiveObject());
            _Context.attrEditorFrom.deserializeAttr(_Context.editor.fbCanvas.getActiveObject());

        }
        catch (e) {
            console.log(e)
        }

    });

    return {
        element: _rootElm
    }
}


