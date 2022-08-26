// 참고 : http://fabricjs.com/fabric-intro-part-3#subclassing
//WdImage 의 코드 간결화 버전
const _type = 'RmdTileImage';

const _mod = fabric.util.createClass(
    fabric.Object, // Image 클래스를 상속받음
    {
        type: _type, // 타입 설정
        initialize: async function (imgElement, options) {

            options || (options = {});
            this.callSuper('initialize', options);

            // this.set('textureName', options.textureName || '');
            // this.set('tileSize', options.tileSize || {width:0,height:0});
            this.set('width', options.tileSize);
            this.set('height', options.tileSize);
            this.set('sheetIndex', options.sheetIndex);
            this.set('_elements', imgElement);

            // const _texture = await fabric.plugins.resourceDB.getTexture(this.get('textureName'));
            // this.callSuper('initialize', imgElement, options);
            console.log('RmdTileImage initialize', this.get('textureName'))

        },
        toObject: function () {
            return fabric.util.object.extend(
                this.callSuper('toObject'),
                {
                    textureName: this.get('textureName'),
                    tileSize: this.get('tileSize'),
                    tileIndex: this.get('tileIndex'),
                    sheetIndex: this.get('sheetIndex')
                }
            );
        },
        _render: function (ctx) {
            // // console.log('MyImage render code ')
            // //부모 함수 콜
            // this.callSuper('_render', ctx);

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
            let index = this.tileIndex;
            let sheetIndex = this.sheetIndex;

            let imgElement = this.get('_elements')[sheetIndex]

            let tileLibWidth = imgElement.width / tileSize
            
            let tileX = (index % tileLibWidth) * tileSize;
            let tileY = Math.floor(index / tileLibWidth) * tileSize;

            // let _x = (ix * tileSize) + x;
            // let _y = (iy * tileSize) + y;

            ctx.drawImage(imgElement,
                tileX, tileY, tileSize, tileSize, //src
                x, y, tileSize, tileSize //dest
            )
        },
        setTextureName: async function (textureName) {
            
            let _tex = await fabric.plugins.resourceDB.getTexture(textureName)

            if(_tex) {
                // console.log('setTextureName', textureName)
                this.set('_elements', _tex.imgElements);
                this.set('dirty', true); //재 랜더링
                this.set('sheetIndex', 0);
                // this.setElement(_tex.imgElement);
                this.set('textureName', textureName);
            }

            return
        },
        setSheetIndex: function (sheetIndex) {
            this.set('sheetIndex', sheetIndex);
            this.set('dirty', true); //재 랜더링
        },
        setTileIndex: function (_index) {
            this.set('tileIndex', _index);
            this.set('dirty', true); //재 랜더링
        }  
    }
);

//클로닝 또는 데이터로딩시에 사용
_mod.fromObject = function (object, callback) {
    // var object = fabric.util.object.clone(_object);
    fabric.Image.prototype._initFilters.call(object, object.filters, function (filters) {
        object.filters = filters || [];
        fabric.Image.prototype._initFilters.call(object, [object.resizeFilter], function (resizeFilters) {
            object.resizeFilter = resizeFilters[0];

            fabric.util.enlivenObjects([object.clipPath], async function (enlivedProps) {
                object.clipPath = enlivedProps[0];

                const _texture = await fabric.plugins.resourceDB.getTexture(object['textureName']);

                callback(new _mod(_texture.imgElements, object));
            });
        });
    });

};

fabric[_type] = _mod; //플러그인추가 
