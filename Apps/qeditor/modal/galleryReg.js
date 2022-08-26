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
                <h2>Gallery Registration</h2>
                </div>
                
            </header>

            <form class="w3-container">
                <div class="w3-section">
                
                    <label><b>제목</b></label>
                    <input class="w3-input w3-border w3-margin-bottom" type="text"  name="title" required>
                    
                    <label><b>설명</b></label>
                    <textarea class="w3-input w3-border" type="text" name="description" required></textarea>
                
                    <button class="w3-button w3-block w3-green w3-section w3-padding" type="submit"> 등록 </button>
                </div>
            </form>
        </div>
    </div>`
        , 'text/html');

    const _rootElm = htmlDoc.querySelector('.w3-modal');
    // const _msgText = _rootElm.querySelector('.modal-content h2');
    _Context.modalContainer.appendChild(_rootElm);

    let _onCallback = null;

    function closeForm() {
        _rootElm.querySelector('form').reset();
        _rootElm.style.display = 'none';
    }

    _rootElm.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        
        const title = form.querySelector('[name=title]').value;
        const description = form.querySelector('[name=description]').value;

        const data = {
            title: title,
            description: description
        };

        if (_onCallback) {
            _onCallback(data);
        }
        
        closeForm();

    });

    _rootElm.querySelector('[title="Close Modal"]').addEventListener('click', closeForm);

    return {
        element: _rootElm,
        show: function ({ onCallback }) {
            _rootElm.style.display = 'block';
            _onCallback = onCallback;
        },
        close: closeForm
    }
}