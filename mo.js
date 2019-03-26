// let screenWidth = getComputedStyle(document.getElementById('camCanvas')).width.slice(0, -2)
// let screenHeight = getComputedStyle(document.getElementById('camCanvas')).height.slice(0, -2)

let screenWidth = 640
let screenHeight = 480
console.log('ScreenWidth = ', screenWidth)
console.log('ScreenHeight = ', screenHeight)

// let moBall = document.getElementById('mo')
let ballSet = [] 
function createBallSet (num){
    for(let i = 0; i < num; i++){
        let left = 120*(1+i)
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

function matrixToArray(str) {
    // console.log('Matrix to array: ', str)
    return str.match(/(-?[0-9\.]+)/g);
  }

function launch(elm) {
//     var matrix = new WebKitCSSMatrix(getComputedStyle(elm).transform);
//   console.log('translateX: ', matrix)
    // console.log(matrixToArray(getComputedStyle(elm).transform))

    // let theBall = getComputedStyle(elm)
    // console.log('Width & height : ', theBall.width, ' X ', theBall.height)

    if(elm.movement === false){
        elm.movement = true
        let oriTop = getComputedStyle(elm).top
        // // console.log(oriTop)
        // let top = oriTop.slice(0, -2)
        let mu = setInterval(upward, 50)
        
        function upward(){
            let top = getComputedStyle(elm).top.slice(0, -2)
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


createBallSet(5)

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

    let newUfoCore = document.createElement('DIV')
    newUfoCore.className = 'ufo_core'
    newUfo.appendChild(newUfoCore)
}

function patrol(elm) {
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
                elm.style.visibility = 'hidden'
            }, 1500);
            
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
        let aBottom = aTop + aElm.height.slice(0, -2) * aScale * 0.8 
        let bottom = top + Number(height)
        let right = left + Number(width)
        if(aTop <= bottom && aBottom >= top){
            if(left <= aRight && right >= aLeft){
                // console.log('Collision detected!')
                // console.log('UFO top & bottom :', top, ' - ', bottom)
                // console.log('Missile top & bottom :', aTop, ' - ', aBottom)
                ballSet[i].ball.style.top = -100 + 'px'
                // ballSet[i].ball.style.visibility = 'hidden'
                // setTimeout(() => {
                //     ballSet[i].ball.style.top = screenHeight + 'px'
                // }, 1000);
                return true
            }
        }
    }
}


createUfo(15)