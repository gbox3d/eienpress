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
        location.href = '/';
    });


}

export default main;
