var tessel = require('tessel');

var port = tessel.port['A'];

var spi = new port.SPI({
  clockSpeed: 1*1000*1000, // 4MHz
  cpol: 0, // polarity
  cpha: 0, // clock phase
});

var marker = new Buffer([0x0, 0x0, 0x0, 0x0]);

function rgb(red, green, blue) {
	//prefix = B11000000
    var prefix = 0xC0;

    if (!(blue & 0x80)) {
        //prefix |= B00100000
        prefix |= 0x20;
    }
    if (!(blue & 0x40)) {
        //prefix |= B00010000
        prefix |= 0x10;
    }
    if (!(green & 0x80)) {
        //prefix |= B00001000
        prefix |= 0x08;
    }
    if (!(green & 0x40)) {
        //prefix |= B00000100
        prefix |= 0x04;
    }
    if (!(red & 0x80)) {
        //prefix |= B00000010
        prefix |= 0x02;
    }
    if (!(red & 0x40)) {
        //prefix |= B00000001
        prefix |= 0x01;
    }

	return new Buffer([prefix, blue, green, red]);
}

var strand = Buffer.concat([marker,
	rgb(0xFF, 0x00, 0x00),
	rgb(0x00, 0xFF, 0x00),
	rgb(0x00, 0x00, 0xFF),
	rgb(0xFF, 0x00, 0x00),
	rgb(0x00, 0xFF, 0x00),
	marker]);
console.log(strand);

// spi.enable();

;(function next () {
	spi.send(strand, function (err, rx) {
		// console.log('buffer returned by SPI slave:', rx);
		strand = strand.toJSON().data;
		var row = strand.splice(4, 4);
		strand.splice(4*5, 0, row[0], row[1], row[2], row[3]);
		strand = new Buffer(strand);
		setTimeout(next, 100);
	});
})();
