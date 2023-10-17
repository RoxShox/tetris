export default class Controller {
	constructor(game, view) {
		this.game = game
		this.view = view
		this.intervalId = null
		this.isPlaying = false

		document.addEventListener("keydown", this.handleKeyDown.bind(this))
		document.addEventListener("keyup", this.handleKeyUp.bind(this))

		this.view.renderStartScreen()
	}

	update() {
		this.game.movePieceDown()
		this.updateView()
	}
	play() {
		this.isPlaying = true
		this.startInterval()
		this.updateView()
	}
	pause() {
		this.isPlaying = false
		this.stopInterval()
		this.updateView()
	}
	reset() {
		this.game.reset()
		this.play()
	}
	updateView() {
		const state = this.game.getState()
		if (state.isGameOver) {
			this.view.renderEndScreen(state)
		} else if (this.isPlaying) {
			this.view.renderMainScreen(state)
		} else {
			this.view.renderPauseScreen()
		}
	}
	startInterval() {
		const speed = 1000 - this.game.getState().level * 100
		if (!this.intervalId) {
			this.intervalId = setInterval(
				() => {
					this.update()
				},
				speed > 0 ? speed : 100
			)
		}
	}
	stopInterval() {
		if (this.intervalId) {
			clearInterval(this.intervalId)
			this.intervalId = null
		}
	}

	handleKeyDown(e) {
		const state = this.game.getState()
		switch (e.code) {
			case "Enter":
				if (state.isGameOver) {
					this.reset()
				} else if (this.isPlaying) {
					this.pause()
				} else {
					this.play()
				}
				return
			case "ArrowDown":
				this.stopInterval()
				this.game.movePieceDown()
				this.updateView()
				return
			case "ArrowLeft":
				this.game.movePieceLeft()
				this.updateView()
				return
			case "ArrowRight":
				this.game.movePieceRight()
				this.view.renderMainScreen(this.game.getState())
				return
			case "ArrowUp":
				this.game.rotatePiece()
				this.updateView()
		}
	}
	handleKeyUp(e) {
		switch (e.code) {
			case "ArrowDown":
				this.startInterval()
				return
		}
	}
}
