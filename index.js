const host_url = ''

async function main() {
    // const tokenInput = document.querySelector('#authtoken input');

    // document.querySelector('#authtoken button').addEventListener('click', function () {

    //     localStorage.setItem('authToken', tokenInput.value);

    // });

    // tokenInput.value = localStorage.getItem('authToken');

    try {
        let res = await (await (fetch(`${host_url}/api/v2/users/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/text',
                // 'auth-token': localStorage.getItem('authToken')
                'authorization': localStorage.getItem('jwt_token')
            }
        }))).json();

        console.log(res);
        if (res.r === 'ok') {
            document.querySelector('#authtoken').hidden = true;
            document.querySelector('#authStatus').hidden = false;

            document.querySelector('#authStatus').querySelector('h3').innerHTML = `login ok ${res.user.userName}`;
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
