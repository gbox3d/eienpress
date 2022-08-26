export default function (_Context) {

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(
        `

        <div class="w3-modal">
        <!-- Modal content -->
        <div class="w3-modal-content">
            
            <header class="w3-container w3-teal">
                <div class="w3-center">
                <span class="w3-button w3-xlarge w3-hover-red w3-display-topright" title="Close Modal">&times;</span>
                <h2>object Registration</h2>
                </div>
                
            </header>

            <form class="w3-container">
                <label>Object Name</label>
                <input type="text" id="objectName" placeholder="Object Name" />
                <br />
                <label>Object Type</label>
                <select id="objectType">
                    <option value="0">전시물</option>
                    <option value="1">인태리어</option>
                    <option value="2">건물</option>
                </select>
                <br />
                <label>Object Description</label>
                <textarea id="objectDesc" placeholder="Object Description"></textarea>
                <hr/>
                
                <div style="height: 80px;">
                <label>fbx </label>
                    <input type="file" name="fbx-file">
                </div>

                <div style="height: 80px;">
                <label>texture </label>
                    <input type="file" name="texture-file">
                </div>

                <button class='ok w3-button w3-green' >Ok</button>
                <button class='close w3-button w3-green' >Close</button>
            </form>


        </div>
    </div>`
        , 'text/html');

    const _rootElm = htmlDoc.querySelector('.w3-modal');
    // const _msgText = _rootElm.querySelector('.modal-content h2');
    _Context.modalContainer.appendChild(_rootElm);

    let _onCallback = null;

    _rootElm.querySelector('form.w3-container button.close').addEventListener('click', (evt) => {
        // _rootElm.classList.add('hide');
        evt.preventDefault();
        _rootElm.style.display = 'none';
        _onCallback ? _onCallback() : null;
    });

    _rootElm.querySelector('form.w3-container button.ok').addEventListener('click', (evt) => {

        evt.preventDefault();

        const objectName = _rootElm.querySelector('#objectName').value;
        const objectType = _rootElm.querySelector('#objectType').value;
        const objectDesc = _rootElm.querySelector('#objectDesc').value;

        const fbxFile = _rootElm.querySelector('input[name="fbx-file"]').files[0];
        const textureFile = _rootElm.querySelector('input[name="texture-file"]').files[0];

        if (!objectName || !objectType || !objectDesc || !fbxFile || !textureFile) {
            alert('모든 항목을 입력해주세요.');
            // onCallback ? onCallback() : null;
            return;
        }
        else {
            _rootElm.querySelector('#objectName').value = '';
            _rootElm.querySelector('#objectType').value = '';
            _rootElm.querySelector('#objectDesc').value = '';
            _rootElm.querySelector('input[name="fbx-file"]').value = '';
            _rootElm.querySelector('input[name="texture-file"]').value = '';


            _rootElm.classList.add('hide');
            _onCallback ? _onCallback({
                objectName: objectName,
                objectType: objectType,
                objectDesc: objectDesc,
                fbxFile: fbxFile,
                textureFile: textureFile,
            }) : null;

        }
        // console.log(objectName, objectType, objectDesc, fbxFile, textureFile);
    });

    _rootElm.querySelector('[title="Close Modal"]').addEventListener('click', (evt) => {
        evt.preventDefault();
        _rootElm.style.display = 'none';
        _onCallback ? _onCallback() : null;
    });



    return {
        element: _rootElm,
        show: function ({ onCallback }) {
            // _rootElm.classList.remove('hide');
            _rootElm.style.display = 'block';
            _onCallback = onCallback;
        },
        close: function () {
            // _rootElm.classList.add('hide');
            _rootElm.style.display = 'none';
            console.log('close msg box')
        }
    }
}