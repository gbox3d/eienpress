
export default async function (_Context,_htmlText) {


    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');
    const _rootElm = htmlDoc.querySelector('.ui-view');

    // _Context.menubar_container.appendChild(_rootElm);
    let callBack = null;

    //click event
    _rootElm.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const _target = e.target;
        //check if the target is contianed w3-bar-item class
        if (_target.classList.contains('w3-bar-item')) {
            const _targetText = _target.dataset.mid ? _target.dataset.mid : _target.textContent;

            const dropDown = _target.closest('.w3-dropdown-click')

            if (dropDown) {
                callBack ? callBack(_targetText, dropDown.querySelector('.w3-button').textContent) : null;
                dropDown ? dropDown.querySelector('.w3-dropdown-content').classList.toggle('w3-show') : null;
            }
            else {
                callBack ? callBack(_targetText,) : null;
            }
        }
        else if (_target.classList.contains('w3-button')) {
            const dropDown = e.target.closest('.w3-dropdown-click')
            dropDown.querySelector('.w3-dropdown-content').classList.toggle('w3-show');
        }

    });

    function _hoverOffEvent(e) {
        e.preventDefault();
        e.stopPropagation();

        const dropDown = e.target.closest('.w3-dropdown-click')
        if (dropDown) {
            dropDown.querySelector('.w3-dropdown-content').classList.remove('w3-show');
        }
    }

    //add hover out events
    for (let ele of _rootElm.querySelectorAll('.w3-dropdown-click')) {
        console.log(ele)
        ele.addEventListener('mouseleave', _hoverOffEvent);
    }

    console.log('complete setup uiMain');

    return {
        getElement : () => _rootElm,
        element: _rootElm,
        setCallback: (_callback) => {
            callBack = _callback;
        }

    }

}