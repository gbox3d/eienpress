import { makeFormBody, comFileUpload, makeFileObj } from "../modules/comLibs/utils.js";
const host_url = ''

async function main() {

    const mainContainer = document.querySelector('#mainContainer');
    mainContainer.style.display = 'none';
    

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
            document.querySelector('#authStatus').querySelector('h3').innerHTML = `login ok ${res.user.userName}`;
            mainContainer.style.display = 'block';


            let _result = await (await (fetch(`${host_url}/com/file/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                    'authorization': localStorage.getItem('jwt_token')
                },
                body: makeFormBody({
                    userId : 'all',
                    fileType: '',
                    directory : 'scene',
                    skip: 0,
                    limit: 100
                })
            }))).json();

            console.log(_result);

            const _ul = document.querySelector('#roomList');
            if(_result.r === 'ok') {

                let _fileList = _result.data;

                _fileList.forEach((item, index) => {
                    let _li = document.createElement('li');
                    _li.innerHTML = `
                        <h3> ${index} : ${item.title} </h3>
                        <a href="/Apps/metaWalker?gid=${item._id}"> 바로가기</a>
                    `;
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
