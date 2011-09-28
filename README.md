Allows you to sequentially apply filters to images (`Image` or `HTMLImageElement`). These are just basic experiments with modifying image data using the `canvas` element. The code is written in CoffeeScript, but can be used with normal JavaScript.

_The demo works best in Safari because other browsers have security limitations that prevent them accessing image data from local files. Things will work fine if the images/scripts are served off the same domain, however._

Basic Use
=========

`Image.filter` allows you to pass an arbitrary number of filters and returns the processes `ImageData`:

    // Markup: <img id="image" src="demo.jpg" />
    var image = document.getElementById('img');
    var output = image.filter(new GreyscaleFilter());
    
For the time being, it's up to you to do something interesting with the output, like paint it on a canvas context:
    
    context.putImageData(output, 0, 0);
    
This example shows how you can apply as many filters as you want:

    var output = image.filter(
      new GreyscaleFilter(),
      new InvertFilter()
    );
    
Right now there are only three filters (`GreyscaleFilter`, `InvertFilter`, and `OpacityFilter`) but I hope to add more -- or feel free to contribute your own :)

Filter Settings
===============

`OpacityFilter` accepts a transparency factor:

    # Reduce opacity to 75%
    filter = new OpacityFilter({factor: 0.75});

`GreyscaleFilter` accepts RGB weights:

    # Give higher weight to the red channels.
    filter = new GreyscaleFilter({r: .50, g: 0.25, b: 0.25})
    
Defining a Filter
=================

Creating a filter is super easy. All you need to do is extend the base `Filter` class and override the `processPixel` method. This example shows how you could modify the alpha channel to reduce opacity by 50%:

    class HalfOpacityFilter extends Filter
        processPixel: (buffer, offset) =>
            buffer[offset + 3] *= 0.5
            
`processPixel` takes two arguments:

* `buffer` : the full array of pixel data
* `offset` : the index of the next red channel to process

You can use `offset` to access the RGBA data for the current pixel:

    processPixel: (buffer, offset) =>
        buffer[offset]          # Red channel
        buffer[offset + 1]      # Green channel
        buffer[offset + 2]      # Blue channel
        buffer[offset + 3]      # Alpha channel

Each element in the buffer is a byte ranging from 0-255.

If you want more granular control over how a filter is applied, just have your filter override `process(image_data)`.

Contributing
============

I'd love bug fixes, performance improvements, new filters & API suggestions. Just send me a message or pull request on GitHub and I'll get back to you.

