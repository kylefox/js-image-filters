# Output stuff to console without breaking.
debug = () ->
  if window.console? and window.console.log?
    console.log(a) for a in arguments

# Extends an object by merging other objects (extenders) into it.
extend = (object, extenders...) ->
  return {} if not object?
  for other in extenders
    for own key, val of other
      if not object[key]? or typeof val isnt "object"
        object[key] = val
      else
        object[key] = extend object[key], val
  object

# Extracts ImageData from an Image or HTMLImageElement
# by drawing & reading pixel data to an intermediate context.
get_image_data = (image) ->
  c = document.createElement('canvas')
  c.width = image.width
  c.height = image.height
  ctx = c.getContext('2d')
  ctx.drawImage(image, 0, 0)
  ctx.getImageData(0, 0, c.width, c.height)
  
# Applies `filters` to the Image.
Image.prototype.filter = (filters...) ->
  img_data = get_image_data(image)
  total_start = new Date()
  for filter in filters
    start = new Date()
    img_data = filter.process(img_data)
    end = new Date()
    debug("=> #{filter.constructor.name} finished in #{end-start}ms.")
  total_end = new Date()
  debug "Applied #{filters.length} filters in #{total_end-total_start}ms."
  img_data

# Base class for a filter.
class window.Filter
  
  constructor: (@settings={}) ->
    # Merge class defaults with this instance's custom settings.
    @settings = extend({}, @constructor.defaults, @settings)
  
  # Iterates through the pixel buffer and
  # invokes `processPixel` on each 4-byte (rgba) sequence.
  process: (image_data) =>
    buffer_size = (image_data.width * image_data.height)
    buffer = image_data.data
    for offset in [0...buffer_size]
      @processPixel(buffer, offset*4)
    image_data

# Simply inverts an image.
class window.InvertFilter extends Filter
  processPixel: (buffer, offset) =>
    buffer[offset] = 255 - buffer[offset]
    buffer[offset+1] = 255 - buffer[offset+1]
    buffer[offset+2] = 255 - buffer[offset+2]
    
# Greyscales an image.
# Can pass r/g/b weights to constructor to bias output.
class window.GreyscaleFilter extends Filter
  
  @defaults = 
    r: 0.21
    g: 0.71
    b: 0.07

  processPixel: (buffer, offset) =>
    r = buffer[offset]
    g = buffer[offset+1]
    b = buffer[offset+2]
    v = (r * @settings.r) + (g * @settings.g) + (b * @settings.b); # weighted average
    buffer[offset] = v
    buffer[offset+1]= v
    buffer[offset+2] = v


class window.OpacityFilter extends Filter

    @defaults =
      factor: 0.50

    processPixel: (buffer, offset) =>
        buffer[offset + 3] *= @settings.factor