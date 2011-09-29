(function() {
  var debug, extend, get_image_data;
  var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  debug = function() {
    var a, _i, _len, _results;
    if ((window.console != null) && (window.console.log != null)) {
      _results = [];
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        a = arguments[_i];
        _results.push(console.log(a));
      }
      return _results;
    }
  };
  extend = function() {
    var extenders, key, object, other, val, _i, _len;
    object = arguments[0], extenders = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (!(object != null)) {
      return {};
    }
    for (_i = 0, _len = extenders.length; _i < _len; _i++) {
      other = extenders[_i];
      for (key in other) {
        if (!__hasProp.call(other, key)) continue;
        val = other[key];
        if (!(object[key] != null) || typeof val !== "object") {
          object[key] = val;
        } else {
          object[key] = extend(object[key], val);
        }
      }
    }
    return object;
  };
  get_image_data = function(image) {
    var c, ctx;
    c = document.createElement('canvas');
    c.width = image.width;
    c.height = image.height;
    ctx = c.getContext('2d');
    ctx.drawImage(image, 0, 0);
    return ctx.getImageData(0, 0, c.width, c.height);
  };
  Image.prototype.filter = function() {
    var end, filter, filters, img_data, start, total_end, total_start, _i, _len;
    filters = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    img_data = get_image_data(image);
    total_start = new Date();
    for (_i = 0, _len = filters.length; _i < _len; _i++) {
      filter = filters[_i];
      start = new Date();
      img_data = filter.process(img_data);
      end = new Date();
      debug("=> " + filter.constructor.name + " finished in " + (end - start) + "ms.");
    }
    total_end = new Date();
    debug("Applied " + filters.length + " filters in " + (total_end - total_start) + "ms.");
    return img_data;
  };
  window.Filter = (function() {
    function Filter(settings) {
      this.settings = settings != null ? settings : {};
      this.process = __bind(this.process, this);
      this.settings = extend({}, this.constructor.defaults, this.settings);
    }
    Filter.prototype.process = function(image_data) {
      var buffer, buffer_size, offset;
      buffer_size = image_data.width * image_data.height;
      buffer = image_data.data;
      for (offset = 0; 0 <= buffer_size ? offset < buffer_size : offset > buffer_size; 0 <= buffer_size ? offset++ : offset--) {
        this.processPixel(buffer, offset * 4);
      }
      return image_data;
    };
    return Filter;
  })();
  window.InvertFilter = (function() {
    __extends(InvertFilter, Filter);
    function InvertFilter() {
      this.processPixel = __bind(this.processPixel, this);
      InvertFilter.__super__.constructor.apply(this, arguments);
    }
    InvertFilter.prototype.processPixel = function(buffer, offset) {
      buffer[offset] = 255 - buffer[offset];
      buffer[offset + 1] = 255 - buffer[offset + 1];
      return buffer[offset + 2] = 255 - buffer[offset + 2];
    };
    return InvertFilter;
  })();
  window.GreyscaleFilter = (function() {
    __extends(GreyscaleFilter, Filter);
    function GreyscaleFilter() {
      this.processPixel = __bind(this.processPixel, this);
      GreyscaleFilter.__super__.constructor.apply(this, arguments);
    }
    GreyscaleFilter.defaults = {
      r: 0.21,
      g: 0.71,
      b: 0.07
    };
    GreyscaleFilter.prototype.processPixel = function(buffer, offset) {
      var b, g, r, v;
      r = buffer[offset];
      g = buffer[offset + 1];
      b = buffer[offset + 2];
      v = (r * this.settings.r) + (g * this.settings.g) + (b * this.settings.b);
      buffer[offset] = v;
      buffer[offset + 1] = v;
      return buffer[offset + 2] = v;
    };
    return GreyscaleFilter;
  })();
  window.OpacityFilter = (function() {
    __extends(OpacityFilter, Filter);
    function OpacityFilter() {
      this.processPixel = __bind(this.processPixel, this);
      OpacityFilter.__super__.constructor.apply(this, arguments);
    }
    OpacityFilter.defaults = {
      factor: 0.50
    };
    OpacityFilter.prototype.processPixel = function(buffer, offset) {
      return buffer[offset + 3] *= this.settings.factor;
    };
    return OpacityFilter;
  })();
}).call(this);
