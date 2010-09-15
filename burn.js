function buildScene() {
	var canvas = document.getElementById('burn');
	var imgFire = document.getElementById('fire');
	var books = buildLibrary(canvas, ['bible', 'quran', 'torah'], 25);
	books.registerBgObject(new BackgroundObject(0, 0, imgFire));
	books.discrim = imgFire.height;
	
	// Start animation loop
	loop(function() {books.drawAll.apply(books) }, 25);
	books.drawAll();	
	
	// Register drawing events
	canvas.onmousedown = function(e) {
		books.moveStarted(e);
	}
	canvas.onmouseup = function(e) {
		books.moveStopped(e);
	}	
}

function buildLibrary(canvas, names, margin) {
	var books = new BookCollection(canvas);
	var lastBook;
	
	for (var name in names) {
		imageSet = new ImageSet(names[name]);
		var book;
		if (lastBook)
			book = new Book(margin + lastBook.getBoundingRect()[2], canvas.height - imageSet.normal.height, 
				imageSet.normal, imageSet.burning, imageSet.name);
		else
			book = new Book(margin, canvas.height - imageSet.normal.height, imageSet.normal, imageSet.burning, 
				imageSet.name);
		books.add(book);
		lastBook = book;
	}
	return books;
}

function loop(action, interval) {
	if (action && interval > 0) {
		action();
		setInterval(action, interval);
	}
}

var RelativeCoords = function(canvas, e) {
	this.x = e.clientX - canvas.offsetLeft;
	this.y = e.clientY - canvas.offsetTop;
	return this;
}

var ImageSet = function(name) {
	this.normal = document.getElementById(name + '_static');
	this.burning = document.getElementById(name + '_burning');
	this.name = name;
	return this;
}

var BackgroundObject = function(x, y, img) {
	this.x = x;
	this.y = y;
	this.image = img;
}

var Book = function(x, y, img, name) {
	this.x = x;
	this.y = y;
	this.image = img;
	this.name = name;
}
Book.prototype.getBoundingRect = function() {
		return [this.x, this.y, this.x + this.image.width, this.y + this.image.height];
	};
Book.prototype.draw = function(canvas) {
		if (canvas.getContext) {
			var ctx = canvas.getContext('2d');			
			ctx.drawImage(this.image, this.x, this.y);
		}
	};
Book.prototype.isInRect = function(canvas, e) {
	var coords = new RelativeCoords(canvas, e);
	var rect = this.getBoundingRect();
	var ret = false;
	if (coords.x >= rect[0] && coords.x <= rect[2] & coords.y >= rect[1] && coords.y <= rect[3])
		ret = true;
	return ret;
}
Book.prototype.getRelative = function(x, y) {
	return [x - this.x, y - this.y];
}
Book.prototype.move = function(x, y) {
	this.x = x;
	this.y = y;
}
Book.prototype.checkForBurn = function(discrim) {
	var bounds = this.getBoundingRect();
	if (bounds[3] < discrim) {
		alert("Burned!");
	}
}

var BookCollection = function(canvas) {
	this.canvas = canvas;
	this.bgObjects = new Array();
	this.discrim = 0;
}
BookCollection.prototype = new Array;
BookCollection.prototype.add = function(book) { this.push(book); }
BookCollection.prototype.getBookByClick = function(e) {
	var ret;
	for (var i in this) {
		if (this[i].isInRect && this[i].isInRect(this.canvas, e)) {
			ret = this[i];
		}
	}
	return ret;
}
BookCollection.prototype.registerBgObject = function(img) {
	if (img)
		this.bgObjects.push(img);
}
BookCollection.prototype.moveStarted = function(e) {
	var self = this;
	var bookMoving = this.getBookByClick(e);
	if (bookMoving) {
		var coords = new RelativeCoords(this.canvas, e);
		this.bookMoving = bookMoving;
		this.bookOffset = this.bookMoving.getRelative(coords.x, coords.y);
		this.canvas.onmousemove = function() { self.moving.apply(self, arguments); }	
	}
}
BookCollection.prototype.moveStopped = function(e) {
	this.bookMoving.checkForBurn(this.discrim);
	this.canvas.onmousemove = null;
}
BookCollection.prototype.moving = function(e) {
	var item = document.getElementById('console');
	coords = new RelativeCoords(this.canvas, e);
	
	item.innerHTML = (coords.x - this.bookOffset[0]) + "," + (coords.y - this.bookOffset[1]);
	this.bookMoving.move(coords.x - this.bookOffset[0], coords.y - this.bookOffset[1]);
	this.drawAll();
}
BookCollection.prototype.drawAll = function() {
	if (this.canvas.getContext)
	{
		var ctx = this.canvas.getContext('2d');
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		for (var i in this.bgObjects) {
			ctx.drawImage(this.bgObjects[i].image,this.bgObjects[i].x, this.bgObjects[i].y);
		}
		for (var i in this) { 
			if (this[i].draw)
			this[i].draw(this.canvas); 
		}
	}
}

window.onload = function() {
	buildScene();
};