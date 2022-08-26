export default async function () {

    console.log('start...')

    const loginForm = document.querySelector('#login')
    const registerForm = document.querySelector('#register')
    const resultView = document.querySelector('#resultView')

    loginForm.querySelector('.register').addEventListener('click', (e) => {
        e.preventDefault()

        registerForm.classList.remove('hide')
        loginForm.classList.add('hide')
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        let _form = e.target

        try {
            let _result = await (await fetch('/api/v2/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: _form.userId.value,
                    userPw: _form.userPw.value
                })
            })).json()
    
            console.log(_result)
            if (_result.r === 'ok') {
                localStorage.setItem('jwt_token', _result.info.token)
                location.href = '/'
            }
            else {
                alert(_result.info)
            }
        }
        catch (err) {
            // PrintLog(err)
            console.log(err)
            alert(err.message)
        }
        

    })

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        console.log(e.target)
        let _form = e.target

        let _result = await (await fetch('/api/v2/users/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userName: _form.userName.value,
                userId: _form.userId.value,
                userPw: _form.userPw.value
            })
        })).json()

        if (_result.r === 'ok') {
            alert('회원가입 성공')
            // location.href = '/'

            loginForm.classList.remove('hide')
            registerForm.classList.add('hide')

        }
        else {
            alert(`회원가입 실패 : ${_result.info}`)
        }

        console.log(_result)
    });

    try {
        let _result = await (await fetch('/api/v2/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.getItem('jwt_token')
            }
        })).json()

        console.log(_result)
        if (_result.r === 'ok') {
            resultView.querySelector('h3').innerHTML = `welcome ${_result.user.userName}`
            resultView.classList.remove('hide')
            loginForm.classList.add('hide')
            registerForm.classList.add('hide')

        }
        else {
            
        }

    }
    catch(err) {
        console.log(err)
    }


}