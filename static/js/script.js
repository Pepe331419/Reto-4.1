document.addEventListener('DOMContentLoaded', function () {
    const startBtn = document.getElementById('startGame');
    const diffSelector = document.getElementById('difficultySettings');
    const greenBtn = document.getElementById('greenBtn');
    const redBtn = document.getElementById('redBtn');
    const blueBtn = document.getElementById('blueBtn');
    const yellowBtn = document.getElementById('yellowBtn');
    const playerBtn = document.getElementById('playerBtn');
    const currentScoreBoard = document.getElementById('currentScore');
    const inputScoreBtn = document.getElementById('inputScoreBtn');
    const template = document.querySelector("template").content;
    const rankingTableBody = document.getElementById("rankingTableBody");

    const nameInput = document.getElementById('nameInput');
    const finalScore = document.getElementById('finalScore');
    const finalDifficulty = document.getElementById('finalDifficulty');
    const ranking = document.getElementById('ranking');
    const showRankingBtn = document.getElementById('showRankingBtn');
    const closeRankingBtn = document.getElementById('closeRankingBtn');
    var gameStarted = false;
    var cpuSequence = [];
    var playerSequence = [];
    var playerTurn = false;
    var gameSpeed = 0;
    var difficulty = "";
    const colors = ['green', 'red', 'blue', 'yellow'];
    var score = 0;

    //PARTE DE SONIDO
    var bgMusic = document.getElementById("bgMusic");
    var playBtn = document.getElementById("playBtn");
    var stopBtn = document.getElementById("stopBtn");
    var startJingle = document.getElementById("startJingle");
    var buttonSound1 = document.getElementById("press1");
    var buttonSound2 = document.getElementById("press2");
    var buttonSound3 = document.getElementById("press3");
    var buttonSound4 = document.getElementById("press4");
    var wrongSound = document.getElementById("wrongSound");

    startBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        gameSpeed = parseInt(diffSelector.value);
        difficulty = diffSelector.options[diffSelector.selectedIndex].innerHTML;
        startGame();
    })

    showRankingBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        constructTable();
        ranking.showModal();
    })

    closeRankingBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ranking.close();
    })


    inputScoreBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        let playerName = document.getElementById('playerName').value
        if (playerName.length == 3) {
            player = {
                name: playerName,
                score: score,
                difficulty: difficulty
            };

            let currentPlayersJSON = localStorage.getItem('playersData');

            currentPlayersJSON ? currentPlayers = JSON.parse(currentPlayersJSON) : currentPlayers = [];

            currentPlayers.push(player);

            currentPlayers.sort((a, b) => b.score - a.score);

            let updatedPlayersJSON = JSON.stringify(currentPlayers);
            localStorage.setItem('playersData', updatedPlayersJSON);

            document.getElementById('playerName').value = "";
            nameInput.close();
        }
    })

    async function startGame() {
        startBtn.setAttribute("disabled", "true");
        await startAnimation();
        gameStarted = true;
        currentScore = 0;
        cpuSequence = [];
        playerSequence = [];
        playerTurn = false;
        currentScoreBoard.innerHTML = "-";
        score = 0;
        startBtn.setAttribute("disabled", "true");
        manageTurns();
    }

    function lightButton(btn, time) {
        btn.classList.add("active");
        setTimeout(() => btn.classList.remove("active"), time);
    }

    function soundButton(btnColor) {
        switch (btnColor) {
            case "green":
                buttonSound1.play();
                break;
            case "red":
                buttonSound2.play();
                break;
            case "blue":
                buttonSound3.play();
                break;
            case "yellow":
                buttonSound4.play();
                break;
        }
    }

    function addToCPUSequence() {
        let newSeqEl = colors[Math.floor(Math.random() * 4)];
        cpuSequence.push(newSeqEl);
    }

    function displayCPUSequence() {
        const displayDelayed = (pos) => {
            if (pos < cpuSequence.length) {
                soundButton(cpuSequence[pos]);
                switch (cpuSequence[pos]) {
                    case "green":
                        lightButton(greenBtn, gameSpeed);
                        break;
                    case "red":
                        lightButton(redBtn, gameSpeed);
                        break;
                    case "blue":
                        lightButton(blueBtn, gameSpeed);
                        break;
                    case "yellow":
                        lightButton(yellowBtn, gameSpeed);
                        break;
                }
            }
            setTimeout(() => {
                displayDelayed(pos + 1)
            }, (gameSpeed + 50));
        }
        displayDelayed(0);
    }

    async function manageTurns() {
        if (gameStarted) {
            if (!playerTurn) {
                playerBtn.classList.remove("active");
                await delay(500);
                addToCPUSequence();
                displayCPUSequence();
                await delay(500 + (gameSpeed * cpuSequence.length));
                playerTurn = true;
                manageTurns();
                await delay(100);
            } else {
                playerBtn.classList.add("active");
                await waitForInput();
                await delay(500);
                if (gameStarted) {
                    playerSequence = [];
                    playerTurn = false;
                    manageTurns();
                } else {
                    playerBtn.classList.remove("active");
                    endGame();
                }
            }
        }
    }

    async function startAnimation() {
        startJingle.play();
        await delay(219);
        lightButton(greenBtn, 300);
        await delay(500);
        lightButton(blueBtn, 300);
        await delay(500);
        lightButton(redBtn, 400);
        await delay(400);
        lightButton(yellowBtn, 1000);
        await delay(2500);
    }

    function delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    function endGame() {
        finalScore.innerHTML = "Puntuacion final: " + score;
        finalDifficulty.innerHTML = "Dificultad: " + difficulty;
        nameInput.showModal();
        currentScoreBoard.innerHTML = "-";
        startBtn.removeAttribute("disabled");
    }

    function addToPlayerSeq(color) {
        if (playerTurn) {
            playerSequence.push(color);
        }
    }

    function checkLastInput() {
        let position = playerSequence.length - 1;
        if (playerSequence[position] == cpuSequence[position]) score++;
        currentScoreBoard.innerHTML = score;
        return playerSequence[position] == cpuSequence[position];
    }

    function waitForInput() {
        return new Promise(resolve => {
            const btnClickHandler = (color) => {
                addToPlayerSeq(color);
                if (!checkLastInput()) {
                    wrongSound.play();
                    gameStarted = false;
                    removeEventListeners();
                    playerTurn = false;
                    resolve();
                } else {
                    soundButton(color);
                    if (playerSequence.length == cpuSequence.length) {
                        removeEventListeners();
                        resolve();
                    }
                }
            };

            const removeEventListeners = () => {
                greenBtn.removeEventListener('click', greenClickHandler);
                redBtn.removeEventListener('click', redClickHandler);
                blueBtn.removeEventListener('click', blueClickHandler);
                yellowBtn.removeEventListener('click', yellowClickHandler);
            };

            const addEventListeners = () => {
                greenBtn.addEventListener('click', greenClickHandler);
                redBtn.addEventListener('click', redClickHandler);
                blueBtn.addEventListener('click', blueClickHandler);
                yellowBtn.addEventListener('click', yellowClickHandler);
            };

            const greenClickHandler = () => {
                lightButton(greenBtn, 250);
                btnClickHandler('green');
            };

            const redClickHandler = () => {
                lightButton(redBtn, 250);
                btnClickHandler('red');
            };

            const blueClickHandler = () => {
                lightButton(blueBtn, 250);
                btnClickHandler('blue');
            };

            const yellowClickHandler = () => {
                lightButton(yellowBtn, 250);
                btnClickHandler('yellow');
            };

            addEventListeners();
        });
    }

    function constructTable() {
        let rankedPlayersJSON = localStorage.getItem('playersData');
        if (rankedPlayersJSON) {
            let rankedPlayers = JSON.parse(rankedPlayersJSON);
            rankingTableBody.innerHTML = "";

            rankedPlayers.forEach(player => {
                let newRow = template.cloneNode(true);

                newRow.querySelector('.rankingName').textContent = player.name;
                newRow.querySelector('.rankingScore').textContent = player.score;
                newRow.querySelector('.rankingDifficulty').textContent = player.difficulty;

                rankingTableBody.appendChild(newRow);
            });
        } else {
            let newRow = template.cloneNode(true);

            newRow.querySelector('.rankingName').textContent = "-";
            newRow.querySelector('.rankingScore').textContent = "-";
            newRow.querySelector('.rankingDifficulty').textContent = "-";

            rankingTableBody.appendChild(newRow);
        }
    }

    playBtn.addEventListener("click", () => {
        bgMusic.play();
    })

    stopBtn.addEventListener("click", () => {
        bgMusic.pause();
    })
});