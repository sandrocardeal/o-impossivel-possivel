// src/ui.js
export const ui = {
    // Referências aos elementos da interface
    scoreElement: document.getElementById('score'),
    attemptsElement: document.getElementById('attempts'),
    levelElement: document.getElementById('level'),
    livesElement: document.getElementById('lives'),
    messageBubble: document.getElementById('messageBubble'),
    fakeGameOver: document.getElementById('fakeGameOver'),
    realGameOver: document.getElementById('realGameOver'),
    achievementPopup: document.getElementById('achievementPopup'),
    fakeLag: null,
    countdownPopup: null,
    settingsPanel: null,
    fakeMultiplayer: null,
    fakeRanking: null,
    fakeCursor: null,

    // Câmera de mensagens troll
    trollMessages: [
        "Você bateu? Sério? Deixa de ser ruim, cara!",
        "Minha avó joga melhor que você... e ela não tem braços.",
        "Até uma lesma se move mais rápido. E ela não tem pernas.",
        "O problema é o jogo ou a sua falta de talento?",
        "Parabéns! Você descobriu como perder! 🎉",
        "Isso não foi nem perto...",
        "Você está tentando perder de propósito?",
        "Impressionante... impressionantemente ruim.",
        "Talvez seja hora de uma pausa... permanente?",
        "Seus reflexos são mais lentos que internet discada.",
        "Isso foi doloroso de assistir.",
        "Você consegue ser pior que isso?",
        "Spoiler: sim, você consegue ser pior.",
        "Que performance... lamentável! 💀",
        "Você jogou isso com os pés?",
        "Até meu cachorro joga melhor!",
        "Isso foi um desastre épico! 🔥",
        "Você está fazendo isso de propósito?",
        "O que você está fazendo? O jogo não precisa de permissão.",
        "O jogo sentiu sua falta... mas é para você continuar jogando, não é para você morrer!",
        "Não adianta tentar trapacear! Eu sou o rei do jogo, você é apenas um plebeu.",
        "Efeitos especiais? Que nada, é só a sua tela que tá ficando velha.",
        "Eu não entendo... você quer mesmo ser um fracasso?"
    ],

    // Mensagens de ajuda falsas
    helpMessages: [
        "DICA: Não clique nos obstáculos! 🤯",
        "DICA AVANÇADA: Mova-se para não morrer!",
        "DICA PRO: Git gud.",
        "DICA SECRETA: Talvez o problema seja você...",
        "DICA FINAL: Desista enquanto ainda tem dignidade.",
        "DICA INÚTIL: Pressione Alt+F4 para super velocidade!",
        "DICA FALSA: Feche os olhos para jogar melhor!",
        "DICA TROLL: O jogo fica mais fácil se você gritar!"
    ],

    // Ranking fake para a trollagem
    fakeRankingData: [
        "1. ProGamer2024 - 999,999 pts",
        "2. MLGMaster - 888,888 pts",
        "3. GameLord - 777,777 pts",
        "4. SkillGod - 666,666 pts",
        "5. ElitePlayer - 555,555 pts",
        "...",
        "999,999. Você - "
    ],

    // Funções de inicialização da UI
    init() {
        this.createDynamicElements();
        console.log("UI configurada!");
    },

    createDynamicElements() {
        // Criar elementos adicionais dinamicamente
        this.fakeLag = this.createElement('div', 'fake-lag', 'fakeLag', '<div>CONEXÃO PERDIDA...<br>RECONECTANDO...</div>');
        this.countdownPopup = this.createElement('div', 'countdown-popup', 'countdownPopup', '3');
        this.settingsPanel = this.createElement('div', 'settings-panel', 'settingsPanel', `
            <h3>⚙️ CONFIGURAÇÕES</h3>
            <div class="setting-item">
                <span>Volume:</span>
                <input type="range" min="0" max="100" value="50" id="volumeSlider">
            </div>
            <div class="setting-item">
                <span>Dificuldade:</span>
                <select id="difficultySelect">
                    <option value="easy">Fácil</option>
                    <option value="normal" selected>Normal</option>
                    <option value="hard">Difícil</option>
                </select>
            </div>
            <div class="setting-item">
                <span>Modo Escuro:</span>
                <input type="checkbox" id="darkModeCheck">
            </div>
            <div class="setting-item">
                <span>Modo Daltonismo:</span>
                <input type="checkbox" id="colorBlindCheck">
            </div>
        `);
        this.fakeMultiplayer = this.createElement('div', 'fake-multiplayer', 'fakeMultiplayer');
        this.fakeRanking = this.createElement('div', 'fake-ranking', 'fakeRanking');
        this.fakeCursor = this.createElement('div', 'fake-cursor', 'fakeCursor');
    },

    createElement(tag, className, id, innerHTML = '') {
        let element = document.getElementById(id);
        if (!element) {
            element = document.createElement(tag);
            element.className = className;
            element.id = id;
            if (innerHTML) {
                element.innerHTML = innerHTML;
            }
            element.style.display = 'none';
            document.body.appendChild(element);
        }
        return element;
    },

    // Funções de exibição de mensagens e pop-ups
    showTrollMessage(message, duration = 4000) {
        if (this.messageBubble) {
            this.messageBubble.textContent = message;
            this.messageBubble.style.display = 'block';
            setTimeout(() => {
                this.messageBubble.style.display = 'none';
            }, duration);
        }
        console.log("Troll Message:", message);
    },

    showFakeHelp() {
        const helpMessage = this.helpMessages[Math.floor(Math.random() * this.helpMessages.length)];
        this.showTrollMessage(helpMessage);
    },

    showFakeGameOver(score) {
        const randomTrollMessage = this.trollMessages[Math.floor(Math.random() * this.trollMessages.length)];
        if (this.fakeGameOver) {
            const p = this.fakeGameOver.querySelector('p');
            if (p) p.textContent = randomTrollMessage;
            this.fakeGameOver.style.display = 'block';
        }
        document.body.classList.add('screen-shake');
        setTimeout(() => document.body.classList.remove('screen-shake'), 500);
    },

    showRealGameOver() {
        if (this.fakeGameOver) this.fakeGameOver.style.display = 'none';
        if (this.realGameOver) this.realGameOver.style.display = 'block';
        document.body.classList.add('glitch-effect');
        setTimeout(() => document.body.classList.remove('glitch-effect'), 300);
    },

    showAchievement(title, description, achievementsList) {
        if (achievementsList.includes(title)) return;
        achievementsList.push(title);
        if (this.achievementPopup) {
            const h3 = this.achievementPopup.querySelector('h3');
            const p = document.getElementById('achievementText');
            if (h3) h3.textContent = title;
            if (p) p.textContent = description;
            this.achievementPopup.style.display = 'block';
            setTimeout(() => {
                this.achievementPopup.style.display = 'none';
            }, 5000);
        }
    },

    showFakeLag() {
        if (this.fakeLag) {
            this.fakeLag.style.display = 'flex';
        }
    },

    hideFakeLag() {
        if (this.fakeLag) {
            this.fakeLag.style.display = 'none';
        }
    },

    showFakeCountdown() {
        if (!this.countdownPopup) return;
        this.countdownPopup.style.display = 'block';
        let count = 3;
        const countInterval = setInterval(() => {
            this.countdownPopup.textContent = count;
            count--;
            if (count < 0) {
                clearInterval(countInterval);
                this.countdownPopup.textContent = 'SÓ BRINCANDO! 😂';
                setTimeout(() => {
                    this.countdownPopup.style.display = 'none';
                    this.showTrollMessage("Achou que ia ter uma última chance? Que inocente! 😈");
                }, 2000);
            }
        }, 1000);
    },

    updateUI(score, attempts, level) {
        if (this.scoreElement) this.scoreElement.textContent = score;
        if (this.attemptsElement) this.attemptsElement.textContent = attempts;
        if (this.levelElement) this.levelElement.textContent = level;
    },

    updateLives(lives) {
        if (this.livesElement) {
            this.livesElement.textContent = '♥♥♥'.slice(0, lives);
        }
    },
};