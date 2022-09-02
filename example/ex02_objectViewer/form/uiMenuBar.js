import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";

import 'md5';


export default async function (_Context) {

    const _htmlText = `
    <div class="ui-view w3-bar w3-light-grey">
        <a href="#" class="w3-bar-item w3-button">About</a>
        <div class="w3-dropdown-click">
            <button class="w3-button" >Viewer</button>
            <div class="w3-dropdown-content w3-bar-block w3-card-4">
                <a href="#" class="w3-bar-item w3-button" >clear</a>
                <a href="#" class="w3-bar-item w3-button" >camera reset</a>
                <a href="#" class="w3-bar-item w3-button" >add object</a>
            </div>
        </div>
        <div class="w3-dropdown-click">
            <button class="w3-button" >script</button>
            <div class="w3-dropdown-content w3-bar-block w3-card-4">
                <a href="#" class="w3-bar-item w3-button" >hello</a>
                <a href="#" class="w3-bar-item w3-button" >test1</a>
                <a href="#" class="w3-bar-item w3-button" >test2</a>
                
            </div>
        </div>
        
    </div>
    `;

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');
    const _rootElm = htmlDoc.querySelector('.ui-view');

    // _Context.menubar_container.appendChild(_rootElm);
    let callBack=null;
    //click event
    _rootElm.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const _target = e.target;
        //check if the target is contianed w3-bar-item class
        if (_target.classList.contains('w3-bar-item')) {
            const _targetText = _target.textContent;
            // console.log(_targetText);

            const dropDown = _target.closest('.w3-dropdown-click')

            if(dropDown) {
                callBack? callBack(_targetText,dropDown.querySelector('.w3-button').textContent) : null;
                dropDown.querySelector('.w3-dropdown-content').classList.toggle('w3-show')
            }
            else {
                callBack? callBack(_targetText) : null;
            }
            
            // dropDown ? dropDown.querySelector('.w3-dropdown-content').classList.toggle('w3-show') : null;

        }
        else if(_target.classList.contains('w3-button')){
            const dropDown = e.target.closest('.w3-dropdown-click')
            dropDown.querySelector('.w3-dropdown-content').classList.toggle('w3-show');
        }
        
    });

    function _hoverOffEvent(e) {
        e.preventDefault();
        e.stopPropagation();

        const dropDown = e.target.closest('.w3-dropdown-click')
        if(dropDown) {
            dropDown.querySelector('.w3-dropdown-content').classList.remove('w3-show');
        }
    }

    //add hover out events
    for(let ele of _rootElm.querySelectorAll('.w3-dropdown-click') ) {
        console.log(ele)
        ele.addEventListener('mouseleave', _hoverOffEvent);
    }
    
    console.log('complete setup menuBar');

    return {
        element: _rootElm,
        setCallback : (_callback )=> {
            callBack = _callback;
        }
    }

}