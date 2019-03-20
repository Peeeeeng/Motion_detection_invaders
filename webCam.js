const freshTime = 100/6
// let defaultWidth = window.innerWidth
// let defaultHeight = window.innerHeight
let defaultWidth = 640
let defaultHeight = 480
console.log(defaultWidth, " : ", defaultHeight)
let video = document.getElementById('myCam')
let camCanvas = document.getElementById('camCanvas')
let camContext = camCanvas.getContext('2d')
let blendCanvas = document.getElementById('blendCanvas')
let blendContext = blendCanvas.getContext('2d')
// camCanvas.style.width = defaultWidth + 'px'
// camCanvas.style.height = defaultHeight + 'px'
// blendCanvas.style.width = defaultWidth + 'px'
// blendCanvas.style.height = defaultHeight + 'px'
let initiateUpdate = false


navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia)

camContext.translate(camCanvas.width, 0)
camContext.scale(-1, 1)


navigator.getMedia( { video:true }, gotVideo, noVideo )


function runCamera(){
    setInterval(update, freshTime)



}


function gotVideo(stream){
    video.srcObject = stream
    video.play()
}

function noVideo(err){
    console.error(err)
}

const mc1 = motionCalculator()
function update(){
    if(video.currentTime > 0){
        drawVideo()
            blend()
        if(initiateUpdate){
            let lauchCode = mc1()
            if(lauchCode !== undefined){
                triggerLaunch(lauchCode)
            }
        } else {
            initGame()
            initiateUpdate = true
            gameMode.play()
        }
    }
}

let gameMode = new GameMode()
function initGame(){
    console.log('calculate deploy positions, deploy missles and ufos, setup hotSpots checking areas')
    deploymentCal(camCanvas, misslesNum, missleWidth, missleHeight)
    createBallSet(4)
    createUfo(15)
}

const observationZone = []
function deploymentCal(bgCanvas, sNum, sWidth, sHeight){
    let bgStyle = getComputedStyle(bgCanvas)
    let bgWidth = bgStyle.width.slice(0, -2)
    let bgHeight = bgStyle.height.slice(0, -2)
    // console.log('InitGame ', bgWidth, ' X ', bgHeight)
    let spacing = (bgWidth - sNum * sWidth) / (sNum + 1)
    for(let i = 0; i < sNum; i++){
        let x = spacing + spacing * i + sWidth * i
        let y = bgHeight - sHeight
        let w = sWidth
        let h = sHeight
        observationZone.push([x, y, w, h])
        // console.log('InitGame ', [x, y, w, h])
    }
    
}

function triggerLaunch(idx){
    ballSet[idx].launch()
    console.log('Launch missile ', idx)
}

function motionCalculator(){
    let sampleAdjustment = 17
    let adjustmentCounter = 0
    let sensorScale = 25 * 10
    let hotSpots = {}
    return function(){
        if(adjustmentCounter === 0){
            // console.log('Start counting')
            for(let i = 0; i < observationZone.length; i++){
                let zone = observationZone[i]
                hotSpots[i] = checkHotSpots(...zone)
            }
        } else {
            for(let i = 0; i < observationZone.length; i++){
                let zone = observationZone[i]
                hotSpots[i] += checkHotSpots(...zone)
            }
        }
        ++adjustmentCounter
        if(adjustmentCounter >= sampleAdjustment){
            let highestNum = 0
            let highestRegion = 1
            adjustmentCounter = 0

            for(let key in hotSpots){
                if(hotSpots[key] > highestNum){
                    highestNum = hotSpots[key]
                    highestRegion = key
                }
            }
            if(highestNum > sensorScale){
                console.log('Something moved in region ', highestRegion, ' score ', hotSpots[highestRegion])
                // ballSet[highestRegion - 1].launch()
                return highestRegion
            }
        }
    }
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

function checkHotSpots(x, y, w1, h1){
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




/////////////////////////////////////////////////////////////////////////
let screenWidth = 640
let screenHeight = 480
const misslesNum = 4
const missleWidth = 20
const missleHeight = 20

function GameMode(){
    let status = false
    Object.defineProperty(this, 'status', {
        get: function(){
            return status
        }
    })
    this.play = function(){
            status = true
        }
   this.stop = function(){
            status = false
        }
}


// let moBall = document.getElementById('mo')
let ballSet = [] 
function createBallSet (num){
    for(let i = 0; i < num; i++){
        let left = 110*(1+i) + 20*i
        let speed =  5 + Math.floor(Math.random() * 5)
        let newBall = new moBall(left, screenHeight, speed)
        ballSet.push(newBall)
    }
}



function moBall(left, top, speed){
    Object.defineProperty(this, 'left', {
        get: function(){
            return left
        }
    })
    Object.defineProperty(this, 'top', {
        get: function(){
            return top
        }
    })
    Object.defineProperty(this, 'speed', {
        get: function(){
            return speed
        }
    })
    Object.defineProperty(this, 'ball', {
        get: function(){
            return newBall
        }
    })

    this.launch = () => launch(newBall)

    let newBall = document.createElement('DIV')
    newBall.className = 'mo'
    newBall.style.left = left + 'px'
    newBall.style.top = top + 'px'
    document.body.appendChild(newBall)
    newBall.movement = false
    newBall.speed = speed
    newBall.onclick = () => this.launch()
}

function launch(elm) {
    // console.log(gameMode.status)
    if(elm.movement === false && gameMode.status){
        elm.movement = true
        let oriTop = getComputedStyle(elm).top
        let mu = setInterval(upward, 50)
        
        function upward(){
            let top = getComputedStyle(elm).top.slice(0, -2)
            console.log(top)
            if(top > 0){
                top -= elm.speed
                elm.style.top = top + 'px'
            } else {
                clearInterval(mu)
                elm.style.visibility = 'hidden'
                elm.style.top = oriTop
                setTimeout(() => {
                    elm.movement = false
                    elm.style.visibility = 'visible'
                }, 1500);
            }
        }
    } 
}




function createUfo(num){
    let counter = 0
    let ufoGenerator = setInterval(createStart, 5000)
    function createStart(){
        if(counter >= num){
            clearInterval(ufoGenerator)
            return
        }
        let ufo = document.createElement('DIV')
        ufo.className = 'ufo'
        ufo.speed = 5
        ufo.descentRate = 30
        ufo.descentSpeed = 10
        document.body.appendChild(ufo)
        
        patrol(ufo)
        counter++
        
    }
}

function ufo(speed, descentRate, descentSpeed){
    let newUfo = document.createElement('DIV')
    newUfo.className = 'ufo'
    newUfo.speed = speed
    newUfo.descentRate = descentRate
    newUfo.descentSpeed = descentSpeed
    document.body.appendChild(newUfo)
    this.patrol = () => patrol(newUfo)
}

function patrol(elm) {
    if(gameMode.status){
        let oriTop = getComputedStyle(elm).top
        let oriLeft = getComputedStyle(elm).left
        
        let top = Number(oriTop.slice(0, -2))
        let left = Number(oriLeft.slice(0, -2))
        let width = getComputedStyle(elm).width.slice(0, -2)
        let height = getComputedStyle(elm).height.slice(0, -2)
        let towardRight = true
        let steps = 0
        let ufoMovement = setInterval(movement, 50)
        
        function movement(){
            if(top < 500){
                if(steps > elm.descentRate){
                    steps = 0
                    top += Number(elm.descentSpeed)
                    elm.style.top = top + 'px'
                } else {
                    if(towardRight){
                        left += elm.speed
                        if((left + width*1.2) >= screenWidth){
                            towardRight = false
                        }
                    } else {
                        left -= elm.speed
                        if((left - width*0.2) < 0){
                            towardRight = true
                        }
                    }
                    elm.style.left = left + 'px'
                    steps++
                }
            } else {
                clearInterval(ufoMovement)
            }
            if(checkCollision(top, left, height, width)){
                clearInterval(ufoMovement)
                elm.className = 'fire'
                setTimeout(() => {
                    elm.className = 'ufo'
                    elm.style.visibility = 'hidden'
                }, 1500);
            }
        }
    }
}


function checkCollision(top, left, height, width){
    for(let i = 0; i < ballSet.length; i++){
        let aElm = getComputedStyle(ballSet[i].ball)
        let aScale = matrixToArray(aElm.transform)
        if(aScale){
            aScale = aScale[0]
        } else {
            aScale = 1
        }
        let aTop = Number(aElm.top.slice(0, -2))
        let aLeft = Number(aElm.left.slice(0, -2))
        let aRight = aLeft + Number(aElm.width.slice(0, -2)) * aScale
        let aBottom = aTop + aElm.height.slice(0, -2) * aScale
        let bottom = top + Number(height)
        let right = left + Number(width)
        if(aTop <= bottom && aBottom >= top){
            if(left <= aRight && right >= aLeft){
                console.log('Collision detected!')
                ballSet[i].ball.style.top = -100 + 'px'
                return true
            }
        }
    }
}


function matrixToArray(str) {
    // console.log('Matrix to array: ', str)
    return str.match(/(-?[0-9\.]+)/g);
  }
