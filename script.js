class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scores = { X: 0, O: 0 };
        
        this.cells = document.querySelectorAll('.cell');
        this.gameMessage = document.getElementById('game-message');
        this.resetBtn = document.getElementById('reset-btn');
        this.resetScoreBtn = document.getElementById('reset-score-btn');
        this.playerXScore = document.getElementById('player-x-score');
        this.playerOScore = document.getElementById('player-o-score');
        
        this.winningCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        
        this.init();
    }
    
    init() {
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
            cell.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleCellClick(index)
            });
        });
        
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.resetScoreBtn.addEventListener('click', () => this.resetScore());
        
        this.updateScoreDisplay();
        this.updateGameMessage();
    }
    
    handleCellClick(index) {
        if (!this.gameActive || this.board[index] !== '') {
            return;
        }
        
        this.makeMove(index);
        this.checkGameStatus();
    }
    
    makeMove(index) {
        this.board[index] = this.currentPlayer;
        const cell = this.cells[index];
        
        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());
        
        // Add a small delay to make the animation more noticeable
        setTimeout(() => {
            cell.style.transform = 'scale(1)';
        }, 100);
    }
    
    checkGameStatus() {
        const winner = this.checkWinner();
        
        if (winner) {
            this.gameActive = false;
            this.scores[winner]++;
            this.updateScoreDisplay();
            this.highlightWinningCells(winner);
            this.updateGameMessage(`🎉 Player ${winner} wins!`);
            
            // Celebrate with a small delay
            setTimeout(() => {
                this.showWinAnimation();
            }, 500);
            
        } else if (this.board.every(cell => cell !== '')) {
            this.gameActive = false;
            this.updateGameMessage("🤝 It's a draw!");
        } else {
            this.switchPlayer();
            this.updateGameMessage();
        }
    }
    
    checkWinner() {
        for (let combination of this.winningCombinations) {
            const [a, b, c] = combination;
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                this.winningCombination = combination;
                return this.board[a];
            }
        }
        return null;
    }
    
    highlightWinningCells(winner) {
        if (this.winningCombination) {
            this.winningCombination.forEach(index => {
                this.cells[index].classList.add('winning');
            });
        }
    }
    
    showWinAnimation() {
        const container = document.querySelector('.container');
        container.style.animation = 'pulse 0.3s ease-in-out';
        
        setTimeout(() => {
            container.style.animation = '';
        }, 300);
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }
    
    updateGameMessage(message = null) {
        if (message) {
            this.gameMessage.textContent = message;
        } else {
            this.gameMessage.textContent = `Player ${this.currentPlayer}'s turn`;
        }
    }
    
    updateScoreDisplay() {
        this.playerXScore.textContent = this.scores.X;
        this.playerOScore.textContent = this.scores.O;
    }
    
    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.winningCombination = null;
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
            cell.style.transform = '';
        });
        
        this.updateGameMessage();
        
        // Add a nice reset animation
        document.querySelector('.game-board').style.animation = 'popIn 0.3s ease-out';
        setTimeout(() => {
            document.querySelector('.game-board').style.animation = '';
        }, 300);
    }
    
    resetScore() {
        this.scores = { X: 0, O: 0 };
        this.updateScoreDisplay();
        
        // Visual feedback for score reset
        const scoreBoard = document.querySelector('.score-board');
        scoreBoard.style.animation = 'popIn 0.3s ease-out';
        setTimeout(() => {
            scoreBoard.style.animation = '';
        }, 300);
    }
}

// Enhanced touch support for mobile devices
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the game
    const game = new TicTacToe();
    
    // Add touch event optimization
    document.addEventListener('touchstart', function() {}, { passive: true });
    
    // Prevent zoom on double tap for game cells
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('touchend', function(e) {
            e.preventDefault();
        });
    });
    
    // Add keyboard support for accessibility
    document.addEventListener('keydown', (e) => {
        if (e.key >= '1' && e.key <= '9') {
            const index = parseInt(e.key) - 1;
            if (game.gameActive && game.board[index] === '') {
                game.handleCellClick(index);
            }
        }
        
        if (e.key === 'r' || e.key === 'R') {
            game.resetGame();
        }
    });
    
    // Add visual feedback for button presses
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
});

// Add some fun sound effects (optional - can be enabled by uncommenting)
/*
class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.initAudio();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    playTone(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playMove() {
        this.playTone(440, 0.1);
    }
    
    playWin() {
        this.playTone(523, 0.3);
        setTimeout(() => this.playTone(659, 0.3), 150);
        setTimeout(() => this.playTone(784, 0.5), 300);
    }
    
    playDraw() {
        this.playTone(330, 0.5);
    }
}

// Uncomment to enable sound effects
// const sounds = new SoundEffects();
*/
