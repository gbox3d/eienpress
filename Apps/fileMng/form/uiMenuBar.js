import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";

import 'md5';


export default async function (_Context) {

    const _htmlText = `
    <div class="ui-view w3-bar w3-light-grey">
        <a href="#" class="w3-bar-item w3-button">About</a>
        <div class="w3-dropdown-click">
            <button class="w3-button" id='file' >File</button>
            <div class="w3-dropdown-content w3-bar-block w3-card-4">
                <a href="#" class="w3-bar-item w3-button" >Refresh</a>
                <a href="#" class="w3-bar-item w3-button" >Upload</a>
                <a href="#" class="w3-bar-item w3-button" >Download</a>
                <a href="#" class="w3-bar-item w3-button">Delete</a>
            </div>
        </div>
        <div class="w3-dropdown-click">
            <button class="w3-button">List</button>
            <div class="w3-dropdown-content w3-bar-block w3-card-4">
                <a href="#" class="w3-bar-item w3-button" data-mid='selectAll' >select all</a>
                <a href="#" class="w3-bar-item w3-button" data-mid='unSelectAll' >unselect all</a>
            </div>
        </div>
        
        <div class="w3-dropdown-click">
            <button class="w3-button">Dir</button>
            <div class="w3-dropdown-content w3-bar-block w3-card-4">
                <a href="#" class="w3-bar-item w3-button" data-mid='all' >all</a>
                <a href="#" class="w3-bar-item w3-button" data-mid='envmap' >envmap</a>
                <a href="#" class="w3-bar-item w3-button" data-mid='model' >model</a>
                <a href="#" class="w3-bar-item w3-button" data-mid='texture' >texture</a>
                <a href="#" class="w3-bar-item w3-button" data-mid='sound' >sound</a>
                <a href="#" class="w3-bar-item w3-button" data-mid='video' >video</a>
                <a href="#" class="w3-bar-item w3-button" data-mid='script' >script</a>
                <a href="#" class="w3-bar-item w3-button" data-mid='text' >text</a>
                <a href="#" class="w3-bar-item w3-button" data-mid='material' >material</a>
                <a href="#" class="w3-bar-item w3-button" data-mid='prefab' >prefab</a>
                <a href="#" class="w3-bar-item w3-button" data-mid='scene' >scene</a>
                <a href="#" class="w3-bar-item w3-button" data-mid='selectDir' >Change Any Directory</a>
            </div>
        </div>
    </div>
    `;


    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');
    const _rootElm = htmlDoc.querySelector('.ui-view');

    _Context.menubar_container.appendChild(_rootElm);
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


    // _rootElm.querySelector('.w3-dropdown-hover').addEventListener('click', (e) => {
    //     e.preventDefault();
    //     console.log(e.target.dataset.mid);
    //     // close hover

    //     // e.target.closest('.w3-dropdown-content').style.display = 'none';
    //     // setTimeout(() => {
    //     //     e.target.closest('.w3-dropdown-content').style.display = 'block';
    //     // }, 100);
    // })      


    console.log('complete setup uiMain');

    return {
        element: _rootElm,
        setCallback: (_callback) => {
            callBack = _callback;
        }

    }

}