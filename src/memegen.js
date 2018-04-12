import omggif from 'omggif'
import GIF from 'gif.js.optimized'
import axios from 'axios'

import templateList from './templateList'
import { STATIC_URL } from './settings'

class ImageGenerator {
  constructor (textInfo) {
    this.DEFAULT_FONT_SIZE = 20
    this.DEFAULT_FONT_FAMILY = "'Microsoft YaHei', sans-serif"
    this.DEFAULT_FILL_STYLE = 'white'
    this.DEFAULT_STROKE_STYLE = 'black'

    this._textInfo = textInfo
  }

  get isGenerating () {
    return false
  }

  // Range: [0, 1]
  get generatingProgress () {
    return 0
  }

  async generate () {
    return null
  }

  _createCanvasContext (width, height) {
    let canvas = document.createElement('canvas');
    [canvas.width, canvas.height] = [width, height]
    let ctx = canvas.getContext('2d')
    ctx.font = `${this.DEFAULT_FONT_SIZE}px ${this.DEFAULT_FONT_FAMILY}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillStyle = this.DEFAULT_FILL_STYLE
    if (this.DEFAULT_STROKE_STYLE) {
      ctx.strokeStyle = this.DEFAULT_STROKE_STYLE
    }
    ctx.lineWidth = 3
    ctx.lineJoin = 'round'
    return [canvas, ctx]
  }
}

class GifGenerator extends ImageGenerator {
  constructor (textInfo, imageData) {
    super(textInfo)
    this._gifReader = new omggif.GifReader(imageData)

    // -1 means not generating
    this._generatingProgress = -1
  }

  get isGenerating () {
    return this._generatingProgress >= 0
  }

  // Range: [0, 1]
  get generatingProgress () {
    return this._generatingProgress >= 0 ? this._generatingProgress : 0
  }

  async generate () {
    if (this.isGenerating) {
      return null
    }
    this._generatingProgress = 0

    // Get image size
    let frame0Info = this._gifReader.frameInfo(0)
    let [width, height] = [frame0Info.width, frame0Info.height]

    // Init canvas
    let [, ctx] = this._createCanvasContext(width, height)

    // Init GIF encoder
    let gif = new GIF({
      workerScript: 'static/js/gif.worker.js',
      workers: 3,
      quality: 16,
      width: width,
      height: height
    })

    // Image data, RGBA RGBA ...
    let pixelBuffer = new Uint8ClampedArray(width * height * 4)
    let time = 0
    let textIndex = 0
    for (let i = 0; i < this._gifReader.numFrames(); i++) {
      // Decode frame and draw it to canvas
      this._gifReader.decodeAndBlitFrameRGBA(i, pixelBuffer)
      let imageData = new window.ImageData(pixelBuffer, width, height)
      ctx.putImageData(imageData, 0, 0)

      // Add text
      let frameInfo = this._gifReader.frameInfo(i)
      if (textIndex < this._textInfo.length) {
        let textInfo = this._textInfo[textIndex]
        if (textInfo.startTime <= time && time < textInfo.endTime) {
          let text = textInfo.text || textInfo.default
          ctx.strokeText(text, width / 2, height - 5, width)
          ctx.fillText(text, width / 2, height - 5, width)
        }
        time += frameInfo.delay / 100
        if (time >= textInfo.endTime) {
          textIndex++
        }
      }

      // Add frame
      gif.addFrame(ctx, {
        copy: true,
        delay: frameInfo.delay * 10,
        dispose: frameInfo.disposal
      })
    }

    return new Promise((resolve, reject) => {
      gif.on('progress', progress => {
        this._generatingProgress = progress
      })
      gif.on('finished', blob => {
        this._generatingProgress = -1
        resolve(window.URL.createObjectURL(blob))
      })
      gif.render()
    })
  }
}

class StaticImageGenerator extends ImageGenerator {
  constructor (textInfo, imageData) {
    super(textInfo)
    this.DEFAULT_FILL_STYLE = 'black'
    this.DEFAULT_STROKE_STYLE = null

    let blob = new window.Blob([imageData])
    this._image = new window.Image()
    this._image.src = window.URL.createObjectURL(blob)
  }

  async generate () {
    // Init canvas
    let [width, height] = [this._image.width, this._image.height]
    let [canvas, ctx] = this._createCanvasContext(width, height)
    ctx.drawImage(this._image, 0, 0)

    // Add texts
    for (let textInfo of this._textInfo) {
      let fontSize = textInfo.size || this.DEFAULT_FONT_SIZE
      let fontFamily = textInfo.font || this.DEFAULT_FONT_FAMILY
      let fillStyle = textInfo.color || this.DEFAULT_FILL_STYLE
      let strokeStyle = textInfo.strokeColor || this.DEFAULT_STROKE_STYLE
      ctx.font = `${fontSize}px ${fontFamily}`
      ctx.fillStyle = fillStyle
      if (strokeStyle) {
        ctx.strokeStyle = strokeStyle
      }

      let text = textInfo.text || textInfo.default
      let maxWidth = textInfo.maxWidth || width
      if (strokeStyle) {
        ctx.strokeText(text, textInfo.x, textInfo.y, maxWidth)
      }
      ctx.fillText(text, textInfo.x, textInfo.y, maxWidth)
    }

    return canvas.toDataURL()
  }
}

export class Template {
  constructor (id) {
    // In templateList.json
    this.id = id
    let templateInfo = templateList[id]
    this.name = templateInfo.name
    this.extension = templateInfo.extension

    // To calculate loading progress
    this._templateTotalLength = this._imageTotalLength = 2 * 1024 * 1024
    this._templateLoadedLength = this._imageLoadedLength = 0

    // In static/<id>/template.json
    this.textInfo = []
    // Temporary variable to create generator
    this._imageData = null

    axios.get(`${STATIC_URL}/${this.id}/template.json`, {
      onDownloadProgress: event => {
        [this._templateTotalLength, this._templateLoadedLength] = [event.total, event.loaded]
      }
    }).then(response => {
      let textInfo = response.data
      for (let info of textInfo) {
        info.text = ''
      }
      this.textInfo = textInfo

      if (this._imageData != null) {
        this._onLoadFinished()
      }
    })

    this._generator = null
    axios.get(`${STATIC_URL}/${this.id}/template${templateInfo.extension}`, {
      responseType: 'arraybuffer',
      onDownloadProgress: event => {
        [this._imageTotalLength, this._imageLoadedLength] = [event.total, event.loaded]
      }
    }).then(response => {
      this._imageData = new Uint8Array(response.data)

      if (this.textInfo.length !== 0) {
        this._onLoadFinished()
      }
    })
  }

  get isLoading () {
    return this._generator == null
  }

  get isGenerating () {
    return this._generator.isGenerating
  }

  // Range: [0, 1]
  get loadingProgress () {
    return (this._templateLoadedLength + this._imageLoadedLength) /
           (this._templateTotalLength + this._imageTotalLength)
  }

  // Range: [0, 1]
  get generatingProgress () {
    return this._generator.generatingProgress
  }

  _onLoadFinished () {
    if (this.extension === '.gif') {
      this._generator = new GifGenerator(this.textInfo, this._imageData)
    } else {
      this._generator = new StaticImageGenerator(this.textInfo, this._imageData)
    }
    delete this._imageData
  }

  async generate () {
    if (this.isLoading || this.isGenerating) {
      return null
    }
    return this._generator.generate()
  }
}
