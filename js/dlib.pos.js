
// Position helpers

_d_mixin({
	// Find the X (Horizontal, Left) position of an element
	ex: function(elem) {
		// See if we're at the root element, or not
		return elem.offsetParent ?
			// If we can still go up, add the current offset and recurse upwards
			elem.offsetLeft + this.ex(elem.offsetParent) :
			// Otherwise, just get the current offset
			elem.offsetLeft;
	},

	// Find the Y (Vertical, Top) position of an element
	ey: function(elem) {
		// See if we're at the root element, or not
		return elem.offsetParent ?
			// If we can still go up, add the current offset and recurse upwards
			elem.offsetTop + this.ey(elem.offsetParent) :
			// Otherwise, just get the current offset
			elem.offsetTop;
	},

	// Find the horizontal positioing of an element within its parent
	px: function(elem) {
		// If the offsetParent is the element's parent, break early
		return elem.parentNode == elem.offsetParent ?
			elem.offsetLeft :
			// Otherwise, we need to find the position relative to the entire
			// page for both elements, and find the difference
			this.ex(elem) - this.ex(elem.parentNode);
	},

	// Find the vertical positioning of an element within its parent
	py: function(elem) {
		// If the offsetParent is the element's parent, break early
		return elem.parentNode == elem.offsetParent ?
			elem.offsetTop :
			// Otherwise, we need to find the position relative to the entire
			// page for both elements, and find the difference
			this.ey(elem) - this.ey(elem.parentNode);
	},

	x: function(elem, pos) {
		if(pos===undefined) {
			// Get the computed style and get the number out of the value
			return parseInt(this.get_style(elem,"left"));
		} else {
			// Set the 'left' CSS property, using pixel units
			elem.style.left = pos + "px";
		}
	},

	y: function(elem, pos) {
		if(pos===undefined) {
			// Get the computed style and get the number out of the value
			return parseInt(this.get_style(elem,"top"));
		} else {
			// Set the 'top' CSS property, using pixel units
			elem.style.top = pos + "px";
		}
	},

	xy: function(elem, pos) {
		if(pos===undefined) {
			// Get the computed style and get the number out of the value
			return {x: parseInt(this.get_style(elem,"left")), y: parseInt(this.get_style(elem,"top"))};
		} else {
			// find the x,y values
			var x,y;
			if(pos.is_array() && pos.length == 2) {
				x = pos[0];
				y = pos[1];
			} else if('left' in pos && 'top' in pos){
				x = pos.left;
				y = pos.top;
			}
			// now set iff they're present
			if(x && y) {
				this.x(elem,x);
				this.y(elem,y);
			}
		}
	}
});