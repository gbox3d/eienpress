const _type = 'TileMap';
const _mod = fabric.util.createClass(fabric.Object, {

    type: _type,
    // initialize can be of type function(options) or function(property, options), like for text.
    // no other signatures allowed.
    initialize: async function (options,onLoadImage) {

        this.callSuper('initialize', options);

        options || (options = {});


        // this.set('label', options.label || '');

        let root_path = options.webDiskSrc.root_path || './';
        let host_url = options.webDiskSrc.host_url || 'http://localhost:3000';
        let image_file = options.webDiskSrc.image_file || './assets/images/tilemap.png';

        let resp = await (fetch(`${host_url}/api/v2/webdisk/readFile`, {
            method: 'POST',
            body: `${root_path}\n${image_file}`,
            headers: {
                'Content-Type': 'text/plain'
            }
        }))

        if (resp.ok) {
            let responseAsBlob = await resp.blob() //바이너리 원본데이터얻기 
            let imgUrl = URL.createObjectURL(responseAsBlob); //url 객체로 변환
            let _imgObj = await new Promise((resolve, reject) => {
                fabric.util.loadImage(imgUrl, function (imgElement) {
                    resolve(imgElement);
                });
            });

            this.set('imgObj', _imgObj);
            console.log(`load complete ${image_file}`);

            onLoadImage(this)
        }
        else {
            console.log('error', resp.status)
            onLoadImage(null)
        }


    },

    toObject: function () {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            label: this.get('label'),
            webDiskSrc: this.get('webDiskSrc'),
            indexMap: this.get('indexMap'),
            tileSize: this.get('tileSize'),
            mapSize: this.get('mapSize')
        });
    },
    _render: function (ctx) {
        this.callSuper('_render', ctx);

        var rx = this.rx ? Math.min(this.rx, this.width / 2) : 0,
            ry = this.ry ? Math.min(this.ry, this.height / 2) : 0,
            w = this.width,
            h = this.height,
            x = -this.width / 2,
            y = -this.height / 2,
            isRounded = rx !== 0 || ry !== 0,
            k = 1 - 0.5522847498;

        console.log(ctx.canvas)

        let tileSize = this.tileSize;
        let mapSize = this.mapSize;
        let indexMap = this.indexMap;

        let imgElement = this.get('imgObj')

        let tileLibWidth = imgElement.width / tileSize

        for (let iy = 0; iy < mapSize.height; iy++) {
            for (let ix = 0; ix < mapSize.width; ix++) {
                let index = indexMap[iy * mapSize.width + ix];
                let tileX = (index % tileLibWidth) * tileSize;
                let tileY = Math.floor(index / tileLibWidth) * tileSize;

                let _x = (ix * tileSize) + x;
                let _y = (iy * tileSize) + y;

                ctx.drawImage(imgElement,
                    tileX, tileY, tileSize, tileSize, //src
                    _x, _y, tileSize, tileSize //dest
                )
            }
        };
    }
});

//씬로딩 시에 필요함 
_mod.fromObject = async function (_object, callback) {
    console.log('hello fromObject');

    var object = fabric.util.object.clone(_object);

    let _obj =  await new Promise((resolve, reject) => {
        new _mod(object, function (instObj) {
            resolve(instObj);
        });
    })

    callback(_obj);

};

fabric[_type] = _mod; //fabric에 새로운 클래스를 추가한다.

console.log(`LabelRect plugin added`)
