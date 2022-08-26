
export default class Editor {
    fbCanvas
    constructor(option) {
        // this.canvas = new fabric.Canvas('canvas');

        this.idGenerator = 0;
        this.width = option.width;
        this.height = option.height;
        this.authToken = option.authToken
        this.context = option.context

        this.resourceMng = option.context.resourceMng
        this.host_url = option.context.resourceMng.host_url
        this.root_path = option.context.resourceMng.root_path
        this.bSnapChecked = option.bSnapChecked;
        this.bShowGrid = option.bShowGrid;
        this.gridSize = option.gridSize

        // this.attrEditorFrom = document.querySelector('#attribute-editor')

        const fbCanvas = new fabric.Canvas('main-canvas', {
            backgroundColor: '#000000',
            preserveObjectStacking: true, //선택한 오브잭트 현재 z 순서  유지
            enableRetinaScaling: false //레티나 비활성화
        });
        fbCanvas.setHeight(this.height);
        fbCanvas.setWidth(this.width);

        // fbCanvas.on('mouse:down', this.onSelectObject.bind(this));

        fbCanvas.on('object:moving', this.onMoveObject.bind(this));
        fbCanvas.on('object:scaling', this.onScalingObject.bind(this))
        fbCanvas.on('object:rotating', this.onRotatingObject.bind(this))

        fbCanvas.on({
            'selection:created': this.onSelectObject.bind(this),
            'selection:updated': this.onSelectObject.bind(this)
        });

        fbCanvas.on('after:render', this.onAfterRender.bind(this));

        this.fbCanvas = fbCanvas;
    }
    onAfterRender(evt) {

        if (this.bShowGrid) {
            let ctx = this.fbCanvas.contextContainer
            ctx.strokeStyle = '#00ff00'
            ctx.beginPath();
            for (let iy = 0; iy < this.height / this.gridSize; iy++) {
                ctx.moveTo(0, iy * this.gridSize);
                ctx.lineTo(this.width, iy * this.gridSize);
            }

            for (let ix = 0; ix < this.width / this.gridSize; ix++) {

                ctx.moveTo(ix * this.gridSize, 0);
                ctx.lineTo(ix * this.gridSize, this.height);
            }
            
            ctx.closePath()
            ctx.stroke()
        }
    }
    onMoveObject(evt) {
        let _obj = evt.target;

        if (this.bSnapChecked) {

            let _gridSize = this.gridSize;
            let _x = Math.round(_obj.left / _gridSize) * _gridSize;
            let _y = Math.round(_obj.top / _gridSize) * _gridSize;
            _obj.set({
                left: _x,
                top: _y
            });
        }
        this.context.attrEditorFrom.deserializeAttr(_obj)
    }
    onScalingObject(evt) {
        let _obj = evt.target;
        this.context.attrEditorFrom.deserializeAttr(_obj)
    }
    onRotatingObject(evt) {
        let _obj = evt.target;
        this.context.attrEditorFrom.deserializeAttr(_obj)
    }
    onSelectObject(evt) {

        console.log('selection:created', evt)
        if (evt.selected.length === 1) {
            this.context.attrEditorFrom.deserializeAttr(evt.selected[0])
            // this.onSelectObject(evt.target.selected)
            // evt.target ? this.context.attrEditorFrom.deserializeAttr(evt.target) : null;
        }
        else if (evt.selected.length > 1) {
        }

        this.context.layerEditor.updateList(
            this.fbCanvas.getObjects(),
            evt.selected
        );


        // this.context.layerEditor.updateList(this.fbCanvas.getObjects(), this.fbCanvas.getActiveObject());

    }
    onChangeSheetIndex(index) {
        let obj = this.fbCanvas.getActiveObject()
        if (obj) {
            obj.setSheetIndex(index)
            this.fbCanvas.renderAll()
        }
    }
    clearCanvas() {
        this.fbCanvas.clear()
        this.idGenerator = 0
        this.fbCanvas.setBackgroundColor('#000000')
    }
    setGridSize(gridSize) {
        this.gridSize = gridSize
    }
    async addRmdImage(texture_name) {
        const _texture = await fabric.plugins.resourceDB.getTexture(texture_name);

        if (_texture.imgElements.length > 0) {

            const obj = new fabric.RmdImage(
                _texture.imgElements,
                {
                    textureName: _texture.name,
                    id: this.idGenerator++,
                    sheetIndex: 0
                });

            this.fbCanvas.add(obj);
            console.log('add object', obj)
            return obj;
        }
        else {
            console.log('not found image')
        }
    }
    async addRmdTiledImage(texture_name) {
        const _texture = await fabric.plugins.resourceDB.getTexture(texture_name);

        if (_texture.imgElements.length > 0) {

            const obj = new fabric.RmdTileImage(
                _texture.imgElements,
                {
                    id: this.idGenerator++,
                    textureName: _texture.name,
                    tileSize: 64,
                    tileIndex: 0,
                    sheetIndex: 0
                });

            // const obj = new fabric.RmdImage(
            //     _texture.imgElements,
            //     {
            //         textureName: _texture.name,
            //         id: this.idGenerator++,
            //         sheetIndex: 0
            //     });

            this.fbCanvas.add(obj);
            console.log('add object', obj)
            return obj;
        }
        else {
            console.log('not found image')
        }
    }
    moveUpLayer(_obj) {

        let obj = _obj ? _obj : this.fbCanvas.getActiveObject();

        if (obj) {
            if (obj.type === 'activeSelection') {

                let objIndex = _.findIndex(this.fbCanvas.getObjects(), _obj => obj.getObjects()[0].id === _obj.id);
                if (objIndex > 0) {
                    _.each(obj.getObjects(), obj => {
                        this.moveUpLayer(obj)
                    })
                }
            }
            else {
                let objIndex = _.findIndex(this.fbCanvas.getObjects(), _obj => obj.id === _obj.id);

                if (objIndex > 0) {
                    this.fbCanvas.moveTo(this.fbCanvas.getObjects()[objIndex], objIndex - 1);
                }

            }

        }
    }
    moveDownLayer(_obj) {
        let obj = _obj ? _obj : this.fbCanvas.getActiveObject();

        if (obj) {
            if (obj.type === 'activeSelection') {

                let lastObj = obj.getObjects()[obj.getObjects().length - 1];

                let objIndex = _.findIndex(this.fbCanvas.getObjects(), _obj => lastObj.id === _obj.id);

                if (objIndex < this.fbCanvas.getObjects().length - 1) {
                    _.eachRight(obj.getObjects(), obj => {
                        this.moveDownLayer(obj)
                    })
                }
            }
            else {
                let objIndex = _.findIndex(this.fbCanvas.getObjects(), _obj => obj.id === _obj.id);
                if (objIndex < this.fbCanvas.getObjects().length - 1) {
                    this.fbCanvas.moveTo(this.fbCanvas.getObjects()[objIndex], objIndex + 1);
                }

            }
        }
    }
    removeLayer(_obj) {
        let obj = _obj ? _obj : this.fbCanvas.getActiveObject();
        if (obj) {
            if (obj.type === 'activeSelection') {
                _.eachRight(obj.getObjects(), obj => {
                    this.removeLayer(obj)
                })
            }
            else {
                this.fbCanvas.remove(obj);
            }
        }
        this.fbCanvas.discardActiveObject();
    }
    async saveCanvas(path, filename) {

        let json = this.fbCanvas.toJSON();
        console.log(JSON.stringify(json));

        let _data = JSON.stringify(json);

        let _path = path !== '' ? path : this.root_path

        let _res = await (await (fetch(`${this.host_url}/api/v2/webdisk/writeTextFile`, {
            method: 'POST',
            body: _data,
            headers: {
                'Content-Type': 'text/plain',
                'write-name': filename,
                'write-directory': _path,
                'auth-token': this.authToken
            }
        }))).json();
        console.log(_res)
    }
    async loadCanvas(path, filename) {

        this.clearCanvas();

        let _path = path !== '' ? path : this.root_path

        let _res = await (await (fetch(`${this.host_url}/api/v2/webdisk/readFile`, {
            method: 'POST',
            body: `${_path}\n${filename}`,
            headers: {
                'Content-Type': 'text/plain',
                'auth-token': this.authToken
            }
        }))).json()

        return new Promise((resolve, reject) => {
            this.fbCanvas.loadFromJSON(_res,
                (evt) => { //로딩이완료되면 호출
                    console.log('load complete')
                    resolve(evt)
                },
                (json_object, fabric_object) => { //객체하나가 로딩될때마다 호출됨
                    // console.log(json_object)
                    console.log(fabric_object)
                    fabric_object.set('id', this.idGenerator++)
                }
            );
        })
    }
    cloneObject(_obj) {
        return new Promise((resolve, reject) => {
            let obj = _obj ? _obj : this.fbCanvas.getActiveObject();


            if (obj) {
                obj.clone((clonedObj) => {
                    // theApp.fbCanvas.add(cloned);
                    let canvas = this.fbCanvas;

                    canvas.discardActiveObject();

                    clonedObj.set({
                        left: clonedObj.left + 10,
                        top: clonedObj.top + 10,
                        evented: true,
                    });
                    // this should solve the unselectability
                    clonedObj.setCoords();

                    //구룹지정시 복제 
                    if (clonedObj.type === 'activeSelection') {
                        // active selection needs a reference to the canvas.
                        clonedObj.canvas = canvas;
                        clonedObj.forEachObject((obj) => {
                            obj.set('id', this.idGenerator++)
                            canvas.add(obj);
                        });
                    } else {
                        clonedObj.set('id', this.idGenerator++)
                        canvas.add(clonedObj);
                    }

                    canvas.setActiveObject(clonedObj);
                    canvas.requestRenderAll();
                    resolve(clonedObj)
                });

            }
            else {
                reject('not found object')
            }

        });


    }



}
