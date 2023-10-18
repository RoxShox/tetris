export default class Game {
	static points = {
		1: 40,
		2: 100,
		3: 300,
		4: 1200,
	}
	constructor() {
		this.reset()
	}

	get level() {
		return Math.floor(this.lines * 0.1)
	}
	//  получаем текущее поле с фигурами
	getState() {
		const playfield = this.createPlayfield()
		const { x: pieceX, y: pieceY, blocks } = this.activePiece
		for (let y = 0; y < this.playField.length; y++) {
			playfield[y] = []
			for (let x = 0; x < this.playField[y].length; x++) {
				playfield[y][x] = this.playField[y][x]
			}
		}

		for (let y = 0; y < blocks.length; y++) {
			for (let x = 0; x < blocks[y].length; x++) {
				if (blocks[y][x]) {
					playfield[pieceY + y][pieceX + x] = blocks[y][x]
				}
			}
		}

		return {
			playfield,
			level: this.level,
			lines: this.lines,
			score: this.score,
			nextPiece: this.nextPiece,
			isGameOver: this.topOut,
		}
	}
	reset() {
		this.score = 0
		this.lines = 0
		this.topOut = false
		this.playField = this.createPlayfield()
		this.activePiece = this.createPiece()
		this.nextPiece = this.createPiece()
	}
	// Создаём поле для фигур
	createPlayfield() {
		const playfield = []
		for (let y = 0; y < 20; y++) {
			playfield[y] = []
			for (let x = 0; x < 10; x++) {
				playfield[y][x] = 0
			}
		}
		return playfield
	}
	// Создаем фигуры
	createPiece() {
		const index = Math.floor(Math.random() * 7)
		const type = "IJLOSTZ"[index]
		const piece = {}
		switch (type) {
			case "I":
				piece.blocks = [
					[0, 0, 0, 0],
					[1, 1, 1, 1],
					[0, 0, 0, 0],
					[0, 0, 0, 0],
				]
				break
			case "J":
				piece.blocks = [
					[0, 0, 0],
					[2, 2, 2],
					[0, 0, 2],
				]
				break
			case "L":
				piece.blocks = [
					[0, 0, 0],
					[3, 3, 3],
					[3, 0, 0],
				]
				break
			case "O":
				piece.blocks = [
					[0, 0, 0, 0],
					[0, 4, 4, 0],
					[0, 4, 4, 0],
					[0, 0, 0, 0],
				]
				break
			case "S":
				piece.blocks = [
					[0, 0, 0],
					[0, 5, 5],
					[5, 5, 0],
				]
				break
			case "T":
				piece.blocks = [
					[0, 0, 0],
					[6, 6, 6],
					[0, 6, 0],
				]
				break
			case "Z":
				piece.blocks = [
					[0, 0, 0],
					[7, 7, 0],
					[0, 7, 7],
				]
				break
			default:
				throw new Error("Неизвестный тип фигур")
		}
		piece.x = Math.floor((10 - piece.blocks[0].length) / 2)
		piece.y = -1
		return piece
	}
	// движение фигуры влево
	movePieceLeft() {
		this.activePiece.x -= 1
		if (this.hasCollision()) {
			this.activePiece.x += 1
		}
	}
	// движение фигуры вправо
	movePieceRight() {
		this.activePiece.x += 1
		if (this.hasCollision()) {
			this.activePiece.x -= 1
		}
	}
	// движение фигуры вниз
	movePieceDown() {
		if (this.topOut) return

		this.activePiece.y += 1
		if (this.hasCollision()) {
			this.activePiece.y -= 1
			this.lockPiece()
			const clearedLines = this.clearLines()
			this.updateScore(clearedLines)
			this.updatePieces()
		}
		if (this.hasCollision()) {
			this.topOut = true
		}
	}
	// Делаем rotate фигуры
	rotatePiece() {
		this.rotateBlocks()

		if (this.hasCollision()) {
			this.rotateBlocks(false)
		}
	}
	// логика rotate
	rotateBlocks(clockwise = true) {
		const blocks = this.activePiece.blocks
		const length = blocks.length
		const x = Math.floor(length / 2)
		const y = length - 1

		for (let i = 0; i < x; i++) {
			for (let j = i; j < y - i; j++) {
				const temp = blocks[i][j]
				if (clockwise) {
					blocks[i][j] = blocks[y - j][i]
					blocks[y - j][i] = blocks[y - i][y - j]
					blocks[y - i][y - j] = blocks[j][y - i]
					blocks[j][y - i] = temp
				} else {
					blocks[i][j] = blocks[j][y - i]
					blocks[j][y - i] = blocks[y - i][y - j]
					blocks[y - i][y - j] = blocks[y - j][i]
					blocks[y - j][i] = temp
				}
			}
		}
	}
	// Проверка на столкновение с фигурами или выходы за пределы поля
	hasCollision() {
		const { x: pieceX, y: pieceY, blocks } = this.activePiece
		const playField = this.playField
		for (let y = 0; y < blocks.length; y++) {
			for (let x = 0; x < blocks[y].length; x++) {
				if (
					blocks[y][x] &&
					(playField[pieceY + y] === undefined ||
						playField[pieceY + y][pieceX + x] === undefined ||
						playField[pieceY + y][pieceX + x])
				) {
					return true
				}
			}
		}

		return false
	}
	// Блокировка фигуры
	lockPiece() {
		const { x: pieceX, y: pieceY, blocks } = this.activePiece

		for (let y = 0; y < blocks.length; y++) {
			for (let x = 0; x < blocks[y].length; x++) {
				if (blocks[y][x] !== 0) {
					this.playField[pieceY + y][pieceX + x] = blocks[y][x]
				}
			}
		}
	}
	clearLines() {
		const rows = 20
		const columns = 10
		let lines = []
		for (let y = rows - 1; y >= 0; y--) {
			let numberOfBlocks = 0
			for (let x = 0; x < columns; x++) {
				if (this.playField[y][x]) {
					numberOfBlocks += 1
				}
			}
			if (numberOfBlocks === 0) {
				break
			} else if (numberOfBlocks < columns) {
				continue
			} else if (numberOfBlocks === columns) {
				lines.unshift(y)
			}
		}
		for (let i of lines) {
			this.playField.splice(i, 1)
			this.playField.unshift(new Array(columns).fill(0))
		}

		return lines.length
	}
	updateScore(clearedLines) {
		if (clearedLines > 0) {
			this.score += Game.points[clearedLines] * (this.level + 1)
			this.lines += clearedLines
		}
	}
	updatePieces() {
		this.activePiece = this.nextPiece
		this.nextPiece = this.createPiece()
	}
}
