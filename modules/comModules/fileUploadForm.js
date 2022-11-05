export default function (_Context) {

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(
        `

        <div class="w3-modal">
            <div class="w3-modal-content">
                
                <header class="w3-container  w3-teal">
                    <div class="w3-center">
                    <span class="w3-button w3-xlarge w3-hover-red w3-display-topright" title="Close Modal">&times;</span>
                    <h2>upload form</h2>
                    </div>
                    
                </header>

                <form class="w3-container">

                    <div class="w3-section">

                        <label>Title</label>
                        <input class="w3-input" type="text" name='title'>
                        
                        <label>Description</label>
                        <input class="w3-input" type="text" name='desc'>

                        <label>Directory</label>
                        <input class="w3-input" type="text" name='directory'>

                        <input class="w3-check w3-margin-top" type="checkbox" checked="checked"> public
                        <br><br>

                        <label>File type</label>
                        <input class="w3-input" type="text" name='fileType'>
                        
                        <div style="height: 80px;">
                            <label>File </label>
                            <input type="file">
                        </div>
                        
                        <button class='ok w3-button w3-green' >Ok</button>
                        <button class='close w3-button w3-green' >Close</button>

                    </div>

                </form>


            </div>
        </div>`
        , 'text/html');

    const _rootElm = htmlDoc.querySelector('.w3-modal');
    _Context.modalContainer.appendChild(_rootElm);

    const _titleInput = _rootElm.querySelector('form.w3-container input[name="title"]');
    const _descInput = _rootElm.querySelector('form.w3-container input[name="desc"]');
    const _directoryInput = _rootElm.querySelector('form.w3-container input[name="directory"]');
    const _publicCheckbox = _rootElm.querySelector('form.w3-container input[type="checkbox"]');
    const _fileInput = _rootElm.querySelector('form.w3-container input[type="file"]');
    const _fileTypeInput = _rootElm.querySelector('form.w3-container input[name="fileType"]');

    let _onCallback = null;

    _rootElm.querySelector('form.w3-container button.close').addEventListener('click', (evt) => {

        evt.preventDefault();
        _rootElm.style.display = 'none';
        _onCallback ? _onCallback() : null;
    });

    _rootElm.querySelector('form.w3-container input[type="file"]').addEventListener('change', (evt) => {
        console.log(evt.target.files[0])

        //이름항목이 공백이면 이름 넣기
        _titleInput.value == '' ? _titleInput.value = evt.target.files[0].name : null;

        _fileTypeInput.value = evt.target.files[0].type;

        // get ext type
        const ext = evt.target.files[0].name.split('.').pop();

        if(ext == 'jpg' || ext == 'png' || ext == 'gif' || ext == 'jpeg') {
            _directoryInput.value = 'texture';
        } else if(ext == 'mp4' || ext == 'avi' || ext == 'mov') {
            _directoryInput.value = 'video';
        } else if(ext == 'mp3' || ext == 'wav') {
            _directoryInput.value = 'audio';
        } else if(ext == 'obj' || ext == 'fbx' || ext == 'dae') {
            _directoryInput.value = 'model';
        } else if(ext == 'hdr' || ext == 'exr') {
            _directoryInput.value = 'envmap';
        } else {
            _directoryInput.value = '';
        }
        
        if(_fileTypeInput.value === '') {
            _fileTypeInput.value = `application/${ext}`;
        }

    });

    _rootElm.querySelector('form.w3-container button.ok').addEventListener('click', (evt) => {

        _rootElm.style.display = 'none';
        evt.preventDefault();
        const file = _fileInput.files[0];

        _onCallback ? _onCallback({
            file: file,
            fileType : _fileTypeInput.value,
            title: _titleInput.value,
            description: _descInput.value,
            public: _publicCheckbox.checked,
            directory: _directoryInput.value
        }) : null;

        
    });

    _rootElm.querySelector('[title="Close Modal"]').addEventListener('click', (evt) => {
        evt.preventDefault();
        _rootElm.style.display = 'none';
        _onCallback ? _onCallback() : null;
    });



    return {
        element: _rootElm,
        show: function ({ onCallback, title, description, directory, isPublic=true, fileType }) {
            // _rootElm.classList.remove('hide');
            _fileInput.value = '';
            _titleInput.value = title ? title : '';
            _descInput.value = description ? description : '';
            _directoryInput.value =  directory ? directory : '';
            _publicCheckbox.checked = isPublic;
            _fileTypeInput.value = fileType ? fileType : '';
            

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