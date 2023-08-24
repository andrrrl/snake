const boardDiv = document.querySelector('.board')

const boardConfig = {
    dimensions: { x: 500, y: 500 },
    cellSize: 10,
    movementRatePixels: 10,
    movementRateMs: 100,
    startAxisDirection: 'x',
    snakeFood: [
        { x: 200, y: 80, value: 1, eaten: false, current: true },
        { x: 200, y: 180, value: 2, eaten: false, current: false },
        { x: 300, y: 10, value: 3, eaten: false, current: false },
        { x: 30, y: 300, value: 3, eaten: false, current: false },
        { x: 100, y: 450, value: 3, eaten: false, current: false },
        { x: 400, y: 300, value: 3, eaten: false, current: false },
    ],
    foodDiv: document.createElement('div'),
    setSnakeFood: () => {
        const food = boardConfig.snakeFood.find(x => x.eaten === false)
        food.current = true
        boardConfig.foodDiv.style.width = `${boardConfig.cellSize}px`
        boardConfig.foodDiv.style.height = `${boardConfig.cellSize}px`
        boardConfig.foodDiv.style.border = `1px solid red`
        boardConfig.foodDiv.style.borderRadius = `10px`
        boardConfig.foodDiv.style.position = 'absolute'
        boardConfig.foodDiv.style.left = `${food.x}px`
        boardConfig.foodDiv.style.top = `${food.y}px`
        boardDiv.appendChild(boardConfig.foodDiv)
    },
    removeSnakeFood: (food) => {
        const index = boardConfig.snakeFood.indexOf(food)
        boardConfig.snakeFood = boardConfig.snakeFood.slice(index)
        boardDiv.removeChild(boardConfig.foodDiv)
        if (boardConfig.snakeFood.filter(x => x.eaten === false).length > 0) {
            boardConfig.setSnakeFood()
        } else {
            setTimeout(() => {
                boardConfig.gameOver = true
                alert('Ganaste!')
            }, 0)
        }
    },
    eatenFood: 2,
    gameOver: false
}

boardDiv.style.width = `${boardConfig.dimensions.x}px`
boardDiv.style.height = `${boardConfig.dimensions.y}px`

document.onkeydown = (e) => {
    if (snake.isDead) {
        return
    }

    switch (e.code) {
        case 'ArrowLeft':
            if (snake.currentDirection.cssProp === 'left' && !snake.currentDirection.negative) {
                return
            }
            snake.setMoveTo({ direction: 'x', negative: true, cssProp: 'left' })
            break
        case 'ArrowRight':
            if (snake.currentDirection.cssProp === 'left' && snake.currentDirection.negative) {
                return
            }
            snake.setMoveTo({ direction: 'x', negative: false, cssProp: 'left' })
            break
        case 'ArrowUp':
            if (snake.currentDirection.cssProp === 'top' && !snake.currentDirection.negative) {
                return
            }
            snake.setMoveTo({ direction: 'y', negative: true, cssProp: 'top' })
            break
        case 'ArrowDown':
            if (snake.currentDirection.cssProp === 'top' && snake.currentDirection.negative) {
                return
            }
            snake.setMoveTo({ direction: 'y', negative: false, cssProp: 'top' })
            break
    }
}

const snake = {
    length: boardConfig.movementRatePixels * (boardConfig.eatenFood > 0 ? boardConfig.eatenFood : 1),
    currentAxis: boardConfig.startAxisDirection ?? 'x',
    currentDirection: { direction: 'x', negative: false, cssProp: 'left' },
    currentPosition: { left: 200, top: 200 },
    tail: [],
    pathCoords: [],
    move: () => {
        if (snake.wallCollision() || snake.isDead) {
            snake.viewContainer.style.background = 'red'
            return
        }

        if (snake.currentDirection.negative) {
            snake.currentPosition[snake.currentDirection.cssProp] -= boardConfig.movementRatePixels
        } else {
            snake.currentPosition[snake.currentDirection.cssProp] += boardConfig.movementRatePixels
        }

        snake.viewContainer.style[snake.currentDirection.cssProp] = `${snake.currentPosition[snake.currentDirection.cssProp]}px`

        if (snake.foodEaten()) {
            snake.growTail(boardConfig.eatenFood, { left: snake.currentPosition.left, top: snake.currentPosition.top })
        }

        if (snake.pathCoords) {
            snake.pathCoords = [...snake.pathCoords, { left: snake.currentPosition.left, top: snake.currentPosition.top }]
        }
        if (snake.pathCoords.length > snake.tail.length) {
            snake.pathCoords.shift()
        }

        snake.moveTail(boardConfig.eatenFood, { left: snake.currentPosition.left, top: snake.currentPosition.top, ...snake.currentDirection })

    },
    setMoveTo: (newDirection) => {
        snake.currentDirection = newDirection

    },
    foodEaten: () => {
        const edibleFood = boardConfig.snakeFood.find((sf) => {
            return sf.current && sf.x === snake.currentPosition.left && sf.y === snake.currentPosition.top && sf.eaten === false
        })

        if (edibleFood !== undefined) {
            boardConfig.eatenFood++
            edibleFood.eaten = true
            edibleFood.current = false
            boardConfig.removeSnakeFood(edibleFood)
            return true
        }
        return false
    },
    wallCollision: () => {

        const collisionPos = snake.currentPosition[snake.currentDirection.cssProp] >= boardConfig.dimensions[snake.currentAxis]
        const collisionNeg = snake.currentPosition[snake.currentDirection.cssProp] <= -boardConfig.cellSize

        if (collisionPos || collisionNeg) {
            snake.isDead = true
        }
        return collisionPos || collisionNeg
    },
    isDead: false,
    viewContainer: document.querySelector('.snake'),
    growTail: (id, coords) => {
        if (id === 1) {
            const snakeHead = document.createElement(`div`)
            snakeHead.setAttribute('id', `head`)
            snakeHead.style.height = `${boardConfig.movementRatePixels}px`
            snakeHead.style.width = `${boardConfig.movementRatePixels}px`
            snake.viewContainer.appendChild(snakeHead)
        } else {
            const tailPart = document.createElement(`div`)
            tailPart.setAttribute('id', `tail-${id}`)
            tailPart.style.height = `${boardConfig.movementRatePixels}px`
            tailPart.style.width = `${boardConfig.movementRatePixels}px`
            snake.viewContainer.parentNode.appendChild(tailPart)
        }
        if (coords) {
            snake.tail.push({ id, coords })
        }
    },
    moveTail: (id, newCoord) => {
        snake.tail = snake.tail.map(x => {
            return { ...x, coords: newCoord }
        })

        snake.tail.forEach((val, key) => {
            const tailPart = document.getElementById(`tail-${val.id}`)
            if (tailPart) {
                tailPart.style.position = 'absolute'
                tailPart.style.top = `${snake.pathCoords[key].top}px`
                tailPart.style.left = `${snake.pathCoords[key].left}px`
                tailPart.style.background = 'red'
            }
        })


    }
}

snake.viewContainer.style.height = `${boardConfig.movementRatePixels}px`
snake.viewContainer.style.width = `${boardConfig.movementRatePixels}px`

const coordsView = document.querySelector('.coords')
const configView = document.querySelector('.config')
configView.innerHTML = `${boardConfig.dimensions.x} x ${boardConfig.dimensions.y}`

snake.viewContainer.style['left'] = `${snake.currentPosition['left']}px`
snake.viewContainer.style['top'] = `${snake.currentPosition['top']}px`

boardConfig.setSnakeFood()
snake.growTail(boardConfig.eatenFood, { left: snake.currentPosition.left, top: snake.currentPosition.top })

const game = (function loop() {
    if (!boardConfig.gameOver) {
        setTimeout(() => {
            coordsView.querySelector('.x span').innerHTML = snake.currentPosition.left
            coordsView.querySelector('.y span').innerHTML = snake.currentPosition.top
            snake.move()
            loop()
        }, boardConfig.movementRateMs)
    }
})

game()
