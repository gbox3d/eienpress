//////////////libs //////////////

function makeFileObj(file) {

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', (evt) => {
            resolve({
                file: file,
                data: evt.target.result
            });
        });
        reader.readAsArrayBuffer(file);
    })
}

function makeFormBody(data) {
    return Object.keys(data).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])).join('&');
}

//com file api utils
async function comFileUpload({ fileObj, title, description, directory, hostUrl, md5, fileType,id }) {

    let host_url = hostUrl ? hostUrl : '';
    
    let params = {
        directory: directory,
        fileName: fileObj.file.name,
        isPublic: true,
        title: title,
        description: description,
        size: fileObj.file.size,
        fileType: fileType,
        md5: md5,
        id : id
    };

    const query = makeFormBody(params);

    let res = await (await (fetch(`${host_url}/com/file/upload`, {
        method: 'POST',
        headers: {
            'Content-Type': fileObj.file.type,
            'authorization': localStorage.getItem('jwt_token'),
            'query': query
        },
        body: fileObj.data
    }))).json();
    
    return res;
}

async function textDataUpload({hostUrl='',name='',title='' ,directory='',description='',data,id=null }) {

    const fileObj = {
        file: {
            name: name + '.txt',
            size: data.length,
            type: 'application/text',
        },
        data: data
    }

    //     console.log(fileObj)
    let hash = md5(fileObj.data)
    // console.log(hash);

    const _res = await comFileUpload({
        fileObj: fileObj,
        fileType: 'application/text',
        title: title,
        description: description,
        directory: directory,
        isPublic: true,
        md5: hash,
        hostUrl: hostUrl,
        id : id
    });
    
    return _res;
}

async function comFileDownload({ fileID, hostUrl='' }) {
    let host_url = hostUrl ? hostUrl : '';
    return await (fetch(`${host_url}/com/file/download/pub/${fileID}`, {
        method: 'GET'
    }));
}

async function comFileFindFile({ hostUrl = '', filename = 'basic_envmap' }) {

    let _id = null;
    try {
        let res = await (await (fetch(`${hostUrl}/com/file/list`, {
            method: 'POST',
            headers: {
                // 'Content-Type': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'authorization': localStorage.getItem('jwt_token')
            },
            body: makeFormBody({
                userId: 'all',
                title: filename
            })
        }))).json();

        // console.log(res);
        if (res.r === 'ok') {
            if (res.data.length > 0) {
                _id = res.data[0]._id;
            }
            else {
                return null
                // theApp.messageModal.show({ msg: '기본 환경맵이 없습니다. (basic_envmap)' });
            }
        }
        return _id;

    }
    catch (e) {
        console.log(e);
    }

    return null

}

async function comFileGetDetail({ hostUrl = '', fileID }) {
    let host_url = hostUrl ? hostUrl : '';
    return await (await (fetch(`${host_url}/com/file/findOne/${fileID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/text',
            'authorization': localStorage.getItem('jwt_token')
        }
    }))).json();
    // console.log(res)
    // return res;
}

async function comFileDelete({id,host_url=''}) {

    let res = await (await (fetch(`${host_url}/com/file/delete/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/text',
            'authorization': localStorage.getItem('jwt_token')
        }
    }))).json();

    return res;
}




//webdisk file api
async function get_file_list({ path, hostUrl }) {
    let host_url = hostUrl ? hostUrl : '';
    //파일 리스팅 
    return await (await (fetch(`${host_url}/api/v2/webdisk/ls`, {
        method: 'POST',
        body: path,
        headers: {
            'Content-Type': 'application/text',
            'authorization': localStorage.getItem('jwt_token')
        }
    }))).json();
}

async function remove_file({ path, file, hostUrl }) {
    let host_url = hostUrl ? hostUrl : '';
    return await (await (fetch(`${host_url}/api/v2/webdisk/rm`, {
        method: 'POST',
        body: `${path}\n${file}`,
        headers: {
            'Content-Type': 'application/text',
            'authorization': localStorage.getItem('jwt_token')
        }
    }))).json();
}

//public api
async function getObjectDetail({ id, hostUrl }) {
    let host_url = hostUrl ? hostUrl : '';
    return await (await (fetch(`${host_url}/com/object/detail/pub/${id}`, {
        method: 'GET'
    }))).json();
}

async function getGalleryDetail({ id, hostUrl }) {
    let host_url = hostUrl ? hostUrl : '';
    return await (await (fetch(`${host_url}/com/gallery/detail/pub/${id}`, {
        method: 'GET'
    }))).json();
}

//////////////libs //////////////


export {
    makeFileObj,

    comFileUpload,
    textDataUpload,

    comFileDownload,
    comFileFindFile,
    comFileGetDetail,
    comFileDelete,

    makeFormBody,
    get_file_list,
    remove_file,
    getObjectDetail,
    getGalleryDetail

}