//texture select modal 


export default function (_Context) {

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(
        `<div id="texture-select-box" class="modal hide">
            <div class="modal-content">
                <span class="close">&times;</span>
                <ul></ul>
            </div>
        </div>`
        , 'text/html');

    const _rootElm = htmlDoc.querySelector('#texture-select-box');
    _Context.modalContainer.appendChild(_rootElm);

    const modalTexSelectBox = _rootElm

    let onCallback = null;
    // let _Context = _Context.theApp
    //close
    document.querySelector('#texture-select-box .modal-content .close').addEventListener('click', (e) => {
        e.preventDefault()
        modalTexSelectBox.classList.add('hide')

        onCallback ? onCallback() : null
    });

    document.querySelector('#texture-select-box .modal-content ul').addEventListener('click', async (e) => {

        let _modal = modalTexSelectBox

        let li = e.target

        if (li.tagName === 'LI') {
            // let textureName = li.dataset.textureName
            onCallback ? onCallback(li.dataset) : null
            // let _obj = _Context.editor.fbCanvas.getActiveObject()

            // if (_obj) {
            //     let textureName = li.dataset.textureName
                
            //     await _obj.setTextureName(textureName);
            //     _Context.updateData(_obj)
                
            //     onCallback ? onCallback(_obj) : null

            // }
        }
        _modal.classList.add('hide')

    });

    return {
        element: modalTexSelectBox,
        show: function (_callback) {
            let _modal = modalTexSelectBox

            // console.log(_Context.resourceMng)

            let _ul = _modal.querySelector('.modal-content ul')

            //clear list
            _.eachRight(_ul.children, (item) => {
                _ul.removeChild(item)
            })

            _.forIn(_Context.resourceMng.textures, (texture, name) => {

                let _li = document.createElement('li')
                _li.innerText = name
                _li.dataset.textureName = name
                _ul.appendChild(_li)

                // console.log(texture, name)
            });
            _modal.classList.remove('hide')
            // modalTexSelectBox.classList.remove('hide')
            onCallback = _callback
            // _callback()
        },
        close: function () {
            modalTexSelectBox.classList.add('hide')
        }
    };


}

/////////////////////////////////////