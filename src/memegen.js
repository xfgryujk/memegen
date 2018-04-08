import omggif from 'omggif'
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
    console.log(this)
  }
}
