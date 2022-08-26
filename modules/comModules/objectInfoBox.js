import objectViewerSetup from './objectViewer.js';

export default async function (_Context) {

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(
        `
    <div class="w3-modal">
        <div class="w3-modal-content">
            <header class="w3-container w3-teal">
                <div class="w3-center">
                    <span class="w3-button w3-xlarge w3-hover-red w3-display-topright" title="Close Modal">&times;</span>
                    <h2 name=title >Title</h2>
                </div>
            </header>
            <div class="w3-container">
                <div class="w3-light-grey">
                    <div name="progressBar" class="w3-container w3-green w3-center w3-hide" style="width:0%">0%</div>
                </div>
                <p class='msg' ></p>
                <div style="width:256px;height:256px;" name="gl-container" ></div>
            </div>

        </div>
  </div>

    </div>`
        , 'text/html');

    const _rootElm = htmlDoc.querySelector('.w3-modal');
    _Context.modalContainer.appendChild(_rootElm);
    const _Msg = _rootElm.querySelector('.w3-container .msg');
    const _title = _rootElm.querySelector('h2[name=title]');
    const _glContainer = _rootElm.querySelector('div[name=gl-container]');
    const _progressBar = _rootElm.querySelector('div[name=progressBar]');
    

    let mObjViewer;

    function closeModal() {

        _Msg.innerText = ''
        _rootElm.style.display = 'none';
    }

    _rootElm.querySelector('[title="Close Modal"]').addEventListener('click', closeModal);

    return {
        element: _rootElm,
        show: async function ({ title, msg, modelFile, textureFile,fileId }) {
            _Msg.innerText = msg
            _title.innerText = title
            _rootElm.style.display = 'block';

            
            if (mObjViewer === undefined) {
                mObjViewer = await new Promise(resolve => {
                    objectViewerSetup({
                        Context: theApp,
                        container: _glContainer,
                        envMapFile : '62837f89be7f388aab7750e9',
                        onComplete: function (scene) { // 모듈 초기화 완료
                            console.log('sceneEditorSetup complete');
                            console.log(scene);
                            resolve(scene);
                        }
                    });
                });
                console.log(mObjViewer);
            }

            
            _progressBar.classList.remove('w3-hide');

            mObjViewer.clearObject();

            let object = await mObjViewer.addObject({
                fileId : fileId,
                modelFile : modelFile,
                textureFile : textureFile,
                diffuseColor: '#ffffff',
                onProgress: (progress) => {
                    _progressBar.style.width = `${progress.progress}%`;
                    _progressBar.innerText = `${ _.round(progress.progress,2)}%`;
                }
            })

            _progressBar.classList.add('w3-hide');

            

            console.log(object);

        },
        update: function (msg) {
            _Msg.innerText = msg;
        },
        close(delay) {
            delay = delay || 0;
            setTimeout(closeModal, delay);
        },
        closeWait: function (delay) {
            return new Promise(resolve => {
                delay = delay || 0;
                setTimeout(() => {
                    closeModal();
                    resolve();
                }, delay);

            })
        }
    }
}