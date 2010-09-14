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
	var x = e.clientX - canvas.offsetLeft;
	var y = e.clientY - canvas.offsetTop;
	var rect = this.getBoundingRect();
	var ret = false;
	if (x >= rect[0] && x <= rect[2] & y >= rect[1] && y <= rect[3])
		ret = true;
	return ret;
}

var BookCollection = function() {
}

BookCollection.prototype = new Array;
BookCollection.prototype.add = function(book) { this.push(book); }
BookCollection.prototype.getBookByClick = function(canvas, e) {
	var ret;
	for (var i in this) {
		if (this[i].isInRect && this[i].isInRect(canvas, e)) {
			ret = this[i];
		}
	}
	return ret;
}
BookCollection.prototype.drawAll = function(canvas) {
	for (var i in this) { 
		if (this[i].draw)
			this[i].draw(canvas); 
	}
}

window.onload = function() {
	loop = function(action, interval)
	{
		if (action && interval > 0) {
			action();
			setInterval(action, interval);
		}
	}
	
	drawAniGif = function(id, canvas, x, y) 
	{
		if (id && canvas.getContext) {
			var ctx = canvas.getContext('2d');
			var img = document.getElementById(id);
			
			ctx.clearRect(x, y, img.width, img.height);
			ctx.drawImage(img, x,y);
		}
	};
	
	var canvas = document.getElementById('burn');	
	// Animate the flames; stupid GIFs do not auto-animate in Canvas
	loop(function() {drawAniGif('fire', canvas, 0, 0)}, 25);
	
	var img = document.getElementById('bible_static');
	var books = new BookCollection();
	books.add(new Book(20, canvas.height - img.height, img, "bible"));
	img = document.getElementById('quran_static');
	books.add(new Book(20 + books[0].getBoundingRect()[2], canvas.height - img.height, img, "quran"));
	img = document.getElementById('torah_static');
	books.add(new Book(20 + books[1].getBoundingRect()[2], canvas.height - img.height, img, "torah"));
	books.drawAll(canvas);	
	
	canvas.onclick = function(e) {
		var book = books.getBookByClick(canvas, e);
		if (book) {
			alert("Is in " + book.name);
		}
	}
};