// 참고 : http://fabricjs.com/fabric-intro-part-3#subclassing
//WdImage 의 코드 간결화 버전
const _type = 'WdImage2';

const _mod = fabric.util.createClass(
    fabric.Image, // Image 클래스를 상속받음
    {
        type: _type, // 타입 설정
        initialize: async function ( options,onComplete) {

            options || (options = {});

            this.set('webDiskSrc', options.webDiskSrc || {});

            let root_path = options.webDiskSrc.root_path || './';
            let host_url = options.webDiskSrc.host_url || 'http://localhost:3000';
            let image_file = options.webDiskSrc.image_file || './assets/images/tilemap.png';

            let resp = await(fetch(`${host_url}/api/v2/webdisk/readFile`, {
                method: 'POST',
                body: `${root_path}\n${image_file}`,
                headers: {
                    'Content-Type': 'text/plain'
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
                this.callSuper('initialize', _imgElement, options);
                console.log(`load complete ${image_file}`);
                onComplete(this)
            }
            else {
                console.log('error', resp.status)
                onComplete(null,resp.status)
            }
            // console.log(options)
        },
        toObject: function () {
            return fabric.util.object.extend(
                this.callSuper('toObject'),
                {
                    webDiskSrc: this.get('webDiskSrc')
                }
            );
        },
        _render: function (ctx) {
            // console.log('MyImage render code ')
            //부모 함수 콜
            this.callSuper('_render', ctx);
        }
    }
);

//클로닝 또는 데이터로딩시에 사용
_mod.fromObject = async function (object, callback) {
    // var object = fabric.util.object.clone(_object);
    fabric.Image.prototype._initFilters.call(object, object.filters, function (filters) {
        object.filters = filters || [];
        fabric.Image.prototype._initFilters.call(object, [object.resizeFilter], function (resizeFilters) {
            object.resizeFilter = resizeFilters[0];

            fabric.util.enlivenObjects([object.clipPath], function (enlivedProps) {
                object.clipPath = enlivedProps[0];
                new _mod(object, function (imageObject,err) {
                    if(imageObject)
                        callback(imageObject);
                    else {
                        callback && callback(null, err);
                    }
                });
                
            });
        });
    });

};

fabric[_type] = _mod; //플러그인추가 
