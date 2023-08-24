/**
 * This code snippet sets up a game board and controls the movement of a snake on the board.
 * It defines a `boardConfig` object with properties for board dimensions, cell size, movement rates, snake food, and game state.
 * It also defines a `snake` object with properties and methods for controlling the snake's movement.
 * The code sets up the game board by styling and positioning the board div element.
 * It adds an event listener for keydown events to control the snake's movement direction.
 * The snake's initial position, length, and tail are set, and the game loop is started.
 * The game loop repeatedly calls the `move` method of the `snake` object to update the snake's position and check for collisions.
 * Snake food is displayed on the board and can be eaten by the snake, causing the snake's tail to grow.
 * The game loop continues until the snake collides with a wall or its own tail and is marked as dead.
 */
const boardConfig = {
    dimensions: { x: 500, y: 500 },
    cellSize: 10,
    movementRatePixels: 10,
    movementRateMs: 100,
    startAxisDirection: 'x',
    getRandom: (axis) => {
        const baseNumber = Math.floor(Math.random(0, boardConfig.dimensions[axis]) * boardConfig.dimensions[axis]).toString().split('')
        baseNumber.pop()
        baseNumber.push('0')
        return Number(baseNumber.join(''))
    },
    foodQuantity: 10,
    snakeFood: [],
    boardDiv: document.querySelector('.board'),
    foodDiv: document.createElement('div'),
    setSnakeFood: () => {
        if (boardConfig.snakeFood.length === 0) {
            boardConfig.snakeFood = Array.from(Array(boardConfig.foodQuantity)).map(x => ({
                x: boardConfig ? boardConfig.getRandom('x') : 0,
                y: boardConfig ? boardConfig?.getRandom('y') : 0,
                value: 1,
                eaten: false,
                current: true
            }))
        }
        const food = boardConfig.snakeFood.find(x => x.eaten === false)
        food.current = true
        boardConfig.foodDiv.style.width = `${boardConfig.cellSize}px`
        boardConfig.foodDiv.style.height = `${boardConfig.cellSize}px`
        boardConfig.foodDiv.style.border = `1px solid red`
        boardConfig.foodDiv.style.borderRadius = `10px`
        boardConfig.foodDiv.style.position = 'absolute'
        boardConfig.foodDiv.style.left = `${food.x}px`
        boardConfig.foodDiv.style.top = `${food.y}px`
        boardConfig.boardDiv.appendChild(boardConfig.foodDiv)
    },
    removeSnakeFood: (food) => {
        const index = boardConfig.snakeFood.indexOf(food)
        boardConfig.snakeFood = boardConfig.snakeFood.slice(index)
        boardConfig.boardDiv.removeChild(boardConfig.foodDiv)
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

boardConfig.boardDiv.style.width = `${boardConfig.dimensions.x}px`
boardConfig.boardDiv.style.height = `${boardConfig.dimensions.y}px`

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
        if (!snake.isDead && snake.wallCollision() || snake.tailBite()) {
            snake.viewContainer.style.background = 'red'
            snake.isDead = true
            boardConfig.gameOver = true
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

        snake.moveTail({ left: snake.currentPosition.left, top: snake.currentPosition.top, ...snake.currentDirection })

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
            boardConfig.movementRateMs -= 7.5
            return true
        }
        return false
    },
    wallCollision: () => {

        const collisionPos = snake.currentPosition[snake.currentDirection.cssProp] >= boardConfig.dimensions[snake.currentAxis]
        const collisionNeg = snake.currentPosition[snake.currentDirection.cssProp] <= -boardConfig.cellSize

        if (collisionPos || collisionNeg) {
            alert('GAME OVER: ⚡️ you hit an electrified wall!')
        }
        return collisionPos || collisionNeg
    },
    tailBite: () => {
        const bite = snake.pathCoords.length !== new Set(snake.pathCoords.map(x => `top-${x.top}-left-${x.left}`)).size
        if (bite) {
            alert('GAME OVER: 💀 you bit yourself!')
        }
        return bite
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
    moveTail: (newCoord) => {
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
    setTimeout(() => {
        if (!boardConfig.gameOver) {
            coordsView.querySelector('.x span').innerHTML = snake.currentPosition.left
            coordsView.querySelector('.y span').innerHTML = snake.currentPosition.top
            snake.move()
            loop()
        }
    }, boardConfig.movementRateMs)
})

game()
