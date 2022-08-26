// 참고 : http://fabricjs.com/fabric-intro-part-3#subclassing
//WdImage 의 코드 간결화 버전
const _type = 'RmdImage';

const _mod = fabric.util.createClass(
    fabric.Image, // Image 클래스를 상속받음
    {
        type: _type, // 타입 설정
        initialize: async function (imgElement, options) {

            options || (options = {});

            this.set('textureName', options.textureName || '');
            this.set('sheetIndex', options.sheetIndex);
            this.set('_elements', imgElement);

            this.callSuper('initialize', imgElement[this.sheetIndex], options);

            console.log('RmdImage initialize', this.get('textureName'))

        },
        toObject: function () {
            return fabric.util.object.extend(
                this.callSuper('toObject'),
                {
                    textureName: this.get('textureName'),
                    sheetIndex: this.get('sheetIndex')
                }
            );
        },
        _render: function (ctx) {
            // console.log('MyImage render code ')
            //부모 함수 콜
            this.callSuper('_render', ctx);
        },
        setTextureName: async function (textureName) {

            let _tex = await fabric.plugins.resourceDB.getTexture(textureName)
            this.set('_elements', _tex.imgElements);
            this.set('textureName', textureName);
            this.set('sheetIndex', 0);

            this.setElement(_tex.imgElements[this.sheetIndex]);
        },
        setSheetIndex: function (sheetIndex) {
            this.setElement(this.get('_elements')[sheetIndex]);
            this.set('sheetIndex', sheetIndex);
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
