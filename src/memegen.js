import omggif from 'omggif'
import axios from 'axios'

async function test () {
  let response = await axios.get('static/sorry/template.gif', {
    responseType: 'arraybuffer'
  })

  let gr = new omggif.GifReader(new Uint8Array(response.data))
  let fi0 = gr.frameInfo(0)
  console.log(response, gr, fi0)

  let img = document.createElement('img')
  img.src = window.URL.createObjectURL(new window.Blob([response.data]))
  document.body.appendChild(img)
}

test()
