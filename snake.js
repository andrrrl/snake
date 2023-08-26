const SnakeGame = () => {
    const boardConfig = {
        dimensions: { x: 300, y: 300 },
        cellSize: 10,
        movementRatePixels: 10,
        movementRateMs: 100,
        startAxisDirection: 'x',
        foodQuantity: 10,
        snakeFood: [],
        foodTypes: [
            '🐥',
            '🪲',
            '🐸',
            '🐌',
            '🦎',
            '🐑',
            '🐀',
            '🐁',
            '🐇',
            '🍏',
            '🍎',
            '🍒',
            '🥕',
            '🍕',
            '🥐',
            '🍖',
            '🦴'
        ],
        getRandomAxis: (axis) => {
            const baseNumber = Math.floor(Math.random(0, boardConfig.dimensions[axis]) * boardConfig.dimensions[axis]).toString().split('')
            baseNumber.pop()
            baseNumber.push('0')
            return Number(baseNumber.join(''))
        },
        boardDiv: document.querySelector('.board'),
        foodDiv: document.createElement('div'),
        setSnakeFood: () => {
            if (boardConfig.snakeFood.length === 0) {
                boardConfig.snakeFood = Array.from(Array(boardConfig.foodQuantity)).map(x => ({
                    x: boardConfig ? boardConfig.getRandomAxis('x') : 0,
                    y: boardConfig ? boardConfig?.getRandomAxis('y') : 0,
                    value: 1,
                    eaten: false,
                    current: false
                }))
            }
            const food = boardConfig.snakeFood.find(x => x.eaten === false)
            food.current = true
            boardConfig.foodDiv.style.width = `${boardConfig.cellSize}px`
            boardConfig.foodDiv.style.height = `${boardConfig.cellSize}px`
            boardConfig.foodDiv.style.left = `${food.x}px`
            boardConfig.foodDiv.style.top = `${food.y}px`
            boardConfig.foodDiv.style.position = 'absolute'
            boardConfig.foodDiv.style.lineHeight = 0.7
            boardConfig.foodDiv.style.trsansform = 'scale(0.8)'
            boardConfig.foodDiv.innerHTML = boardConfig.getRandomFood()
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
                    alert('Ganaste!')
                    boardConfig.gameOver = true
                    gameOverlay.style.display = 'flex'
                }, 100)
            }
        },
        getRandomFood: () => {
            const index = Math.floor(Math.random(0, boardConfig.foodTypes.length) * boardConfig.foodTypes.length)
            return  boardConfig.foodTypes[index]
        },
        eatenFood: 1,
        gameOver: false,
        initGame: (function loop() {
            setTimeout(() => {
                if (!boardConfig.gameOver) {
                    coordsView.querySelector('.x span').innerHTML = snake.currentPosition.left
                    coordsView.querySelector('.y span').innerHTML = snake.currentPosition.top
                    snake.wallCollision() 
                    snake.tailBite()
                    snake.move()
                    loop()
                }
            }, boardConfig.movementRateMs)
        }),
        resetGame: () => {
            boardConfig.snakeFood = []
            boardConfig.movementRateMs = 100
            boardConfig.gameOver = false
            boardConfig.setSnakeFood()
        }
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
        currentAxis: boardConfig.startAxisDirection ?? 'x',
        currentDirection: { direction: 'x', negative: false, cssProp: 'left' },
        currentPosition: { left: 200, top: 200 },
        tail: [],
        pathCoords: [],
        move: () => {

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
                alert('GAME OVER: ⚡️ chocaste con una pared electrificada!')
                snake.viewContainer.style.background = 'red'
                snake.isDead = true
                boardConfig.gameOver = true
                gameOverlay.style.display = 'flex'
            }
        },
        tailBite: () => {
            const bite = snake.pathCoords.length !== new Set(snake.pathCoords.map(x => `top-${x.top}-left-${x.left}`)).size
            if (bite) {
                alert('GAME OVER: 💀 te mordiste la cola!')
                snake.viewContainer.style.background = 'red'
                snake.isDead = true
                boardConfig.gameOver = true
                gameOverlay.style.display = 'flex'
            }
        },
        isDead: false,
        viewContainer: document.querySelector('.snake'),
        growTail: (id, coords) => {
            const tailPart = document.createElement(`div`)
            tailPart.setAttribute('id', `tail-${id}`)
            tailPart.className = 'snake-tail'
            tailPart.style.height = `${boardConfig.movementRatePixels}px`
            tailPart.style.width = `${boardConfig.movementRatePixels}px`
            snake.viewContainer.parentNode.appendChild(tailPart)
            if (coords) {
                snake.tail.push({ id, coords })
            }
        },
        moveTail: (newCoord) => {
            snake.tail = snake.tail.map(x => {
                return { ...x, coords: newCoord }
            })

            snake.tail.forEach((tail, key) => {
                const tailPart = document.getElementById(`tail-${tail.id}`)
                if (tailPart) {
                    tailPart.style.position = 'absolute'
                    tailPart.style.top = `${snake.pathCoords[key].top}px`
                    tailPart.style.left = `${snake.pathCoords[key].left}px`
                    tailPart.style.background = 'rebeccapurple'
                }
            })
        },
        resetSnake: () => {
            const deadSnakeParts = document.querySelectorAll('.board .snake-tail')
            if (deadSnakeParts) {
                deadSnakeParts.forEach((part) => {
                    part.remove()
                })
            }
            snake.isDead = false
            snake.tail = []
            snake.currentPosition = { left: 200, top: 200 }
            snake.pathCoords = []
            snake.growTail(boardConfig.eatenFood, { left: snake.currentPosition.left, top: snake.currentPosition.top })
        }
    }

    snake.viewContainer.style.height = `${boardConfig.movementRatePixels}px`
    snake.viewContainer.style.width = `${boardConfig.movementRatePixels}px`

    const coordsView = document.querySelector('.coords')
    const configView = document.querySelector('.config')
    configView.innerHTML = `${boardConfig.dimensions.x} x ${boardConfig.dimensions.y}`

    snake.viewContainer.style['left'] = `${snake.currentPosition['left']}px`
    snake.viewContainer.style['top'] = `${snake.currentPosition['top']}px`

    const gameOverlay = document.querySelector('.game-overlay');
    gameOverlay.style.width = `${boardConfig.dimensions.x}px`
    gameOverlay.style.height = `${boardConfig.dimensions.y}px`
    const startButton = gameOverlay.querySelector('.start-button')

    startButton.addEventListener('click', () => {
        gameOverlay.style.display = 'none'
        boardConfig.resetGame()
        snake.resetSnake()
        boardConfig.initGame()
    }, false)

    document.addEventListener('keypress', (e) => {
        if (e.code === 'Enter') {
            gameOverlay.style.display = 'none'
            boardConfig.resetGame()
            snake.resetSnake()
            boardConfig.initGame()
        }
    }, false)
}

SnakeGame()