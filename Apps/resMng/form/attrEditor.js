import { makeFormBody, comFileUpload, makeFileObj } from "../../../modules/comLibs/utils.js";

export default function (_Context) {

    const _htmlText = `
    <div class="form-root">
        <div>
        <form class="w3-container w3-light-grey" >
            <label>id</label>
            <input type="text" name="id" disabled class="w3-input w3-border-0" />
            
            <label>title</label>
            <input type="text" name="title" class="w3-input w3-border-0"/>
            <label>description</label>
            <textarea name="description" class="w3-input w3-border-0"></textarea>
            
            <label>type</label>
            <select name="type" class="w3-input w3-border-0">
                <option value="0">전시물</option>
                <option value="1">인태리어</option>
                <option value="2">건물</option>
            </select>

            <label>model file</label>
            <input name="model-file" class="w3-input w3-border-0" disabled/>
            <label>texture file</label>
            <input name="texture-file" class="w3-input w3-border-0" disabled/>

            <button class="w3-button w3-block w3-green w3-section w3-padding">Update</button>
        
        </form>
            
        </div>
    </div>
    `;

    const host_url = _Context.host_url;

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(_htmlText, 'text/html');

    const _rootElm = htmlDoc.querySelector('.form-root')
    // _rootElm.appendChild(htmlDoc.querySelector('.form-root'));


    const _formElm = _rootElm.querySelector('form');
    const waitModal = _Context.waitModal;
    // const uiMain = _Context.uiMain;

    _formElm.addEventListener('submit', async (evt) => {
        evt.preventDefault();
        //update object

        try {


            waitModal.show({
                msg:'업데이트 중입니다.'
            });

            const res = await (await fetch(`${host_url}/com/object/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                    'authorization': localStorage.getItem('jwt_token')
                },
                body: makeFormBody({
                    id: _formElm.querySelector('[name="id"]').value,
                    title: _formElm.querySelector('[name="title"]').value,
                    description: _formElm.querySelector('[name="description"]').value,
                    type: _formElm.querySelector('[name="type"]').value
                })
            })).json();

            waitModal.close();

            console.log(res);
            if(res.r === 'ok' && res.modifiedCount === 1) {
                alert('수정 완료');
                _Context.uiMain.updateList();
            }
            else {
                alert('수정 실패');
            }

        }
        catch (err) {
            console.log(err);
        }

    });

    _Context.attr_editor.appendChild(_rootElm);

    return {
        element: _rootElm,
        updateForm: async function ({ _id }) {

            let result = await (await fetch(`${host_url}/com/object/detail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                    'authorization': localStorage.getItem('jwt_token')
                },
                body: makeFormBody({
                    id: _id
                })
            })).json();

            console.log(result);

            if (result.r === 'ok') {
                const _formData = result.data;

                _formElm.querySelector('[name="id"]').value = _formData._id;
                _formElm.querySelector('[name="title"]').value = _formData.title;
                _formElm.querySelector('[name="description"]').value = _formData.description;
                _formElm.querySelector('[name="type"]').value = _formData.type;
                _formElm.querySelector('[name="model-file"]').value = _formData.modelFile;
                _formElm.querySelector('[name="texture-file"]').value = _formData.textureFile;
            }

            return
        }
    }

}