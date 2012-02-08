function loadImage(url, callback) {
    var i = new Image();
    i.onload = function() {
        callback(i);
    }
    i.src = url;
}

function px(data, x, y) {
    return [
        data.data[((y * (data.width * 4)) + (x * 4)) + 0],
        data.data[((y * (data.width * 4)) + (x * 4)) + 1],
        data.data[((y * (data.width * 4)) + (x * 4)) + 2]
    ];
}

function setpx(data, x, y, rgb) {
    data.data[((y * (data.width * 4)) + (x * 4)) + 0] = rgb[0];
    data.data[((y * (data.width * 4)) + (x * 4)) + 1] = rgb[1];
    data.data[((y * (data.width * 4)) + (x * 4)) + 2] = rgb[2];
}

function update() {
    for (var x = 0; x < w; x++) {
        for (var y = 0; y < h; y++) {
            var p = px(d, x, y);
            if (classifier.get(p)) {
              setpx(d, x, y, [0, 0, 0]);
            }
        }
    }

    preview_ctx.putImageData(d, 0, 0);
}

var preview_canvas, preview_ctx, canvas, ctx, d, w, h;

function direct() {
    var d = {};
    var hits = {};
    var rounding = 0;

    d.rounding = function(x) {
        if (x == undefined) return rounding;
        rounding = x;
        return d;
    };

    function round(x) {
        return x.map(function(i) { Math.round(x * rounding) / rounding; });
    }

    d.add = function(x, result) {
        if (rounding) x = round(x);
        hits[x.join(',')] = result;
    };

    d.get = function(x) {
        if (rounding) x = round(x);
        return hits[x.join(',')];
    };
    return d;
}

var classifier = direct();

loadImage('wcu_small.jpg', function(i) {
    w = i.width;
    h = i.height;

    canvas = document.getElementById('c');
    ctx = canvas.getContext('2d');
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(i, 0, 0);

    o_canvas = document.getElementById('co');
    o_ctx = o_canvas.getContext('2d');
    o_canvas.width = w;
    o_canvas.height = h;

    d = ctx.getImageData(0, 0, w, h);

    preview_canvas = document.getElementById('p');
    preview_ctx = preview_canvas.getContext('2d');
    preview_canvas.width = w;
    preview_canvas.height = h;
    preview_ctx.drawImage(i, 0, 0);

    var tags = [], tag;
    var tags_div = document.getElementById('tags');

    document.getElementById('add').addEventListener('click', function() {
        var td = tags_div.appendChild(document.createElement('span'));
        td.innerHTML = document.getElementById('tag').value;
        document.getElementById('tag').value = '';
        document.getElementById('tag').focus();
    });

    function register(e) {
        if (!down) return;
        var x = e.offsetX,
            y = e.offsetY;
        var p = px(d, x, y);
        classifier.add(p, 'black');
        o_ctx.fillRect(x, y, 2, 2);
        e.preventDefault();
        e.stopPropagation();
        window.setTimeout(update, 0);
    }

    document.getElementById('rounding').addEventListener('change', function() {
        classifier.rounding(this.value);
    });

    var down = false;
    function isdown() { down = true; }
    function isup() { down = false; }

    document.addEventListener('mousemove', register);
    document.addEventListener('mousedown', isdown);
    document.addEventListener('mouseup', isup);
});
