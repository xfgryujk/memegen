import omggif from 'omggif'
import GIF from 'gif.js.optimized'
import axios from 'axios'

import templateList from './templateList'

export class Template {
  // Use createAsync() instead
  constructor (id, textInfo, imageData) {
    // In templateList.json
    this.id = id
    let templateInfo = templateList[id]
    this.name = templateInfo.name
    this.extension = templateInfo.extension

    // In static/<id>/template.json
    this.textInfo = textInfo
    for (let info of textInfo) {
      info.text = ''
    }

    this._gifReader = new omggif.GifReader(imageData)
  }

  static async createAsync (id) {
    let templateInfo = templateList[id]
    let [textInfoResponse, imageDataResponse] = await Promise.all([
      axios.get(`static/${id}/template.json`),
      axios.get(`static/${id}/template${templateInfo.extension}`, {
        responseType: 'arraybuffer'
      })
    ])
    return new Template(id, textInfoResponse.data, new Uint8Array(imageDataResponse.data))
  }

  async generate () {
    // Get image size
    let frame0Info = this._gifReader.frameInfo(0)
    let [width, height] = [frame0Info.width, frame0Info.height]

    // Init canvas
    let canvas = document.createElement('canvas');
    [canvas.width, canvas.height] = [width, height]
    let ctx = canvas.getContext('2d')

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
    for (let i = 0; i < this._gifReader.numFrames(); i++) {
      // Decode frame and draw it to canvas
      this._gifReader.decodeAndBlitFrameRGBA(i, pixelBuffer)
      let imageData = new window.ImageData(pixelBuffer, width, height)
      ctx.putImageData(imageData, 0, 0)

      // TODO: Add text

      // Add frame
      let frameInfo = this._gifReader.frameInfo(i)
      gif.addFrame(ctx, {
        copy: true,
        delay: frameInfo.delay * 10,
        dispose: frameInfo.disposal
      })
    }

    return new Promise((resolve, reject) => {
      gif.on('finished', function (blob) {
        resolve(blob)
      })
      gif.render()
    })
  }
}
