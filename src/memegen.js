import omggif from 'omggif'
import GIF from 'gif.js.optimized'
import axios from 'axios'

import templateList from './templateList'

export class Template {
  constructor (id) {
    // In templateList.json
    this.id = id
    let templateInfo = templateList[id]
    this.name = templateInfo.name
    this.extension = templateInfo.extension

    // In static/<id>/template.json
    this.textInfo = []
    axios.get(`static/${this.id}/template.json`)
      .then(response => {
        let textInfo = response.data
        for (let info of textInfo) {
          info.text = ''
        }
        this.textInfo = textInfo
      })

    this._gifReader = null
    axios.get(`static/${this.id}/template${templateInfo.extension}`, {
      responseType: 'arraybuffer'
    }).then(response => {
      let imageData = new Uint8Array(response.data)
      this._gifReader = new omggif.GifReader(imageData)
    })

    this.isGenerating = false
  }

  isBusy () {
    return this.textInfo.length === 0 || this._gifReader == null || this.isGenerating
  }

  async generate () {
    if (this.isBusy()) {
      return null
    }
    this.isGenerating = true

    // Get image size
    let frame0Info = this._gifReader.frameInfo(0)
    let [width, height] = [frame0Info.width, frame0Info.height]

    // Init canvas
    let canvas = document.createElement('canvas');
    [canvas.width, canvas.height] = [width, height]
    let ctx = canvas.getContext('2d')
    ctx.font = "20px 'Microsoft YaHei', sans-serif"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillStyle = 'white'
    ctx.lineWidth = 3
    ctx.lineJoin = 'round'

    // Init GIF encoder
    let gif = new GIF({
      workerScript: 'static/js/gif.worker.js',
      workers: 2,
      quality: 10,
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
      if (textIndex < this.textInfo.length) {
        let textInfo = this.textInfo[textIndex]
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
      gif.on('finished', blob => {
        this.isGenerating = false
        resolve(blob)
      })
      gif.render()
    })
  }
}
