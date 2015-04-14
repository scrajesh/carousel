
// Core dlib.js v0.1
// fall back for lower-end browsers
if(!Array.prototype.forEach) {
  Array.prototype.forEach = function(f) {
    for(var i = 0, len = this.length; i < len; ++i) {
      f.call(this, this[i], i);
    }
  }
}
// check for an array
Array.prototype.is_array = function() {
	return this.constructor.name === 'Array';
}
// alias for array.forEach
Array.prototype.walk = Array.prototype.forEach;
// Object enumerator
if(!Object.prototype.forEach) {
  Object.prototype.forEach = function(f) {// console.log('foreach: ',this);
  	for(var i in this) {
    	f.call(this, this[i], i);
    }
  }
}
// Object enumerator with only own-properties
Object.prototype.walk = function(f) {// console.log('walk: ',this);
	for(var i in this) {// console.log(i,'walk2: ',this.hasOwnProperty(i));
		if(this.hasOwnProperty(i)) {
			f.call(this, this[i], i);
		}
	}
}
// htmlcollection enumerator
HTMLCollection.prototype.walk = function(f) {
    for(var i = 0, len = this.length; i < len; ++i) {
      f.call(this, this[i], i);
    }
}
// fall back for string trim
if(!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g,'');
  };
}

// assistance methods
function is_function(value) {
	return typeof value === 'function';
}
// Creates a sorted array of all enumerable properties, own and inherited,
// 	of `object` that have function values.
function functions(abject) {
	var result = [];
	abject.walk(function(v, k) {
	  if(is_function(v)) {
	    result.push(k);
	  }
	});
	return result.sort();
}
// element grabber
function O(selector){
	var obj;
	if(selector.match(/^#/))
		obj=document.getElementById(selector.substr(1));
	else if(selector.match(/\./) && document.getElementsByClassName)
		obj=document.getElementsByClassName(selector.substr(1));

	return obj;
}
// core d-Class
function DO_M(){	
	// public members
	this.el = null;
	// private members
	var self = this;
	// now perform singleton
	return function(selector){
		if(/^\w+$/.test(selector) || typeof selector === 'object') {
			self.el = selector; 
		} else if(document.querySelectorAll) {
			self.el = document.querySelectorAll(selector);
		} else {
			self.el = O(selector);
		}
		// init base props
		self.el = (typeof self.el === 'object') && self.el.length >= 1 ? self.el[0] : self.el;
		self.d = [];
		return self;
	};
}
window.d=new DO_M();
function _d_mixin(dobjs,ddirect) {
	var to_d = ddirect?window.d:DO_M.prototype;
	functions(dobjs).forEach(function(f) {	    
	    to_d[f] = dobjs[f];
	});
}
function _d_xtend(dobjs) {
	dobjs.forEach(function(o,k) {  
	    if(dobjs.hasOwnProperty(k)) {
	    	window.d[k] = dobjs[k];
	    }
	});
}

// DOM Tree & Travesals
_d_mixin({
	prev: function(elem,eonly) {
		var _elem = (elem||this.el);
		do {
		  _elem = _elem.previousSibling;
		} while (_elem && _elem.nodeType != 1);
		this.el = _elem;
		return eonly ? _elem : this;
	},

	next: function(elem,eonly) {
		var _elem = (elem||this.el);
		do {
		  _elem = _elem.nextSibling;
		} while (_elem && _elem.nodeType != 1);
		this.el = _elem;
		return eonly ? _elem : this;
	},

	first: function(elem) {
		var _elem = (elem||this.el);
		var _elfc = _elem.firstChild;
		this.el =_elfc && _elfc.nodeType != 1 ? this.next(_elfc,true) : _elfc;
		return this
	},

	last: function(elem) {
		var _elem = (elem||this.el);
		var _ellc = _elem.lastChild;
		this.el =_ellc && _ellc.nodeType != 1 ? this.prev(_ellc,true) : _ellc;
		return this;
	},

	parent: function(elem) {
		this.el = (elem||this.el).parentNode;
		return this;
	},

	nodes: function(name,parent,sel){
		var coll = [];
		if(sel && parent) {
			var elem = this.first(parent),i=1,pattn=new RegExp(sel);
			do {
				if(pattn.test(elem.className)){
					coll.push(elem);
				}				
			  	elem = this.next(elem);	
			} while (elem);

			return coll;
		}
		this.d = (parent || document).getElementsByTagName(name);
		return this; 
	},

	text: function(txt, parent){
		var t = document.createTextNode(txt);
		parent.appendChild(t);
	},

	getbuttons: function(coll){
		var _tmp = [];
		for (var i = 0; i < coll.length; i++) {
			if(/submit|button/.test(coll[i].type))
				_tmp.push(coll[i]);
		}
		return _tmp;
	},

	can_placeholder: function(coll){
		var input = document.createElement('input');
		return ('placeholder' in input);
	}
});


// d Utilities
_d_mixin({
	echo: function() {
		console.log('_d_ > ',this.el);
	},

	plugin: function(f) {
		this[this.el] = f;
	},

	is_error_tagd: function(itarget){
		var e_tag = this.next(itarget);
		return (e_tag && e_tag.tagName.toLowerCase() == 'span' && e_tag.getAttribute('error'));
	},

	throw_error: function(itarget, msg){
		if(this.is_error_tagd(itarget)) {
			this.next(itarget).innerHTML = msg;
			return;
		}
		// construct the error field
		var span = document.createElement('span');
		span.className = 'error';
		span.innerHTML = msg;
		span.setAttribute('error','true');
		// appending to the label
		itarget.parentNode.appendChild(span);
	},

	rmv_error: function(itarget){
		if(this.is_error_tagd(itarget)) {
			this.parent(itarget).removeChild(this.next(itarget));
		}	
	},

	dont_act: function(e){
	    // Prevent the default browser action
	    if(e && e.preventDefault)
	      //  supports W3C
	      e.preventDefault();
	    else
	      // A shortcut for stoping the browser action in IE  
	      window.event.returnValue = false;
	    // nodefact returns false instead webdev returning it in the handler
	    return false;
	},

	before: function(elem,target) {
		return d(this.el.insertBefore(elem,target));
	},

	append: function(elem){
		return d(this.el.appendChild(elem));
	},

	remove: function(elem) {
		var _elem = (elem||this.el);
		return _elem.parentNode.removeChild(_elem);
	},

	empty: function() {
		while (this.el.firstChild) {
		    this.el.removeChild(this.el.firstChild);
		}
		return this;
	},

	eq: function(idx) {
		if (idx >= 0) {
			return this.d[idx] ? this.d[idx] : this.el;
		}
		return this.el;
	},

	html: function(str) {
		if(this.el.nodeType==1) {
			return str ? this.el.innerHTML = d.trim(str) : d.trim(this.el.innerHTML);
		} else if(this.el.nodeType==3) {
			return str ? this.el.nodeValue = d.trim(str) : td.trim(his.el.nodeValue);
		}
	}
});

// other utilities
_d_mixin({
	trim: function(str) {
		return str.replace(/^\s*(\S*(?:\s+\S+)*)\s*$/, "$1");
	},

    supplant: function(str,o) {
        return str.replace(
            /\{([^{}]*)\}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    },

	to_dom: function(htmlstr) {
        var wrapper = document.createElement('div');
        wrapper.innerHTML = htmlstr;
        return wrapper.firstChild;
        /*var df= document.createDocumentFragment();
        return df.addChilds(wrapper.children); */
	},

	load_json: function(url,callback){
		var self = this, xhr;
	    if(window.XMLHttpRequest)
	        xhr = new XMLHttpRequest();
	    else if(window.ActiveXObject)
	        xhr = new ActiveXObject('Microsoft.XMLHTTP');

	    xhr.open('GET', url, true);
	    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
	    xhr.setRequestHeader('Accept', 'application/json');	    
		xhr.onreadystatechange = function(){  
	        if(xhr.readyState < 4) {
	            return;  
	        }
	        if(xhr.status !== 200) {  
	            return;  
	        }
	        if(xhr.readyState === 4) {  
	            callback.call(self, jsonParse(xhr.responseText));
	        }
	    }  
	          
	    xhr.open('GET', url, true);
	    xhr.send(null);
	},
	// Ref: http://javascript.info/tutorial/animation
	animate: function(opts) {
		var start = new Date;
		var timer_handle = setInterval(function() {
			var time_elapsed = new Date - start;
			var progress = time_elapsed / opts.duration;

			if (progress > 1) progress = 1;

			var delta = opts.delta(progress);
			opts.step(delta);

			if (progress == 1) {
				clearInterval(timer_handle);
				if(opts.parkit && typeof opts.parkit==='function') {
					opts.parkit.call();
				}
			}
		}, opts.delay || 10);
	}
},true);

_d_xtend({
	// Ref: http://javascript.info/tutorial/animation
		// few basic easing methods
		// used for 'delta' in animation	
	easing: {
          linear: function(progress) {
            return progress;
          },
          quad: function(progress) {
            return Math.pow(progress, 5);   //5th degree
          },
          bow: function(progress) {
            //coefficient of elasticity;defines the distance of “pushing back”
            var x=1.5;
            return Math.pow(progress, 2) * ((x + 1) * progress - x);
          },
          bounce: function(progress) {
            for(var a = 0, b = 1, result; 1; a += b, b /= 2) {
              if (progress >= (7 - 4 * a) / 11) {
                return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2)
              }
            }
          },
          ease_out: function(delta) {
            return function(progress) {
              return 1 - delta(1 - progress)
            }
          },
          ease_inout: function(delta) {
            return function(progress) {
              if (progress < .5)
                return delta(2*progress) / 2
              else
                return (2 - delta(2*(1-progress))) / 2
            }
          }
      }
});
// sample plugin
d('do').plugin(function(f){
	f.call(this);
});