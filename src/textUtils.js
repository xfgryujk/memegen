const DEBUG = false

// Supports multiline, wrapping, vertical text...
export function drawText (ctx, text, x, y, width, height, hasStroke = false, isVertical = false) {
  if (DEBUG) {
    let [oldLineWidth, oldStrokeStyle] = [ctx.lineWidth, ctx.strokeStyle];
    [ctx.lineWidth, ctx.strokeStyle] = [1, 'red']
    ctx.strokeRect(x, y, width, height);
    [ctx.lineWidth, ctx.strokeStyle] = [oldLineWidth, oldStrokeStyle]
  }

  if (!isVertical) {
    drawTextHorizontal(ctx, text, x, y, width, height, hasStroke)
  } else {
    drawTextVertical(ctx, text, x, y, width, height, hasStroke)
  }
}

// Vertically centered
function drawTextHorizontal (ctx, text, x, y, width, height, hasStroke = false) {
  let oldBaseLine = ctx.textBaseline
  ctx.textBaseline = 'hanging'
  let lineHeight = parseInt(ctx.font) // ctx.font must start with 'XXpx'

  // Calculate lines
  let lines = []
  let curLine = ''
  for (let char of text) {
    let nextLine = curLine + char
    if (char === '\n' || ctx.measureText(nextLine).width > width) {
      lines.push(curLine)
      curLine = char === '\n' ? '' : char
    } else {
      curLine = nextLine
    }
  }
  lines.push(curLine)

  // Draw
  let lineY = y + (height - lineHeight * lines.length) / 2
  for (let line of lines) {
    let lineX
    if (ctx.textAlign === 'center') {
      lineX = x + width / 2
    } else if (ctx.textAlign === 'right') {
      lineX = x + width
    } else {
      lineX = x
    }
    if (hasStroke) {
      ctx.strokeText(line, lineX, lineY, width)
    }
    ctx.fillText(line, lineX, lineY, width)
    lineY += lineHeight
  }

  ctx.textBaseline = oldBaseLine
}

// Horizontally centered, from right to left
function drawTextVertical (ctx, text, x, y, width, height, hasStroke = false) {
  let [oldAlign, oldBaseLine] = [ctx.textAlign, ctx.textBaseline];
  [ctx.textAlign, ctx.textBaseline] = ['center', 'middle']
  let lineWidth = parseInt(ctx.font) // ctx.font must start with 'XXpx'

  let charInfo = []
  for (let char of text) {
    let cInfo = {
      char: char,
      needsRotation: needsRotation(char)
    }
    if (cInfo.needsRotation) {
      [cInfo.width, cInfo.height] = [lineWidth, ctx.measureText(char).width]
    } else {
      [cInfo.width, cInfo.height] = [ctx.measureText(char).width, lineWidth]
    }
    charInfo.push(cInfo)
  }

  // Calculate lines
  let lineInfo = []
  let curLine = []
  let curLineHeight = 0
  for (let info of charInfo) {
    if (info.char === '\n' || curLineHeight + info.height > height) {
      lineInfo.push({
        charInfo: curLine,
        height: curLineHeight
      })
      curLine = info.char === '\n' ? [] : [info]
      curLineHeight = info.height
    } else {
      curLine.push(info)
      curLineHeight += info.height
    }
  }
  lineInfo.push({
    charInfo: curLine,
    height: curLineHeight
  })

  // Draw
  let lineX = x + (width + lineWidth * lineInfo.length) / 2 - lineWidth / 2 // Center of the line
  for (let lInfo of lineInfo) {
    let charY // Top of the character
    if (oldAlign === 'center') {
      charY = y + (height - lInfo.height) / 2
    } else if (oldAlign === 'right') {
      charY = y + height - lInfo.height
    } else {
      charY = y
    }

    // Draw a line
    for (let cInfo of lInfo.charInfo) {
      ctx.translate(lineX, charY + cInfo.height / 2)
      if (cInfo.needsRotation) {
        ctx.rotate(90 * Math.PI / 180)
      }
      // Draw a character
      if (hasStroke) {
        ctx.strokeText(cInfo.char, 0, 0)
      }
      ctx.fillText(cInfo.char, 0, 0)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      charY += cInfo.height
    }
    lineX -= lineWidth
  }

  [ctx.textAlign, ctx.textBaseline] = [oldAlign, oldBaseLine]
}

// CJK
const NO_ROTATION_RANGE = [
  [0x2E80, 0x2FEF],
  [0x3040, 0x9FFF],
  [0xAC00, 0xD7FF],
  [0xF900, 0xFAFF],
  [0x1D300, 0x1D35F],
  [0x20000, 0x2FA1F]
]

function needsRotation (char) {
  let codePoint = char.codePointAt(0)
  for (let [lowerBound, upperBound] of NO_ROTATION_RANGE) {
    if (lowerBound <= codePoint && codePoint <= upperBound) {
      return false
    }
  }
  return true
}

// Vertical text can't wrap
// // Supports multiline, wrapping, vertical text...
// async function drawText (ctx, text, x, y, width, height, hasStroke = false, isVertical = false) {
//   let div = document.createElement('div')
//   div.innerText = text
//   let parentSize = DEBUG ? 'calc(100% - 2px)' : '100%'
//   div.style = `
//     word-wrap: break-word;
//     word-break: break-all;

//     font: ${ctx.font};

//     text-align: ${isVertical ? 'left' : ctx.textAlign};
//     ${isVertical ? 'height' : 'width'}: ${parentSize};
//     position: relative;
//     ${isVertical ? `right: 50%; transform: translateX(50%);` : `top: 50%; transform: translateY(-50%);`}
//     ${isVertical ? 'writing-mode: vertical-rl;' : ''}
//     ${isVertical ? 'float: right;' : ''}

//     color: ${ctx.fillStyle};
//     ${hasStroke ? `text-shadow: 0 1px ${ctx.strokeStyle}, 1px 0 ${ctx.strokeStyle}, -1px 0 ${ctx.strokeStyle}, 0 -1px ${ctx.strokeStyle};` : ''}

//     ${DEBUG ? 'border: 1px solid red;' : ''}
//   `
//   let bodyStyle = `
//     margin: 0;
//     overflow: hidden;
//     width: ${parentSize};
//     height: ${parentSize};
//     ${DEBUG ? 'border: 1px solid blue;' : ''}
//   `
//   let svg = `
//     <svg xmlns="http://www.w3.org/2000/svg">
//       <foreignObject width="${width}px" height="${height}px">
//         <body xmlns="http://www.w3.org/1999/xhtml" style="${bodyStyle}">
//           ${div.outerHTML}
//         </body>
//       </foreignObject>
//     </svg>
//   `
//   if (DEBUG) {
//     console.log(svg)
//   }

//   return new Promise((resolve, reject) => {
//     let img = new window.Image()
//     img.onload = () => {
//       ctx.drawImage(img, x, y)
//       resolve()
//     }
//     img.onerror = () => {
//       reject(new Error(`Failed to load the image: ${img.src}`))
//     }
//     img.src = `data:image/svg+xml;charset=utf-8,${svg}`
//   })
// }
