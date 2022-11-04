
import { io } from "https://cdn.socket.io/4.5.3/socket.io.esm.min.js";

export default async function setup({
    renderEngine,
    ioServerUrl = "http://gears001.iptime.org:21041",
    onMessage 
}) {

    let userInfo;
    try {

        const objMng = renderEngine.objMng;
        // const elvis = sceneMng.elvis;

        const socket = io(ioServerUrl);

        await new Promise((resolve, reject) => {

            socket.on('connect', async () => {

                console.log(`connect `, socket);

                socket.on('joinRoom', (evt) => {
                    console.log('joinRoom', evt);
                    objMng.addGuestGameObject(
                        {
                            user: evt.user,
                            roomName: evt.user.room,
                            socket: socket,
                            sceneMng: renderEngine
                        }
                    );

                    objMng.getGameObjectBysocketId({
                        socketId: socket.id
                    })?.sendControl();
                    onMessage?.({
                        user : evt.user,
                        msg : `${evt.user.userName} joined`
                    });

                    // theApp.remoteMatrix[evt.user.id] = new THREE.Matrix4();
                });

                socket.on('leaveRoom', (evt) => {
                    console.log('leaveRoom', evt);
                    objMng.removeGameObject({
                        socketId: evt.user.id
                    });

                    onMessage?.({
                        user : evt.user,
                        msg : `${evt.user.userName} left`
                    });
                });

                socket.on('message', (evt) => {
                    console.log('message', evt);
                    onMessage(evt);
                });

                socket.on('control', (evt) => {
                    console.log('control', evt);

                    let _guest = objMng.getGameObjectBysocketId({
                        socketId: evt.user.id
                    });


                    if (_guest) {
                        _guest.receiveControl({
                            data: evt.data,
                            user: evt.user
                        });
                    }
                    else {

                        objMng.addGuestGameObject({
                            user: evt.user,
                            roomName: evt.user.room,
                            socket: socket,
                            data: evt.data,
                            sceneMng: renderEngine
                        });
                    }

                    // theApp.sceneMng.elvis.gameObj_dummy.getObjectByProperty('remoteSocketId', evt.user.id)?.receiveControl(evt);
                    // console.log('disconnect ');
                });

                socket.on('disconnectUser', (evt) => {
                    console.log('disconnectUser ', evt);

                    // theApp.sceneMng.objMng.removeGameObject(evt.socketID);
                });

                resolve();
            });
        });

        socket.on('disconnect', (evt) => {
            console.log('disconnect ', evt);
        });

        return {
            socket: socket,
            sendMessage: (msg) => {
                socket.emit('message', {
                    to: userInfo.room,
                    message: msg
                }, (evt) => {
                    console.log('sendMessage', evt);
                });
            },
            sendControl: (data) => {
                socket.emit('control', {
                    to: userInfo.room,
                    data: data
                },
                    (evt) => {
                        console.log('sendControl', evt);
                    }
                );
            },
            setUserInfo(info) {
                userInfo = info;
            }
        }
    }
    catch (e) {
        console.log(e);
    }


}