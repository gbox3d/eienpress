// 참고 : http://fabricjs.com/fabric-intro-part-3#subclassing

const _mod = fabric.util.createClass(
    fabric.Image, // Image 클래스를 상속받음
    {
        type: 'WdImage', // 타입 설정
        initialize: function (element, options) {

            options || (options = {});

            this.callSuper('initialize', element, options);

            this.set('webDiskSrc', options.webDiskSrc || {});

            

            console.log(options)
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
_mod.fromObject = async function (_object, callback) {
    var object = fabric.util.object.clone(_object);

    console.log(object)

    const webDiskSrc = object.webDiskSrc;

    let resp = await (fetch(`${webDiskSrc.host_url}/api/v2/webdisk/readFile`, {
        method: 'POST',
        body: `${webDiskSrc.root_path}\n${webDiskSrc.image_file}`,
        headers: {
            'Content-Type': 'text/plain'
        }
    }))

    if (resp.ok) {
        let responseAsBlob = await resp.blob() //바이너리 원본데이터얻기 
        let imgUrl = URL.createObjectURL(responseAsBlob); //url 객체로 변환

        fabric.util.loadImage(imgUrl, function (img, error) {
            if (error) {
                callback && callback(null, error);
                return;
            }
            fabric.Image.prototype._initFilters.call(object, object.filters, function (filters) {
                object.filters = filters || [];
                fabric.Image.prototype._initFilters.call(object, [object.resizeFilter], function (resizeFilters) {
                    object.resizeFilter = resizeFilters[0];
                    
                    fabric.util.enlivenObjects([object.clipPath], function (enlivedProps) {
                        object.clipPath = enlivedProps[0];
                        var image = new _mod(img, object);
                        callback(image);
                    });
                });
            });
        }, null, object.crossOrigin);
    }
};

fabric.WdImage = _mod; //플러그인추가 

// fabric.MyImage.fromURL = function (url, callback, imgOptions) {
//     fabric.util.loadImage(url, function (img) {
//         callback && callback(new fabric.MyImage(img, imgOptions));
//     }, null, imgOptions && imgOptions.crossOrigin);
// };