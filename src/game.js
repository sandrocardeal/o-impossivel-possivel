// src/game.js
import { ui } from './ui.js';
import { trollMechanics } from './troll-mechanics.js';

class TrollGame {
    constructor() {
        this.score = 0;
        this.attempts = 0;
        this.level = 1;
        this.gameRunning = false;
        this.playerPosition = { x: 50, y: 250 };
        this.obstacles = [];
        this.collectibles = [];
        this.achievements = [];
        this.audioContext = null;
        this.sounds = {};
        this.fakeMultiplayerActive = false;
        this.invisibleWall = null;
        this.player = null;
        this.gameArea = null;
        this.playerTrailPool = [];
        this.explosionParticlePool = [];
        this.poolSize = 30;
        this.lives = 3; 

        this.init();
    }

    init() {
        this.setupElements();
        this.setupAudio();
        this.setupEventListeners();
        ui.showTrollMessage("Prepare-se para a frustração suprema! 😈");
        this.startTrollTimer();
        trollMechanics.setupTrollButtons();
    }

    setupAudio() {
        try {
            document.addEventListener('click', () => {
                if (!this.audioContext) {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    this.createSounds();
                }
            }, { once: true });
        } catch (e) {
            console.log("Audio não suportado:", e);
        }
    }

    createSounds() {
        if (!this.audioContext) return;
        this.sounds.error = () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);
        };
        this.sounds.collect = () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
        this.sounds.sarcastic = () => {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.1);
                }, i * 150);
            }
        };
    }

    setupElements() {
        this.player = document.getElementById('player');
        this.gameArea = document.getElementById('gameArea');
        this.invisibleWall = document.getElementById('invisibleWall');
        ui.init();
        trollMechanics.setupSettingsListeners(this);
        this.updatePlayerPosition();
        this.createObjectPools();
    }

    createObjectPools() {
        for (let i = 0; i < this.poolSize; i++) {
            const trail = document.createElement('div');
            trail.className = 'player-trail';
            this.gameArea.appendChild(trail);
            this.playerTrailPool.push(trail);

            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            this.gameArea.appendChild(particle);
            this.explosionParticlePool.push(particle);
        }
    }

    setupEventListeners() {
        document.getElementById('leftBtn').addEventListener('click', () => this.movePlayer('left'));
        document.getElementById('rightBtn').addEventListener('click', () => this.movePlayer('right'));
        document.getElementById('upBtn').addEventListener('click', () => this.movePlayer('up'));
        document.getElementById('downBtn').addEventListener('click', () => this.movePlayer('down'));

        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());

        this.addTrollButtons();
        document.getElementById('fakeRestartBtn').addEventListener('click', () => ui.showRealGameOver());
        document.getElementById('realRestartBtn').addEventListener('click', () => this.restartGame());

        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.addEventListener('mousemove', (e) => trollMechanics.updateFakeCursor(e));

        document.addEventListener('keydown', (e) => {
            if (e.code === 'F12' || (e.altKey && e.key === 'F4')) {
                e.preventDefault();
                ui.showTrollMessage("Tentativa patética de trapacear! 😂");
            }
        });
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            ui.showTrollMessage("Clique direito? Não funciona aqui! 😂");
        });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.gameRunning) {
                ui.showTrollMessage("Fugindo do jogo? Que covarde! 🏃‍♂️");
            } else if (!document.hidden) {
                ui.showTrollMessage("Voltou? O jogo sentiu sua falta... NÃO! 😈");
            }
        });
        document.addEventListener('copy', () => ui.showTrollMessage("Copiando o quê? Sua vergonha? 📋😂"));
        document.addEventListener('paste', () => ui.showTrollMessage("Colando trapaças? Não vai funcionar! 📋❌"));
    }

    addTrollButtons() {
        const actionButtons = document.querySelector('.action-buttons');
        if (document.getElementById('quitBtn')) return;

        const quitBtn = document.createElement('button');
        quitBtn.className = 'action-btn';
        quitBtn.id = 'quitBtn';
        quitBtn.textContent = 'DESISTIR';
        quitBtn.addEventListener('click', () => trollMechanics.fakeQuit(this));
        actionButtons.appendChild(quitBtn);

        const easyBtn = document.createElement('button');
        easyBtn.className = 'action-btn';
        easyBtn.id = 'easyBtn';
        easyBtn.textContent = 'MODO FÁCIL';
        easyBtn.addEventListener('click', () => trollMechanics.activateEasyMode(this));
        actionButtons.appendChild(easyBtn);

        const saveBtn = document.createElement('button');
        saveBtn.className = 'action-btn';
        saveBtn.id = 'saveBtn';
        saveBtn.textContent = 'SALVAR';
        saveBtn.addEventListener('click', () => trollMechanics.fakeSave(this));
        actionButtons.appendChild(saveBtn);

        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'action-btn';
        settingsBtn.id = 'settingsBtn';
        settingsBtn.textContent = '⚙️';
        settingsBtn.addEventListener('click', () => trollMechanics.toggleSettings());
        actionButtons.appendChild(settingsBtn);

        const rankingBtn = document.createElement('button');
        rankingBtn.className = 'action-btn';
        rankingBtn.id = 'rankingBtn';
        rankingBtn.textContent = '🏆';
        rankingBtn.addEventListener('click', () => trollMechanics.toggleFakeRanking(this.score));
        actionButtons.appendChild(rankingBtn);
    }

    handleKeyPress(e) {
        if (!this.gameRunning || trollMechanics.controlsFrozen) return;
        const key = e.key.toLowerCase();
        const direction = {
            'arrowleft': 'left', 'a': 'left',
            'arrowright': 'right', 'd': 'right',
            'arrowup': 'up', 'w': 'up',
            'arrowdown': 'down', 's': 'down'
        }[key];
        if (direction) this.movePlayer(direction);
    }

    movePlayer(direction) {
        if (!this.gameRunning) return;
        this.createPlayerTrail();
        let speed = 20;
        if (trollMechanics.difficultyLevel === 'easy') {
            speed = 15;
        } else if (trollMechanics.difficultyLevel === 'hard') {
            speed = 25;
        }

        const gameAreaRect = this.gameArea.getBoundingClientRect();
        const effectiveDirection = trollMechanics.controlsInverted ? {
            'left': 'right', 'right': 'left', 'up': 'down', 'down': 'up'
        }[direction] : direction;

        switch (effectiveDirection) {
            case 'left':
                this.playerPosition.x = Math.max(0, this.playerPosition.x - speed);
                break;
            case 'right':
                this.playerPosition.x = Math.min(gameAreaRect.width - 30, this.playerPosition.x + speed);
                break;
            case 'up':
                this.playerPosition.y = Math.max(0, this.playerPosition.y - speed);
                break;
            case 'down':
                this.playerPosition.y = Math.min(gameAreaRect.height - 30, this.playerPosition.y + speed);
                break;
        }
        this.updatePlayerPosition();
        this.checkCollisions();
    }

    createPlayerTrail() {
        if (!this.gameArea || this.playerTrailPool.length === 0) return;
        
        const trail = this.playerTrailPool.shift();
        trail.style.left = (this.playerPosition.x + 5) + 'px';
        trail.style.top = (this.playerPosition.y + 5) + 'px';
        trail.style.display = 'block';
        trail.style.opacity = 1;
        
        setTimeout(() => {
            trail.style.opacity = 0;
            trail.style.display = 'none';
            this.playerTrailPool.push(trail);
        }, 500);
    }

    updatePlayerPosition() {
        if (this.player) {
            this.player.style.left = this.playerPosition.x + 'px';
            this.player.style.top = this.playerPosition.y + 'px';
        }
    }

    startGame() {
        this.gameRunning = true;
        this.lives = 3;
        ui.updateLives(this.lives);
        ui.showTrollMessage("Que comece o sofrimento! 🔥");
        this.spawnObstacles();
        this.spawnCollectibles();
        this.gameLoop();
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.textContent = 'JOGANDO...';
            startBtn.disabled = true;
        }
        setTimeout(() => {
            this.fakeMultiplayerActive = true;
            const multiplayer = document.getElementById('fakeMultiplayer');
            if (multiplayer) multiplayer.style.display = 'block';
            ui.showTrollMessage("Jogador MLGPro_2024 entrou na partida! 🎮");
        }, 5000);
    }

    pauseGame() {
        this.gameRunning = !this.gameRunning;
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            if (this.gameRunning) {
                pauseBtn.textContent = 'PAUSAR';
                ui.showTrollMessage("Voltou? Que corajoso... 😈");
                this.gameLoop();
            } else {
                pauseBtn.textContent = 'CONTINUAR';
                ui.showTrollMessage("Desistindo já? Que fraco! 😂");
                ui.showFakeLag();
            }
        }
    }

    gameLoop() {
        if (!this.gameRunning) return;
        this.moveObstacles();
        this.moveCollectibles();
        this.checkCollisions();
        trollMechanics.updateTrollMechanics(this);
        requestAnimationFrame(() => this.gameLoop());
    }

    spawnObstacles() {
        if (!this.gameRunning || !this.gameArea) return;
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        const randomType = Math.random();
        if (randomType < 0.3) {
            obstacle.classList.add('color-changing');
        } else if (randomType < 0.5) {
            obstacle.classList.add('dark-obstacle');
        } else if (randomType < 0.7) {
            obstacle.classList.add('lightning-obstacle');
        }
        const width = 20 + Math.random() * 30;
        const height = 20 + Math.random() * 50;
        obstacle.style.width = width + 'px';
        obstacle.style.height = height + 'px';
        obstacle.style.top = Math.random() * (this.gameArea.offsetHeight - height - 20) + 'px';
        obstacle.style.right = '-50px';
        obstacle.style.position = 'absolute';
        this.gameArea.appendChild(obstacle);
        const baseSpeed = 2 + Math.random() * 3;
        let speedMultiplier = 1;
        if (trollMechanics.difficultyLevel === 'medium') {
            speedMultiplier = 1.5;
        } else if (trollMechanics.difficultyLevel === 'hard') {
            speedMultiplier = 2;
        }
        const speed = trollMechanics.easyModeActive ? baseSpeed * 2 : baseSpeed * speedMultiplier;
        this.obstacles.push({
            element: obstacle,
            x: -50,
            speed: speed
        });
        const delay = Math.max(300, 2000 - (this.level * 100));
        setTimeout(() => this.spawnObstacles(), delay);
    }

    spawnCollectibles() {
        if (!this.gameRunning || !this.gameArea) return;
        
        const isTroll = Math.random() < 0.1;
        const collectible = document.createElement('div');
        collectible.className = 'collectible';
        if (isTroll) {
            collectible.classList.add('troll-collectible');
            collectible.style.background = 'radial-gradient(circle, #ff00ff, #8a2be2)';
        }
        
        collectible.style.position = 'absolute';
        collectible.style.width = '20px';
        collectible.style.height = '20px';
        collectible.style.borderRadius = '50%';
        collectible.style.border = '2px solid #fff';
        collectible.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.9)';
        collectible.style.top = Math.random() * (this.gameArea.offsetHeight - 40) + 'px';
        collectible.style.right = '-30px';
        let fleeing = false;
        if (trollMechanics.difficultyLevel === 'medium' && Math.random() < 0.5) {
            fleeing = true;
        } else if (trollMechanics.difficultyLevel === 'hard' && Math.random() < 0.8) {
            fleeing = true;
        } else if (trollMechanics.easyModeActive) {
            fleeing = true;
        }

        if (fleeing) {
            collectible.classList.add('fleeing');
        }

        this.gameArea.appendChild(collectible);
        this.collectibles.push({
            element: collectible,
            x: -30,
            speed: 1.5 + Math.random() * 2,
            fleeing: fleeing,
            isTroll: isTroll
        });
        setTimeout(() => this.spawnCollectibles(), 3000 + Math.random() * 2000);
    }

    moveObstacles() {
        this.obstacles = this.obstacles.filter(obstacle => {
            if (!obstacle.element) return false;
            obstacle.x += obstacle.speed;
            obstacle.element.style.right = obstacle.x + 'px';
            if (obstacle.x > this.gameArea.offsetWidth + 100) {
                if (obstacle.element.parentNode) {
                    obstacle.element.parentNode.removeChild(obstacle.element);
                }
                return false;
            }
            return true;
        });
    }

    moveCollectibles() {
        this.collectibles = this.collectibles.filter(collectible => {
            if (!collectible.element) return false;
            if (collectible.fleeing && this.player) {
                const playerRect = this.player.getBoundingClientRect();
                const collectibleRect = collectible.element.getBoundingClientRect();
                const distance = Math.sqrt(
                    Math.pow(playerRect.left - collectibleRect.left, 2) +
                    Math.pow(playerRect.top - collectibleRect.top, 2)
                );
                if (distance < 100) {
                    collectible.speed *= 1.5;
                    const currentTop = parseInt(collectible.element.style.top);
                    collectible.element.style.top = Math.max(0, Math.min(
                        this.gameArea.offsetHeight - 40,
                        currentTop + (Math.random() - 0.5) * 60
                    )) + 'px';
                }
            }
            collectible.x += collectible.speed;
            collectible.element.style.right = collectible.x + 'px';
            if (collectible.x > this.gameArea.offsetWidth + 50) {
                if (collectible.element.parentNode) {
                    collectible.element.parentNode.removeChild(collectible.element);
                }
                return false;
            }
            return true;
        });
    }

    checkCollisions() {
        if (!this.player) return;
        const playerRect = this.player.getBoundingClientRect();
        this.obstacles.forEach(obstacle => {
            if (!obstacle.element) return;
            const obstacleRect = obstacle.element.getBoundingClientRect();
            if (this.isColliding(playerRect, obstacleRect)) {
                if (obstacle.element.classList.contains('dark-obstacle')) {
                    trollMechanics.toggleDarkMode(true);
                    setTimeout(() => trollMechanics.toggleDarkMode(false), 3000);
                    obstacle.element.parentNode.removeChild(obstacle.element);
                    this.obstacles = this.obstacles.filter(o => o !== obstacle);
                    return;
                }
                if (obstacle.element.classList.contains('lightning-obstacle')) {
                    document.body.classList.add('screen-shake');
                    setTimeout(() => document.body.classList.remove('screen-shake'), 500);
                    obstacle.element.parentNode.removeChild(obstacle.element);
                    this.obstacles = this.obstacles.filter(o => o !== obstacle);
                    return;
                }
                this.handlePlayerDeath();
            }
        });
        this.collectibles = this.collectibles.filter(collectible => {
            if (!collectible.element) return false;
            const collectibleRect = collectible.element.getBoundingClientRect();
            if (this.isColliding(playerRect, collectibleRect)) {
                if (collectible.element.parentNode) {
                    collectible.element.parentNode.removeChild(collectible.element);
                }
                this.collectPoint(collectible.isTroll);
                return false;
            }
            return true;
        });
        if (this.invisibleWall) {
            const wallRect = this.invisibleWall.getBoundingClientRect();
            if (this.isColliding(playerRect, wallRect) && Math.random() < 0.15) {
                this.revealInvisibleWall();
                ui.showTrollMessage("PAREDE INVISÍVEL! Que azar! 😂");
                this.handlePlayerDeath();
            }
        }
    }

    isColliding(rect1, rect2) {
        return rect1.left < rect2.right && rect1.right > rect2.left && rect1.top < rect2.bottom && rect1.bottom > rect2.top;
    }

    collectPoint(isTroll) {
        if (isTroll) {
            this.score = Math.max(0, this.score - 20);
            if (this.sounds.error) this.sounds.error();
            ui.showTrollMessage("Era uma armadilha! Você perdeu pontos! 😂");
            if (Math.random() < 0.5) trollMechanics.toggleControlsInversion(this.player);
        } else {
            this.score += 10;
            if (this.sounds.collect) this.sounds.collect();
            const trollMessages = ["Finalmente! Já tava pensando que era impossível para você.", "Não se acostume, foi sorte de principiante."];
            ui.showTrollMessage(trollMessages[Math.floor(Math.random() * trollMessages.length)]);
        }
        ui.updateUI(this.score, this.attempts, this.level);
        if (this.score % 100 === 0) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        ui.updateUI(this.score, this.attempts, this.level);
        ui.showTrollMessage(`Nível ${this.level}! Agora fica mais difícil! 😈`);
        if (this.level === 5) ui.showFakeCountdown();
        if (this.level === 10) this.activateUltimateMode();
    }

    activateUltimateMode() {
        ui.showTrollMessage("MODO SUPREMO ATIVADO! Boa sorte... vai precisar! 💀");
        trollMechanics.toggleControlsInversion(this.player);
        this.obstacles.forEach(obs => obs.speed *= 2);
        this.collectibles.forEach(col => {
            col.speed *= 2;
            if (col.element) col.element.classList.add('fleeing');
            col.fleeing = true;
        });
    }

    handlePlayerDeath() {
        if (this.lives > 1) {
            this.lives--;
            ui.updateLives(this.lives);
            ui.showTrollMessage("Perdeu uma vida... que pena! 💔");
            if (this.sounds.error) this.sounds.error();
        } else {
            this.gameOver();
        }
    }

    gameOver() {
        this.gameRunning = false;
        this.attempts++;
        ui.updateUI(this.score, this.attempts, this.level);
        this.obstacles.forEach(obs => obs.element?.parentNode?.removeChild(obs.element));
        this.collectibles.forEach(col => col.element?.parentNode?.removeChild(col.element));
        this.obstacles = [];
        this.collectibles = [];
        this.playerPosition = { x: 50, y: 250 };
        this.updatePlayerPosition();
        this.createExplosion();
        this.fakeMultiplayerActive = false;
        const multiplayer = document.getElementById('fakeMultiplayer');
        if (multiplayer) multiplayer.style.display = 'none';
        ui.showFakeGameOver(this.score);
        trollMechanics.checkDeathAchievements(this.attempts, this.achievements);
        document.body.classList.add('glitch-effect');
        setTimeout(() => document.body.classList.remove('glitch-effect'), 500);
    }

    createExplosion() {
        if (!this.gameArea || this.explosionParticlePool.length === 0) return;
        for (let i = 0; i < 12 && this.explosionParticlePool.length > 0; i++) {
            const particle = this.explosionParticlePool.shift();
            particle.style.left = (this.playerPosition.x + 15) + 'px';
            particle.style.top = (this.playerPosition.y + 15) + 'px';
            particle.style.display = 'block';
            const angle = (Math.PI * 2 * i) / 12;
            const distance = 100 + Math.random() * 50;
            const newX = parseFloat(particle.style.left) + Math.cos(angle) * distance;
            const newY = parseFloat(particle.style.top) + Math.sin(angle) * distance;
            particle.style.transition = 'transform 1s ease-out, opacity 1s ease-out';
            particle.style.transform = `translate(${newX}px, ${newY}px) scale(0.3)`;
            particle.style.opacity = 0;
            setTimeout(() => {
                particle.style.transition = 'none';
                particle.style.display = 'none';
                this.explosionParticlePool.push(particle);
            }, 1000);
        }
    }

    revealInvisibleWall() {
        if (this.invisibleWall) {
            this.invisibleWall.classList.add('revealed');
            setTimeout(() => this.invisibleWall.classList.remove('revealed'), 200);
        }
    }

    restartGame() {
        ui.realGameOver.style.display = 'none';
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        ui.updateUI(this.score, this.attempts, this.level);
        ui.updateLives(this.lives);
        trollMechanics.controlsInverted = false;
        trollMechanics.easyModeActive = false;
        if (this.player) this.player.classList.remove('inverted');
        document.body.classList.remove('inverted-controls');
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.textContent = 'COMEÇAR';
            startBtn.disabled = false;
        }
        ui.showTrollMessage("De volta para mais sofrimento? Que dedicação! 😂");
    }

    resetGame() {
        this.score = 0;
        this.level = 1;
        this.attempts = 0;
        this.gameRunning = false;
        this.playerPosition = { x: 50, y: 250 };
        this.obstacles = [];
        this.collectibles = [];
        this.lives = 3;
        
        const obstaclesContainer = document.getElementById('obstacles');
        if (obstaclesContainer) obstaclesContainer.innerHTML = '';
        const collectiblesContainer = document.getElementById('collectibles');
        if (collectiblesContainer) collectiblesContainer.innerHTML = '';

        this.updatePlayerPosition();
        ui.updateUI(this.score, this.attempts, this.level);
        ui.updateLives(this.lives);
        ui.showTrollMessage("Progresso 'salvo' com sucesso! (Não mesmo!) 💾❌");

        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.textContent = 'COMEÇAR';
            startBtn.disabled = false;
        }
    }

    startTrollTimer() {
        setInterval(() => {
            if (!this.gameRunning) return;
            if (Math.random() < 0.15) {
                const motivationalTrolls = [
                    "Você ainda está tentando? Que fofo! 🥺",
                    "Lembra: a desistência é sempre uma opção! 🚪",
                    "Seus pais devem estar tão orgulhosos... 😬"
                ];
                const message = motivationalTrolls[Math.floor(Math.random() * motivationalTrolls.length)];
                ui.showTrollMessage(message);
            }
        }, 6000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Inicializando jogo...");
    window.game = new TrollGame();
});