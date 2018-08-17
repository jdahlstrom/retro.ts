// A simple helper for doing null checks and other sanity checks. 
// Example use: `mayReturnNull() || panic("was null!")`
function panic(msg: string): never {
  throw Error("Sanity check failed: " + msg)
}

function retro() {
  // We start by getting a reference to the canvas element declared in our HTML page.
  // We use a _type assertion_ to convince TypeScript that it is indeed of type HTMLCanvasElement
  // instead of the plain HTMLElement that Document.getElementById is declared to return.
  let c = (document.getElementById("c") || panic("canvas not found")) as HTMLCanvasElement

  // To actually draw on a canvas element, we need to access one of its _rendering contexts_.
  // Commonly supported contexts are 2D and WebGL. We're going to use the former.
  let ctx = c.getContext("2d") || panic("2D context not supported!")
   
  // The 2D context provides a rich set of high-level drawing operations, but we're going to ignore them.
  // What we want is raw access to the actual pixels that constitute the canvas drawing area.
  // First, we ask for a new ImageData object that represents the entire canvas area.
  let imageData = ctx.createImageData(c.width, c.height)
  
  // ImageData is a simple type that has three properties: width, height, and data. Even though 
  // ImageData represents a two-dimensional area, the pixel data itself is a one-dimensional array,
  // with rows of pixels laid out one after another in a contiguous chunk of memory. This is why 
  // width and height are kept track of separately. The exact type of ImageData.data is
  // Uint8ClampedArray, a _typed array_ of 8-bit integer values, or bytes. Each byte stores the value
  // of a single color channel, either red, green, blue, or alpha (opacity). Four consecutive bytes 
  // make up the color information of a single pixel.
  let bytes = imageData.data

  // The byte-level representation of pixels is fairly inconvenient. We'd rather have each pixel
  // correspond to one element in the array instead of four, with the four 8-bit color channels 
  // packed into a 32-bit value. Luckily, the typed array API allows us to do just that. Using 
  // the buffer property, we create a Uint32Array that is a _view_ into the same underlying data,
  // just interpreted as 32-bit chunks.
  let pixels = new Uint32Array(bytes.buffer)

  // We'd like to use familiar (x, y) coordinates to plot pixels, so we need a bit of math to convert
  // a coordinate pair to a linear index. The general way to do this is `index = y * width + x`.
  // Skipping y rows of pixels brings us to the first pixel of the correct row, then adding x gets us
  // to the right column. To represent a color, we can use a hexadecimal literal like in CSS.
  // The difference is that the order of channels here is ABGR instead of RGBA! This is due to how
  // the data is laid out in memory.
  pixels[100 * imageData.width + 100] = 0xFF0000FF

  // Finally, we paint our image data on the canvas. This is often called _blitting_. For our purposes
  // it makes sense to paint the whole canvas area in one go, but creating multiple smaller images
  // and blitting them at different coordinates is a time-honored technique commonly used in 2D games.
  // Such small animated bitmaps are usually called _sprites_.
  ctx.putImageData(imageData, 0, 0)
}

window.addEventListener("load", retro)