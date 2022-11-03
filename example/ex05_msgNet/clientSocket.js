
import { io } from "https://cdn.socket.io/4.5.3/socket.io.esm.min.js";

export default async function setup({
    sceneMng,
}) {

    try {

        const objMng = sceneMng.objMng;
        const elvis = sceneMng.elvis;

        const socket = io('http://gears001.iptime.org:21041');

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
                            sceneMng: theApp.sceneMng
                        }
                    );

                    // let remoteObj = new dummyObject(theApp);
                    // remoteObj.remoteUser = evt.user;
                    // remoteObj.remoteSocketId = evt.user.id;

                    // theApp.sceneMng.objMng.addGameObject({
                    //     entity: remoteObj
                    // });

                    // let _host = theApp.sceneMng.elvis.gameObj_dummy.getObjectByName('host');
                    objMng.getGameObjectBysocketId({
                        socketId: socket.id
                    })?.sendControl();
                    

                    // theApp.remoteMatrix[evt.user.id] = new THREE.Matrix4();
                });

                socket.on('leaveRoom', (evt) => {
                    console.log('leaveRoom', evt);
                    objMng.removeGameObject({
                        socketId: evt.user.id
                    });
                });

                socket.on('message', (evt) => {
                    console.log('message', evt);
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
                            sceneMng : sceneMng
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
        }
    }
    catch (e) {
        console.log(e);
    }
    

}