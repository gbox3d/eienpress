const _type = 'Hello';
const _mod = fabric.util.createClass(fabric.Object, {

    type: _type,
    // initialize can be of type function(options) or function(property, options), like for text.
    // no other signatures allowed.
    initialize: function (options) {
        options || (options = {});
        this.callSuper('initialize', options);
        this.set('label', options.label || '');
    },

    toObject: function () {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            label: this.get('label') //추가적인 속성 선언 
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

        ctx.beginPath();

        ctx.moveTo(x + rx, y);

        ctx.lineTo(x + w - rx, y);
        isRounded && ctx.bezierCurveTo(x + w - k * rx, y, x + w, y + k * ry, x + w, y + ry);

        ctx.lineTo(x + w, y + h - ry);
        isRounded && ctx.bezierCurveTo(x + w, y + h - k * ry, x + w - k * rx, y + h, x + w - rx, y + h);

        ctx.lineTo(x + rx, y + h);
        isRounded && ctx.bezierCurveTo(x + k * rx, y + h, x, y + h - k * ry, x, y + h - ry);

        ctx.lineTo(x, y + ry);
        isRounded && ctx.bezierCurveTo(x, y + k * ry, x + k * rx, y, x + rx, y);

        ctx.closePath();

        //영역체우기 
        ctx.save()

        ctx.fillStyle = this.get('fill');
        ctx.fill();

        for (let i = 0; i < 1024; i++) {
            ctx.fillStyle = `rgba(${_.random(0, 255)}, ${_.random(0, 255)}, ${_.random(0, 255)}, 255)`;

            ctx.fillRect(_.random(-512, 512), _.random(-512, 512), 32, 32);
        }

        ctx.restore();

        // this._renderPaintInOrder(ctx);

        /*
        fabric.util.setImageSmoothing(ctx, this.imageSmoothing);
        if (this.isMoving !== true && this.resizeFilter && this._needsResize()) {
            this.applyResizeFilters();
        }
        this._stroke(ctx);
        this._renderPaintInOrder(ctx);
        */
        ctx.font = '20px Helvetica';
        ctx.fillStyle = '#333';
        ctx.fillText(this.label, x, y);

        console.log(ctx)
    }
});

//씬로딩 시에 필요함 
_mod.fromObject = function (object, callback) {
    console.log('hello fromObject');
    return fabric.Object._fromObject(_type, object, callback);
};

fabric[_type] = _mod; //fabric에 새로운 클래스를 추가한다.

console.log(`LabelRect plugin added`)
