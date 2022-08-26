
async function main() {

    const loginStatus = document.querySelector('#userStatus')
    const videoElem = document.querySelector("video");
    
    const testBtn = document.querySelector('button#test');
    const startBtn = document.querySelector('button#start');

    const infoMsg = document.querySelector('#infoMsg');

    const camPreviewCanvas = document.querySelector('canvas#camPreview');

    const storage = []

    try {

        globalThis.theApp = {
            host_url: '',
            modalContainer: document.querySelector('.modal-container'),
        }

        let res = await (await (fetch(`${theApp.host_url}/api/v2/users/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/text',
                'authorization': localStorage.getItem('jwt_token')
            }
        }))).json();

        console.log(res);

        if (res.r === 'ok') {

            loginStatus.innerHTML = `${res.user.userName} 님 환영합니다.`;
        }
        else {
            loginStatus.innerHTML = `로그인이 필요합니다. <a href="/login">로그인</a>`;
            // alert('로그인이 필요합니다.');
        }

        startBtn.addEventListener('click', async () => {

            infoMsg.innerHTML = 'camera 준비중...'

            let stream = await navigator.mediaDevices.getUserMedia({ video: true });

            console.log(stream);

            videoElem.onplaying = () =>
            console.log("video playing stream:", videoElem.srcObject);
            videoElem.srcObject = stream;

            infoMsg.innerHTML = 'camera 준비완료'
        });
        testBtn.addEventListener('click', async () => {

            let canvas = camPreviewCanvas
            const ctx = canvas.getContext("2d");

            canvas.height = videoElem.videoHeight;
            canvas.width = videoElem.videoWidth;

            ctx.drawImage(videoElem, 0, 0, canvas.width, canvas.height);
            
            // const data = canvas.toDataURL("image/png");
            // const res = await (await (fetch(`${theApp.host_url}/api/v2/users/`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/text',
            //         'authorization': localStorage.getItem('jwt_token')
            //     },
            //     body: data
            // }))).json();
            // console.log(res);
        });

        // (data check on the interval value), then convert that value from seconds 
        // let _intervalSec = parseInt(intervalSec.value)
        // let _intervalSec = 1;

        // const interval = ( _intervalSec>= 1 ? _intervalSec * 1 : 1) * 1000;
        // let captureInterval = setInterval(async () => {
        //     // I am not assuming the source video has fixed dimensions
        //     canvas.height = videoElem.videoHeight;
        //     canvas.width = videoElem.videoWidth;
        //     ctx.drawImage(videoElem, 0, 0);
        //     canvas.toBlob(blob => {
        //         console.log(blob);
        //         storage.push(blob);
        //     });
        // }, interval);




    }
    catch (err) {
        console.error(err);
    }





}



export default main;