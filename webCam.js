let ballSet = require('./mo')

let freshTime = 100/6
let defaultWidth = window.innerWidth
let defaultHeight = window.innerHeight
console.log(defaultWidth, " : ", defaultHeight)
let video = document.getElementById('myCam')
let camCanvas = document.getElementById('camCanvas')
let camContext = camCanvas.getContext('2d')
let blendCanvas = document.getElementById('blendCanvas')
let blendContext = blendCanvas.getContext('2d')


navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia)

camContext.translate(camCanvas.width, 0)
camContext.scale(-1, 1)





navigator.getMedia( { video:true }, gotVideo, noVideo )


function runCamera(){
    
    // let lastImageStore = {lastImage: null}
    setInterval(update, freshTime)



    


}

function gotVideo(stream){
    video.srcObject = stream
    video.play()
}

function noVideo(err){
    console.error(err)
}

let sampleAdjustment = 20
let adjustmentCounter = 0
let hotSpots = {}
function update(){
    drawVideo()
    blend()
    // collect all can compare, only triger the biggest
    // collect data for 3 times(0.5 second) and get the biggest, may avoid minor movement being mis-reccognized
    // let hotSpots = []
    // hotSpots.push(checkHotSpots(1, 0, 420, 100, 60))
    // hotSpots.push(checkHotSpots(2, 160, 420, 100, 60))
    // hotSpots.push(checkHotSpots(3, 320, 420, 100, 60))
    if(adjustmentCounter === 0){
        // console.log('Start counting')
        hotSpots[1] = checkHotSpots(1, 0, 420, 50, 60)
        hotSpots[2] = checkHotSpots(2, 160, 420, 50, 60)
        hotSpots[3] = checkHotSpots(3, 320, 420, 50, 60)
    } else {
        
        hotSpots[1] += checkHotSpots(1, 0, 420, 50, 60)
        hotSpots[2] += checkHotSpots(2, 160, 420, 50, 60)
        hotSpots[3] += checkHotSpots(3, 320, 420, 50, 60)
    }
    ++adjustmentCounter
    if(adjustmentCounter >= sampleAdjustment){
        let highestNum = 0
        let highestRegion = 1
        
        // for(let i = 0; i < hotSpots.length; i++){
        //     if(hotSpots[i] > highestNum){
        //         highestNum = hotSpots[i]
        //         highestRegion = i + 1
        //     }
        // }
        for(let key in hotSpots){
            if(hotSpots[key] > highestNum){
                highestNum = hotSpots[key]
                highestRegion = key
            }
        }
        if(highestNum > 100){
            console.log('Something moved in region ', highestRegion, ' score ', hotSpots[highestRegion])
            // luanch(ballSet[highestRegion])
        }
        adjustmentCounter = 0
    }
    // checkHotSpots(4, 150, 0, 200, 200)
}

function drawVideo(){
    let vWidth = video.videoWidth
    let vHeight = video.videoHeight
    camCanvas.width = vWidth
    camCanvas.height = vHeight
    camContext.translate(camCanvas.width, 0)
    camContext.scale(-1, 1)
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        camContext.drawImage(video, 0, 0)
    }
    // console.log('drawing')
    // let img = document.getElementById('output')
    // let imageDataURL = camCanvas.toDataURL('image/png')
    // img.setAttribute('src', imageDataURL)
}

let lastImage
let currentImage

function blend(){
    // let vWidth = video.videoWidth === 0 ? defaultWidth : video.videoWidth
    // let vHeight = video.videoHeight === 0 ? defaultHeight : video.videoHeight
    let vWidth = defaultWidth
    let vHeight = defaultHeight
    blendCanvas.width = vWidth
    blendCanvas.height = vHeight
    // console.log('vWidth = ', vWidth, ' vHeight = ', vHeight)
    let currentImage = camContext.getImageData(0, 0, vWidth, vHeight)
    // let lastImage = lastImageStore.lastImage
    if(!lastImage) {
        lastImage = camContext.getImageData(0, 0, vWidth, vHeight)
    }
    // console.log(lastImage.data)
    let output = camContext.createImageData(vWidth, vHeight)
    checkDiff(currentImage.data, lastImage.data, output.data)
    blendContext.putImageData(output, 0, 0)
    lastImage = currentImage
    
    // blendContext.drawImage(video, 0, 0)

}

function checkDiff(currentImage, lastImage, output){
    if(currentImage.length !== lastImage.length) return null
    let i = 0
    while(i < (currentImage.length / 4)){
        let average1 = (currentImage[4*i] + currentImage[4*i+1] + currentImage[4*i+2]) / 3
        let average2 = (lastImage[4*i] + lastImage[4*i+1] + lastImage[4*i+2]) /3
        let diff = (average1 - average2) > 0x15 ? 0xFF : 0
        output[4*i] = diff
        output[4*i+1] = diff
        output[4*i+2] = diff
        output[4*i+3] = 0xFF
        ++i
        // console.log('running inside loop')
    }
}

function checkHotSpots(region, x, y, w1, h1){
    let blendedData = blendContext.getImageData(x, y, w1, h1)
    let i = 0
    let sum = 0
    let countPixels = blendedData.data.length / 4
    while(i < countPixels){
        sum += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2])
        ++i
    }
    let average = Math.round(sum / (3 * countPixels))
    // if(average > 5){
    //     console.log('Something moved in region ', region)
    // } 
    // else {
    //     console.log('.......')
    // }
    return average
}


runCamera()


