import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";

import 'md5';


export default async function (_Context) {

    const _htmlText = `
    <div class="ui-view">
        <form class='w3-container file-info'>
            <label>id</label>
            <input class="w3-input" type="text" name='id'>
            <label>creator</label>
            <input class="w3-input" type="text" name='creator'>
            <label>title</label>
            <input class="w3-input" type="text" name='title'>
            <label>description</label>
            <input class="w3-input" type="text" name='description'>
            <label>directory</label>
            <input class="w3-input" type="text" name='directory'>
            <input class="w3-check w3-margin-top" type="checkbox" checked="checked" name='isPublic'> public <br><br>
            <label>created</label>
            <input class="w3-input" type="text" name='created'>
            <label>file type</label>
            <input class="w3-input" type="text" name='file_type'>
            <label>file size</label>
            <input class="w3-input" type="text" name='file_size'>
            <label>source name</label>
            <input class="w3-input" type="text" name='src_name'>
            <label>file path</label>
            <input class="w3-input" type="text" name='file_path'>
            <label>file md5</label>
            <input class="w3-input" type="text" name='file_md5'>
                
        </form>
    </div>
    `;

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');
    const _rootElm = htmlDoc.querySelector('.ui-view');
    const host_url = _Context.host_url;

    // _rootElm.style.width ='512px';
    _rootElm.style.height ='512px';
    _rootElm.style.overflow ='auto';
    
    console.log('complete setup uiMain');

    return {
        element: _rootElm,
        setData : async function (data) {
            console.log(data);
            const form = _rootElm.querySelector('.file-info');

            // _fileInfoElm.querySelector('input[name=id]').value = res.data._id;
                // _fileInfoElm.querySelector('input[name=creator]').value = res.data.creator;
                // _fileInfoElm.querySelector('input[name=title]').value = res.data.title;
                // _fileInfoElm.querySelector('input[name=description]').value = res.data.description;
                // _fileInfoElm.querySelector('input[name=directory]').value = res.data.directory;
                // _fileInfoElm.querySelector('input[name=isPublic]').checked = res.data.isPublic;
                // _fileInfoElm.querySelector('input[name=created]').value = res.data.date;
                // _fileInfoElm.querySelector('input[name=file_type]').value = res.data.fileType;
                // _fileInfoElm.querySelector('input[name=file_size]').value = res.data.size;
                // _fileInfoElm.querySelector('input[name=src_name]').value = res.data.srcName;
                // _fileInfoElm.querySelector('input[name=file_path]').value = res.data.filepath;
                // _fileInfoElm.querySelector('input[name=file_md5]').value = res.data.md5;

            form.elements.id.value = data._id;
            form.elements.creator.value = data.creator;
            form.elements.title.value = data.title;
            form.elements.description.value = data.description;
            form.elements.directory.value = data.directory;
            form.elements.isPublic.checked = data.isPublic;
            form.elements.created.value = data.date;
            form.elements.file_type.value = data.fileType;
            form.elements.file_size.value = data.size;
            form.elements.src_name.value = data.srcName;
            form.elements.file_path.value = data.filepath;
            form.elements.file_md5.value = data.md5;
        }
        // getSelection: function () {
        //     return select_Item;
        // }
    }

}