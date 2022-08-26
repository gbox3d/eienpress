
const resourceDB = {
    textures: {},
    _loadTexture: async function (texture) {

        const context = this;
        const host_url = this.host_url;
        const root_path = this.root_path;

        context.textures[texture.name] = {
            name: texture.name,
            path: texture.paths,
            imgElements: [],
            bLoaded : false
        }
        for (const path of texture.path) {

            const resp = await (fetch(`${host_url}/api/v2/webdisk/readFile`, {
                method: 'POST',
                body: `${root_path}\n${path}`,
                headers: {
                    'Content-Type': 'text/plain',
                    'auth-token': this.authToken
                }
            }))

            if (resp.ok) {
                let responseAsBlob = await resp.blob() //바이너리 원본데이터얻기 
                let imgUrl = URL.createObjectURL(responseAsBlob); //url 객체로 변환
                let _imgElement = await new Promise((resolve, reject) => {
                    fabric.util.loadImage(imgUrl, function (imgElement) {
                        resolve(imgElement);
                    });
                });
                context.textures[texture.name].imgElements.push(_imgElement);

                console.log(`${path} loaded`)
            }
            else {
                console.log(`${path}`, resp.status)
            }

        }
        context.textures[texture.name].bLoaded = true;

    },
    waitLoadComplete: function (textureName) {
        console.log(`wait load ${textureName}`)
        const context = this;
        return new Promise((resolve, reject) => {
            if (context.textures[textureName].bLoaded) {
                resolve(context.textures[textureName]);
            }
            else {
                setTimeout(() => {
                    context.waitLoadComplete(textureName).then(resolve);
                }, 100);
            }
        })
    },
    init: async function (option) {

        const context = this;

        this.host_url = option.webDiskInfo.host_url || 'http://localhost:3000'
        this.root_path = option.webDiskInfo.root_path || './'
        this.authToken = option.authToken
        this.database = option.database

        const resp = await (fetch(`${this.host_url}/api/v2/webdisk/readFile`, {
            method: 'POST',
            body: `${this.root_path}\n${this.database}`,
            headers: {
                'Content-Type': 'text/plain',
                'auth-token': this.authToken
            }
        }))

        if (resp.ok) {
            let _db = await resp.json() //바이너리 원본데이터얻기

            for (const item of _db ) {
                switch(item.type) {
                    case 'video':
                        break;
                    case 'audio':
                        break;
                    case 'binary':
                        break;
                    case 'texture':
                    default:
                        context.textures[item.name] = item;
                        break;

                }
                
            }
            console.log(`${this.database} loaded`)
        }
        return context
    },
    getTexture: async function (name) {
        const context = this;

        if (context.textures[name].imgElements) {
            if(context.textures[name].bLoaded)
                return context.textures[name];
            else {
                return await context.waitLoadComplete(name);
            }
        }
        else {
            console.log('loading texture', name)
            await context._loadTexture(context.textures[name]);
            console.log('loaded texture', name)
            return context.textures[name];

        }
    }
}


fabric.plugins ? fabric.plugins.resourceDB = resourceDB : fabric.plugins = { resourceDB: resourceDB };
// fabric.plugins.initResourceDB = initResourceDB;



console.log(`fabric.plugins.resourceDB setup`)

