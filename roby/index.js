import { makeFormBody, comFileUpload, makeFileObj } from "../modules/comLibs/utils.js";
const host_url = ''

async function main() {

    const mainContainer = document.querySelector('#mainContainer');
    mainContainer.style.display = 'none';

    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });

    // console.log(location.hostname);
    // console.log(location.port);

    try {

        //고르인 정보 얻기 
        let res = await (await (fetch(`${host_url}/api/v2/users/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/text',
                'authorization': localStorage.getItem('jwt_token')
            }
        }))).json();
        console.log(res);

        if (res?.r === 'ok') {
            document.querySelector('#authtoken').hidden = true;
            document.querySelector('#authStatus').hidden = false;
            document.querySelector('#authStatus').querySelector('h3').innerHTML = `login ok ${res.user.userName} [${res.user.userId}]`;
            mainContainer.style.display = 'block';

            let _result = await (await (fetch(`${host_url}/com/file/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                    'authorization': localStorage.getItem('jwt_token')
                },
                body: makeFormBody({
                    userId : res.user.userId,// 'all',
                    fileType: '',
                    directory : 'scene',
                    skip: 0,
                    limit: 100
                })
            }))).json();

            console.log(_result);

            const _ul = document.querySelector('#roomList');
            _ul.addEventListener('click', function (e) {
                if (e.target.classList.contains('btn-copy')) {
                    const _id = e.target.closest('LI').dataset.id;
                    const _url = `${location.origin}/Apps/metaWalker?gid=${_id}`;
                    navigator.clipboard.writeText(_url);
                    console.log(_url)
                }
            });

            
            

            if(_result.r === 'ok') {

                let _fileList = _result.data;

                _fileList.forEach((item, index) => {
                    const _url = `/Apps/metaWalker?gid=${item._id}`;
                    let _li = document.createElement('li');
                    _li.innerHTML = `
                        <h3> ${index} : ${item.title} </h3>
                        <a href="${_url}"> 바로가기</a>
                        <button class='btn-copy' ">링크복사</button>
                    `;
                    _li.dataset.id = item._id;
                    _ul.appendChild(_li);
                            
                    console.log(item._id, item.title);
                });
                
            }
            else {
                let _li = document.createElement('li');
                    _li.innerHTML = `
                        <h3> error </h3>
                    `;
                    _ul.appendChild(_li);

            }

        }
        else {
            document.querySelector('#authtoken').hidden = false;
            document.querySelector('#authStatus').hidden = true;
            // document.querySelector('#authStatus').querySelector('h3').innerHTML = `login failed`;
        }
    }
    catch (err) {
        console.log(err)
    }

    document.querySelector('#authStatus .logout').addEventListener('click', function () {
        localStorage.removeItem('jwt_token');
        location.reload();
    });


}

export default main;
