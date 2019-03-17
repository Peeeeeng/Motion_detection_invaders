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
        let newBall = document.createElement('DIV')
        newBall.className = 'mo'
        newBall.style.left = 120*(1+i) + 'px'
        document.body.appendChild(newBall)
        // newBall.addEventListener('click', movingUp(newBall))
        newBall.movement = false
        newBall.speed = 5 + Math.floor(Math.random() * 5)
        newBall.onclick = () => launch(newBall)
        ballSet.push(newBall)
    }
}

function launch(elm) {
    // console.log(elm)
    if(elm.movement === false){
        elm.movement = true
        let oriTop = getComputedStyle(elm).top
        console.log(oriTop)
        let top = oriTop.slice(0, -2)
        let mu = setInterval(upward, 50)
        
        function upward(){
            if(top > 0){
                elm.style.top = top + 'px'
                top -= elm.speed
            } else {
                clearInterval(mu)
                elm.style.visibility = 'hidden'
                elm.movement = false
                setTimeout(() => {
                    elm.style.top = oriTop
                    elm.style.visibility = 'visible'
                }, 1000);
                
            }
        }
    }
    
}

// function moveBallSet(ballSet){
//     for(let i = 0; i < ballSet.length; i++){
//         movingUp(ballSet[i])
//     }
// }

createBallSet(5)
// moveBallSet(ballSet)
// movingUp(moBall)

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


function patrol(elm) {
    // if(!screenWidth){
    //     return
    // }
    // if(elm.movement === false){
        // elm.movement = true
        let oriTop = getComputedStyle(elm).top
        let oriLeft = getComputedStyle(elm).left
        let oriRight = getComputedStyle(elm).right
        let oriBottom = getComputedStyle(elm).bottom
        console.log(oriTop)
        console.log(oriLeft)
        console.log(oriRight)
        console.log(oriBottom)
        
        let top = Number(oriTop.slice(0, -2))
        let left = Number(oriLeft.slice(0, -2))
        let width = getComputedStyle(elm).width.slice(0, -2)
        let height = getComputedStyle(elm).height.slice(0, -2)
        let ufoMovement = setInterval(movement, 50)
        let towardRight = true
        let steps = 0
        function movement(){
            // console.log(towardRight ? 'Right' : 'Left', ', coordinate: ', left, '&', top)
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
                // elm.style.visibility = 'hidden'
                // // elm.movement = false
                // setTimeout(() => {
                //     elm.style.top = oriTop
                //     elm.style.visibility = 'visible'
                // }, 1000);
                
            }
            for(let i = 0; i < ballSet.length; i++){
                if(checkCollision(elm, top, left, height, width, ballSet[i])){
                    clearInterval(ufoMovement)
                    elm.style.visibility = 'hidden'
                    break
                }
            }
        }
    // }
}


function checkCollision(oriElm, top, left, height, width, againstElm){
    let aElm = getComputedStyle(againstElm)
    let aTop = Number(aElm.top.slice(0, -2))
    let aLeft = Number(aElm.left.slice(0, -2))
    let aRight = aLeft + Number(aElm.width.slice(0, -2))
    let aBottom = Number(aTop + aElm.height.slice(0, -2))
    let bottom = top + Number(height)
    let right = left + Number(width)
    // console.log(left,'-', right,'-', bottom, ' VS ', aLeft,'-', aRight, '-', aBottom)
    if(aTop <= bottom && aBottom >= top){
        // console.log('This runs!')
    // console.log(left,'-', right,'-', bottom, ' VS ', aLeft,'-', aRight, '-', aBottom)
        if(left <= aRight && right >= aLeft){
            // console.log(left,':', right,':', bottom, ' VS ', aLeft,':', aRight, ':', aBottom)
            console.log('Collision detected!')
            return true
        }
    }
}


createUfo(5)
module.exports = ballSet