export default function (_Context) {

    const _rootElm = document.querySelector('#editorView #config-form')


    _rootElm.querySelector('#EnableSnap').checked = _Context.editor.bSnapChecked
    _rootElm.querySelector('#showGrid').checked = _Context.editor.bShowGrid

    _rootElm.querySelector('#EnableSnap').addEventListener('change', (e) => {
        console.log(e.target.checked)
        _Context.editor.bSnapChecked = e.target.checked;
        
    })

    _rootElm.querySelector('#grisSize').addEventListener('change', (e) => {
        console.log(e.target.value)
        _Context.editor.setGridSize(parseInt( e.target.value ));
        _Context.editor.fbCanvas.requestRenderAll();
    })

    _rootElm.querySelector('#showGrid').addEventListener('change', (e) => {
        _Context.editor.bShowGrid = e.target.checked;
        _Context.editor.fbCanvas.requestRenderAll();
    })

    return {
        element: _rootElm
    }

}