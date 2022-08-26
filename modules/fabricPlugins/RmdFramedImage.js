// 참고 : http://fabricjs.com/fabric-intro-part-3#subclassing
//WdImage 의 코드 간결화 버전
const _type = 'RmdFramedImage';

const _mod = fabric.util.createClass(
    fabric.Object, // Image 클래스를 상속받음
    {
        type: _type, // 타입 설정
        initialize: async function (imgElement, options) {

            options || (options = {});
            this.callSuper('initialize', options);
            this.set('_element', imgElement);
            this.set('sheetIndex', options.sheetIndex);
            // console.log('RmdImage initialize', this.get('textureName'))

        },
        toObject: function () {
            return fabric.util.object.extend(
                this.callSuper('toObject'),
                {
                    textureName: this.get('textureName'),
                    fromXPos: this.get('fromXPos'),
                    fromYPos: this.get('fromYPos'),
                    sheetIndex: this.get('sheetIndex')
                }
            );
        },
        _render: function (ctx) {
            let w = this.width,
                h = this.height,
                x = -this.width / 2,
                y = -this.height / 2

            
            let imgElement = this.get('_element')[this.sheetIndex];

            // console.log(`${_type} _render ${this.get('textureName')}`)

            ctx.drawImage(imgElement,
                this.fromXPos, this.fromYPos, w, h, //src
                x, y, w, h //dest
            )


        },
        setTextureName: async function (textureName) {
            
            let _tex = await fabric.plugins.resourceDB.getTexture(textureName)

            if(_tex){
                
                // console.log('setTextureName', textureName)
                this.set('_element', _tex.imgElement);
                this.set('dirty', true);
                this.set('textureName', textureName);
            }
        },
        setSheetIndex: function (sheetIndex) {
            this.set('sheetIndex', sheetIndex);
            this.set('dirty', true); //재 랜더링 플래그 설정
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

                callback(new _mod(_texture.imgElement, object));
            });
        });
    });

};

fabric[_type] = _mod; //플러그인추가 
