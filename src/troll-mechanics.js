// src/troll-mechanics.js
import { ui } from './ui.js';

export const trollMechanics = {
    lastTrollTime: 0,
    controlsInverted: false,
    controlsFrozen: false,
    easyModeActive: false,
    fakeLagActive: false,
    settingsOpen: false,
    fakeRankingVisible: false,
    darkMode: false,
    colorBlindMode: false,
    difficultyLevel: 'normal',
    lastLagScore: 0,

    toggleControlsInversion(player) {
        this.controlsInverted = !this.controlsInverted;
        if (this.controlsInverted) {
            if (player) player.classList.add('inverted');
            ui.showTrollMessage("CONTROLES INVERTIDOS! 🔄");
            document.body.classList.add('inverted-controls');
        } else {
            if (player) player.classList.remove('inverted');
            ui.showTrollMessage("Controles normais... por enquanto. 😏");
            document.body.classList.remove('inverted-controls');
        }
        this.lastTrollTime = Date.now();
    },

    freezeControls(duration) {
        this.controlsFrozen = true;
        ui.showTrollMessage("CONTROLES CONGELADOS! Você não pode se mover! 🥶");
        setTimeout(() => {
            this.controlsFrozen = false;
            ui.showTrollMessage("Controles restaurados. Não diga que não avisei! 😈");
        }, duration);
    },

    toggleDarkMode(activate) {
        this.darkMode = activate;
        document.body.classList.toggle('dark-mode', this.darkMode);
        if (activate) {
            ui.showTrollMessage("Modo Escuro ativado! Boa sorte pra enxergar agora! 🌚");
        } else {
            ui.showTrollMessage("Modo Claro forçado! ☀️");
        }
    },

    activateEasyMode(gameInstance) {
        this.easyModeActive = true;
        ui.showTrollMessage("Modo Fácil ativado! Prepare-se para o INFERNO! 🔥");
        if (gameInstance.gameRunning) {
            gameInstance.obstacles.forEach(obs => {
                obs.speed *= 2;
                if (obs.element) obs.element.classList.add('color-changing');
            });
            this.toggleControlsInversion(gameInstance.player);
            gameInstance.collectibles.forEach(col => {
                if (col.element) col.element.classList.add('fleeing');
                col.fleeing = true;
            });
        }
    },

    fakeSave(gameInstance) {
        ui.showTrollMessage("Salvando progresso... PSIU! Resetando tudo! 😂");
        const startBtn = document.getElementById('startBtn');
        const originalText = startBtn ? startBtn.textContent : '';
        if (startBtn) startBtn.textContent = 'SALVANDO...';
        setTimeout(() => {
            gameInstance.resetGame();
            if (startBtn) startBtn.textContent = originalText;
            ui.showTrollMessage("Progresso 'salvo' com sucesso! (Não mesmo!) 💾❌");
        }, 2000);
    },

    fakeQuit(gameInstance) {
        ui.showTrollMessage("Desistir? JAMAIS! Você vai continuar sofrendo! 😈");
        if (!gameInstance.gameRunning) {
            gameInstance.startGame();
        }
        gameInstance.obstacles.forEach(obs => obs.speed *= 1.2);
    },

    toggleSettings() {
        this.settingsOpen = !this.settingsOpen;
        const panel = ui.settingsPanel;
        if (panel) {
            panel.style.display = this.settingsOpen ? 'block' : 'none';
            if (this.settingsOpen) {
                ui.showTrollMessage("Configurações abertas! Nada aqui funciona direito! ⚙️");
            }
        }
    },

    toggleFakeRanking(score) {
        this.fakeRankingVisible = !this.fakeRankingVisible;
        const ranking = ui.fakeRanking;
        if (ranking) {
            ranking.style.display = this.fakeRankingVisible ? 'block' : 'none';
            if (this.fakeRankingVisible) {
                ui.fakeRankingData[ui.fakeRankingData.length - 1] = `999,999. Você - ${score} pts`;
                ranking.innerHTML = `
                    <h4>🏆 RANKING GLOBAL</h4>
                    ${ui.fakeRankingData.map(rank => `<p>${rank}</p>`).join('')}
                `;
                ui.showTrollMessage("Ranking global! Você está em último, como sempre! 🏆💀");
            }
        }
    },

    setupSettingsListeners(gameInstance) {
        setTimeout(() => {
            const volumeSlider = document.getElementById('volumeSlider');
            const difficultySelect = document.getElementById('difficultySelect');
            const darkModeCheck = document.getElementById('darkModeCheck');
            const colorBlindCheck = document.getElementById('colorBlindCheck');
            const tutorialPopup = document.getElementById('tutorialPopup');

            if (volumeSlider) {
                volumeSlider.addEventListener('input', (e) => {
                    ui.showTrollMessage(`Volume ajustado para ${e.target.value}%... ou não! 😏`);
                });
            }

            if (difficultySelect) {
                difficultySelect.addEventListener('change', (e) => {
                    const messages = {
                        'easy': 'Modo Fácil ativado! (Mentira, agora está mais difícil!) 😈',
                        'normal': 'Modo Normal... se é que existe algo normal aqui! 🤔',
                        'hard': 'Modo Difícil! Finalmente sendo honesto! 💀'
                    };
                    ui.showTrollMessage(messages[e.target.value]);
                    this.difficultyLevel = e.target.value;
                });
            }

            if (darkModeCheck) {
                darkModeCheck.addEventListener('change', (e) => {
                    this.toggleDarkMode(e.target.checked);
                });
            }

            if (colorBlindCheck) {
                colorBlindCheck.addEventListener('change', (e) => {
                    this.colorBlindMode = e.target.checked;
                    document.body.classList.toggle('colorblind-mode', this.colorBlindMode);
                    ui.showTrollMessage(this.colorBlindMode ? 'Modo daltonismo ativado! Agora as cores estão PIORES! 🌈💀' : 'Cores normais restauradas... mais ou menos! 🎨');
                });
            }

            document.getElementById('helpBtn').addEventListener('click', () => {
                if (tutorialPopup) {
                    tutorialPopup.style.display = 'flex';
                }
                const helpMessage = ui.helpMessages[Math.floor(Math.random() * ui.helpMessages.length)];
                ui.showTrollMessage(helpMessage);
                
                const randomTroll = Math.random();
                if (randomTroll < 0.3) {
                    this.toggleControlsInversion(gameInstance.player);
                } else if (randomTroll < 0.6) {
                    document.body.classList.add('glitch-effect');
                    setTimeout(() => document.body.classList.remove('glitch-effect'), 500);
                    ui.showTrollMessage("ACHOU QUE IA ME AJUDAR, NÉ? AGORA ESTÁ TUDO PIOR! 😈");
                } else {
                    ui.showFakeLag();
                    setTimeout(() => ui.hideFakeLag(), 2000);
                }
            });
        }, 1000);
    },

    setupTrollButtons() {
        const controlBtns = document.querySelectorAll('.control-btn');
        controlBtns.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (Math.random() < 0.4) {
                    btn.classList.add('troll-move');
                    setTimeout(() => btn.classList.remove('troll-move'), 500);
                    ui.showTrollMessage("Achou que seria fácil? 😏");
                }
            });
        });
    },

    updateFakeCursor(e) {
        if (Math.random() < 0.05) {
            const fakeCursor = ui.fakeCursor;
            if (fakeCursor) {
                fakeCursor.style.display = 'block';
                fakeCursor.style.left = (e.clientX + Math.random() * 100 - 50) + 'px';
                fakeCursor.style.top = (e.clientY + Math.random() * 100 - 50) + 'px';
                setTimeout(() => {
                    fakeCursor.style.display = 'none';
                }, 1000);
            }
        }
    },

    updateTrollMechanics(gameInstance) {
        const now = Date.now();
        if (now - this.lastTrollTime > 8000 && Math.random() < (this.difficultyLevel === 'easy' ? 0.02 : this.difficultyLevel === 'hard' ? 0.15 : 0.08)) {
            this.toggleControlsInversion(gameInstance.player);
        }
        if (Math.random() < 0.002 && gameInstance.invisibleWall && gameInstance.gameArea) {
            gameInstance.invisibleWall.style.top = Math.random() * (gameInstance.gameArea.offsetHeight - 100) + 'px';
            gameInstance.invisibleWall.style.right = Math.random() * (gameInstance.gameArea.offsetWidth - 200) + 100 + 'px';
        }
        
        if (gameInstance.score >= this.lastLagScore + 50 && !this.fakeLagActive) {
            this.fakeLagActive = true;
            ui.showFakeLag();
            setTimeout(() => {
                ui.hideFakeLag();
                this.fakeLagActive = false;
                ui.showTrollMessage("Conexão 'restaurada'! Foi só uma brincadeira! 📶");
            }, 3000);
            this.lastLagScore = gameInstance.score;
        }

        if (Math.random() < (this.difficultyLevel === 'hard' ? 0.002 : 0.0005)) {
            this.toggleDarkMode(!this.darkMode);
        }

        if (Math.random() < 0.001) {
            this.freezeControls(1000);
        }
    },

    checkDeathAchievements(attempts, achievements) {
        if (attempts === 1) {
            ui.showAchievement("Primeira Morte", "Bem-vindo ao clube dos fracassados! 💀", achievements);
        }
        if (attempts === 10) {
            ui.showAchievement("Tentativa e Erro", "10 mortes! Você está aprendendo... lentamente.", achievements);
        }
        if (attempts === 25) {
            ui.showAchievement("Persistência Duvidosa", "25 mortes? Você tem problemas...", achievements);
        }
        if (attempts === 50) {
            ui.showAchievement("Persistência Questionável", "50 mortes? Sério?", achievements);
        }
        if (attempts === 100) {
            ui.showAchievement("Definição de Insanidade", "100 mortes fazendo a mesma coisa...", achievements);
        }
        if (attempts === 200) {
            ui.showAchievement("Masoquista Supremo", "200 mortes! Você precisa de ajuda profissional!", achievements);
        }
    },
};