// import { comFileUpdate,makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";

import 'md5';


export default async function (_Context,onSubmit) {

    const _htmlText = `
    <div class="ui-view">
        <form class='w3-container file-info'>
            <label>id</label>
            <input class="w3-input" type="text" name='id' disabled >
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
            <input class="w3-input" type="text" name='created' disabled>
            <label>file type</label>
            <input class="w3-input" type="text" name='file_type'>
            <label>file size</label>
            <input class="w3-input" type="text" name='file_size' disabled>
            <label>source name</label>
            <input class="w3-input" type="text" name='src_name' disabled>
            <label>file path</label>
            <input class="w3-input" type="text" name='file_path' disabled>
            <label>file md5</label>
            <input class="w3-input" type="text" name='file_md5' disabled>
            <label>repoitory address</label>
            <input class="w3-input" type="text" name='repo_ip'>

            <button class="w3-button w3-blue w3-margin-top" type='submit'> change </button>
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

    const _form = _rootElm.querySelector('form');

    _form.addEventListener('submit', (e) => {
        e.preventDefault();

        onSubmit?.({
            id: _form.id.value,
            changeData : {
                title : _form.title.value,
                description : _form.description.value,
                directory : _form.directory.value,
                repo_ip : _form.repo_ip.value,
                fileType : _form.file_type.value
            }
        });

        // console.log(_form.title.value);

        // let res = await comFileUpdate({
        //     hostUrl: host_url,
        //     id: _form.id.value,
        //     changeData : {
        //         title : _form.title.value,
        //         description : _form.description.value,
        //         directory : _form.directory.value,
        //         repo_ip : _form.repo_ip.value
        //     }
        // });

        // console.log(res);

    });

    return {
        element: _rootElm,
        setData : async function (data) {
            console.log(data);
            const form = _rootElm.querySelector('.file-info');

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
            form.elements.repo_ip.value = data.repo_ip ? data.repo_ip : '';
        }
        // getSelection: function () {
        //     return select_Item;
        // }
    }

}