let capture
let w = 640
let h = 480

let ua = navigator.userAgent
if(ua.indexOf('iPhone') >= 0 || ua.indexOf('Android') >= 0 || ua.indexOf('Mobile') >= 0 || ua.indexOf('iPad') >= 0){
  w = window.innerWidth
  h = window.innerHeight
}


let backgroundPixels

function setup(){
  capture = createCapture({
    audio: false,
    video: {
      width: w,
      height: h
    }
  }, () => {
    console.log('capture ready.')
  })
  capture.elt.setAttribute('playsinine', '')
  capture.elt.setAttribute('autoplay', true)
  capture.elt.setAttribute('controls', true)
  capture.size(w, h)
  let canvas = createCanvas(w, h)
  canvas.parent('app')
  capture.hide()
}

function draw(){
  backgroundEffect()
}

function copyImage(src, dst){
  let n = src.length
  if(!dst || dst.length != n){
    dst = new src.constructor(n)
  }
  while(n--){
    dst[n] = src[n]
  }
  return dst
}


function backgroundEffect(){
  capture.loadPixels()

  if(capture.pixels.length > 0){
    if(!backgroundPixels){
      backgroundPixels = copyImage(capture.pixels, backgroundPixels)
    }
    let i = 0
    let pixels = capture.pixels
    let thresholdAmount = select('#thresholdAmount').value() * 255. / 100.
    let thresholdType = 'none'
    if(thresholdType === 'rgb'){
      for(let y = 0; y < h; y++){
        for(let x = 0; x < w; x++){
          pixels[i] = pixels[i] - backgroundPixels[i] > thresholdAmount ? 255: 0
          i++
          pixels[i] = pixels[i] - backgroundPixels[i] > thresholdAmount ? 255: 0
          i++
          pixels[i] = pixels[i] - backgroundPixels[i] > thresholdAmount ? 255: 0
          i++
          i++ // skip alpha
        }
      }

    }else if(thresholdType === 'bw'){
      let total = 0
      for(let y = 0; y < h; y++){
        for(let x = 0; x < w; x++){
          // another common type of background thresholding uses absolute difference, like this:
          // let total = Math.abs(pixels[i + 0] - backgroundPixels[i + 0] > thresholdAmount) || ...
          let rdiff = Math.abs(pixels[i + 0] - backgroundPixels[i + 0]) > thresholdAmount
          let gdiff = Math.abs(pixels[i + 1] - backgroundPixels[i + 1]) > thresholdAmount
          let bdiff = Math.abs(pixels[i + 2] - backgroundPixels[i + 2]) > thresholdAmount
          let anydiff = rdiff || gdiff || bdiff
          let output = 0
          if(anydiff){
            output = 255
            total++
          }
          pixels[i++] = output
          pixels[i++] = output
          pixels[i++] = output
          i++ // skip alpha
        }
      }
      let n = w * h
      let ratio = total / n
    }else{
      for(let y = 0; y < h; y++){
        for(let x = 0; x < w; x++){
          pixels[i] = pixels[i] - backgroundPixels[i]
          i++
          pixels[i] = pixels[i] - backgroundPixels[i]
          i++
          pixels[i] = pixels[i] - backgroundPixels[i]
          i++
          i++ // skip alpha
        }
      }
    }

  }

  capture.updatePixels()
  image(capture, 0, 0, w, h)
}