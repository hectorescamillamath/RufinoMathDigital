// Estado del juego
const gameState = {
    timeLeft: 60,
    totalTime: 60,
    correct: 0,
    incorrect: 0,
    level: 1,
    totalOperations: 0,
    currentOperation: null,
    gameRunning: false,
    timeInterval: null,
    modality: 'all',
    operations: ['+', '-', '×', '÷'],
    isProcessing: false
};

// Configuración de dificultad por nivel
const difficultyConfig = {
    1: { operands: 2, maxNumber: 10 },
    2: { operands: 2, maxNumber: 20 },
    3: { operands: 3, maxNumber: 20 },
    4: { operands: 3, maxNumber: 50 },
    5: { operands: 4, maxNumber: 50 },
};

// Elementos del DOM
const elements = {
    startScreen: document.getElementById('startScreen'),
    countdownScreen: document.getElementById('countdownScreen'),
    gameScreen: document.getElementById('gameScreen'),
    resultsScreen: document.getElementById('resultsScreen'),
    
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    
    answerInput: document.getElementById('answerInput'),
    operationDisplay: document.getElementById('operationDisplay'),
    operationCard: document.querySelector('.operation-card'),
    feedbackMessage: document.getElementById('feedbackMessage'),
    countdownNumber: document.getElementById('countdownNumber'),
    
    timeDisplay: document.getElementById('timeDisplay'),
    levelDisplay: document.getElementById('levelDisplay'),
    correctDisplay: document.getElementById('correctDisplay'),
    incorrectDisplay: document.getElementById('incorrectDisplay'),
    
    finalCorrect: document.getElementById('finalCorrect'),
    finalIncorrect: document.getElementById('finalIncorrect'),
    finalScore: document.getElementById('finalScore'),
    finalLevel: document.getElementById('finalLevel'),
    resultsFeedback: document.getElementById('resultsFeedback'),
    
    configText: document.getElementById('configText'),
    
    modalityRadios: document.querySelectorAll('input[name="modality"]'),
    durationRadios: document.querySelectorAll('input[name="duration"]')
};

// Event listeners
elements.startBtn.addEventListener('click', startCountdown);
elements.restartBtn.addEventListener('click', resetGame);

// Solo Enter para enviar respuesta
elements.answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (!gameState.isProcessing && gameState.gameRunning) {
            submitAnswer();
        }
    }
});

// Actualizar configuración dinámicamente
elements.modalityRadios.forEach(radio => {
    radio.addEventListener('change', updateConfigDisplay);
});

elements.durationRadios.forEach(radio => {
    radio.addEventListener('change', updateConfigDisplay);
});

// Actualizar texto de configuración
function updateConfigDisplay() {
    const selectedModality = document.querySelector('input[name="modality"]:checked').value;
    const selectedDuration = document.querySelector('input[name="duration"]:checked').value;
    
    const modalityNames = {
        'all': 'Todas las operaciones',
        'suma': 'Sumas',
        'resta': 'Restas',
        'multiplicacion': 'Multiplicaciones',
        'division': 'Divisiones'
    };
    
    elements.configText.textContent = `Modalidad: ${modalityNames[selectedModality]} | Duración: ${selectedDuration} segundos`;
}

// Cambiar pantalla
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    screenId.classList.add('active');
}

// Obtener operaciones según modalidad
function getOperations(modality) {
    const operationsMap = {
        'suma': ['+'],
        'resta': ['-'],
        'multiplicacion': ['×'],
        'division': ['÷'],
        'all': ['+', '-', '×', '÷']
    };
    
    return operationsMap[modality] || ['+', '-', '×', '÷'];
}

// Generar operación
function generateOperation() {
    const config = difficultyConfig[gameState.level] || difficultyConfig[5];
    const maxNumber = config.maxNumber;
    const operations = gameState.operations;
    
    // Elegir operación aleatoria
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    let operand1, operand2, answer, display;
    
    if (op === '+') {
        operand1 = Math.floor(Math.random() * maxNumber) + 1;
        operand2 = Math.floor(Math.random() * maxNumber) + 1;
        answer = operand1 + operand2;
        display = `${operand1} + ${operand2}`;
    } 
    else if (op === '-') {
        // Asegurar que el minuendo sea mayor al sustraendo
        operand1 = Math.floor(Math.random() * maxNumber) + 5;
        operand2 = Math.floor(Math.random() * (operand1 - 1)) + 1;
        answer = operand1 - operand2;
        display = `${operand1} − ${operand2}`;
    } 
    else if (op === '×') {
        operand1 = Math.floor(Math.random() * Math.min(maxNumber, 15)) + 1;
        operand2 = Math.floor(Math.random() * Math.min(maxNumber, 15)) + 1;
        answer = operand1 * operand2;
        display = `${operand1} × ${operand2}`;
    } 
    else if (op === '÷') {
        // Asegurar división exacta
        operand2 = Math.floor(Math.random() * Math.min(maxNumber, 12)) + 1;
        answer = Math.floor(Math.random() * 20) + 1;
        operand1 = answer * operand2;
        display = `${operand1} ÷ ${operand2}`;
    }
    
    // Agregar potencias y raíces después de 30 operaciones
    if (gameState.totalOperations >= 30 && Math.random() > 0.7) {
        if (Math.random() > 0.5) {
            // Potencia cuadrada
            const base = Math.floor(Math.random() * 10) + 1;
            return {
                display: `${base}² = ?`,
                answer: base * base
            };
        } else {
            // Raíz cuadrada (de cuadrados perfectos)
            const base = Math.floor(Math.random() * 10) + 1;
            const radicand = base * base;
            return {
                display: `√${radicand} = ?`,
                answer: base
            };
        }
    }
    
    return {
        display: `${display} = ?`,
        answer: answer
    };
}

// Iniciar cuenta regresiva
function startCountdown() {
    // Obtener configuración seleccionada
    gameState.modality = document.querySelector('input[name="modality"]:checked').value;
    gameState.operations = getOperations(gameState.modality);
    gameState.totalTime = parseInt(document.querySelector('input[name="duration"]:checked').value);
    
    showScreen(elements.countdownScreen);
    let countdown = 3;
    
    const countdownInterval = setInterval(() => {
        elements.countdownNumber.textContent = countdown;
        countdown--;
        
        if (countdown < 0) {
            clearInterval(countdownInterval);
            startGame();
        }
    }, 1000);
}

// Iniciar juego
function startGame() {
    gameState.gameRunning = true;
    gameState.timeLeft = gameState.totalTime;
    gameState.correct = 0;
    gameState.incorrect = 0;
    gameState.level = 1;
    gameState.totalOperations = 0;
    gameState.isProcessing = false;
    
    showScreen(elements.gameScreen);
    generateNewOperation();
    updateDisplay();
    
    // Detener temporizador anterior si existe
    if (gameState.timeInterval) {
        clearInterval(gameState.timeInterval);
    }
    
    // Temporizador principal - se ejecuta cada 1 segundo
    gameState.timeInterval = setInterval(() => {
        if (gameState.gameRunning) {
            gameState.timeLeft--;
            updateDisplay();
            
            // Advertencia de poco tiempo
            if (gameState.timeLeft <= 10 && gameState.timeLeft > 0) {
                elements.timeDisplay.parentElement.classList.add('low-time');
            }
            
            // Verificar si se acabó el tiempo
            if (gameState.timeLeft <= 0) {
                gameState.gameRunning = false;
                clearInterval(gameState.timeInterval);
                endGame();
            }
        }
    }, 1000);
    
    elements.answerInput.focus();
}

// Generar nueva operación
function generateNewOperation() {
    gameState.currentOperation = generateOperation();
    elements.operationDisplay.textContent = gameState.currentOperation.display;
    elements.answerInput.value = '';
    elements.answerInput.focus();
    elements.feedbackMessage.textContent = '';
    elements.feedbackMessage.className = 'feedback-message';
}

// Mostrar checkmark fugaz (instantáneamente)
function showCheckmark() {
    const checkmark = document.createElement('div');
    checkmark.className = 'checkmark';
    checkmark.textContent = '✓';
    elements.operationCard.appendChild(checkmark);
    
    setTimeout(() => {
        if (checkmark.parentNode) {
            checkmark.remove();
        }
    }, 600);
}

// Mostrar respuesta correcta de forma fugaz (instantáneamente)
function showCorrectAnswer() {
    const correctDisplay = document.createElement('div');
    correctDisplay.className = 'correct-answer-display';
    correctDisplay.textContent = gameState.currentOperation.answer;
    elements.operationCard.appendChild(correctDisplay);
    
    setTimeout(() => {
        if (correctDisplay.parentNode) {
            correctDisplay.remove();
        }
    }, 800);
}

// Enviar respuesta
function submitAnswer() {
    if (!gameState.gameRunning || gameState.isProcessing) {
        return;
    }
    
    gameState.isProcessing = true;
    const userAnswer = parseInt(elements.answerInput.value);
    
    if (isNaN(userAnswer) || elements.answerInput.value.trim() === '') {
        elements.feedbackMessage.textContent = 'Por favor, ingresa un número';
        elements.feedbackMessage.className = 'feedback-message incorrect';
        gameState.isProcessing = false;
        return;
    }
    
    // Verificar respuesta INMEDIATAMENTE
    const isCorrect = userAnswer === gameState.currentOperation.answer;
    
    if (isCorrect) {
        gameState.correct++;
        gameState.timeLeft += 3;
        showCheckmark();
        elements.feedbackMessage.textContent = '✓';
        elements.feedbackMessage.className = 'feedback-message correct';
    } else {
        gameState.incorrect++;
        gameState.timeLeft = Math.max(0, gameState.timeLeft - 1);
        showCorrectAnswer();
        elements.feedbackMessage.textContent = 'La respuesta era: ' + gameState.currentOperation.answer;
        elements.feedbackMessage.className = 'feedback-message incorrect';
    }
    
    gameState.totalOperations++;
    updateLevel();
    updateDisplay();
    
    // Esperar SOLO 1 segundo antes de nueva operación (reducido de 2)
    setTimeout(() => {
        if (gameState.gameRunning) {
            generateNewOperation();
            gameState.isProcessing = false;
        }
    }, 1000);
}

// Actualizar nivel
function updateLevel() {
    const newLevel = Math.floor(gameState.totalOperations / 10) + 1;
    gameState.level = Math.min(newLevel, 5);
}

// Actualizar pantalla
function updateDisplay() {
    elements.timeDisplay.textContent = Math.max(0, gameState.timeLeft);
    elements.levelDisplay.textContent = gameState.level;
    elements.correctDisplay.textContent = gameState.correct;
    elements.incorrectDisplay.textContent = gameState.incorrect;
}

// Finalizar juego
function endGame() {
    gameState.gameRunning = false;
    
    if (gameState.timeInterval) {
        clearInterval(gameState.timeInterval);
    }
    
    showResults();
}

// Mostrar resultados
function showResults() {
    const score = gameState.correct * 10 - gameState.incorrect * 5;
    
    elements.finalCorrect.textContent = gameState.correct;
    elements.finalIncorrect.textContent = gameState.incorrect;
    elements.finalScore.textContent = Math.max(0, score);
    elements.finalLevel.textContent = gameState.level;
    
    // Mensaje personalizado
    let feedback = '';
    if (gameState.correct === 0) {
        feedback = '¡Próxima vez lo harás mejor! 💪';
    } else if (gameState.correct < 10) {
        feedback = '¡Buen intento! Sigue practicando. 📚';
    } else if (gameState.correct < 20) {
        feedback = '¡Muy bien! Estás mejorando. 🌟';
    } else if (gameState.correct < 30) {
        feedback = '¡Excelente! Eres muy rápido. 🚀';
    } else {
        feedback = '¡INCREÍBLE! ¡Eres un maestro matemático! 🏆';
    }
    
    elements.resultsFeedback.textContent = feedback;
    
    showScreen(elements.resultsScreen);
}

// Reiniciar juego
function resetGame() {
    if (gameState.timeInterval) {
        clearInterval(gameState.timeInterval);
    }
    
    gameState.timeLeft = 60;
    gameState.correct = 0;
    gameState.incorrect = 0;
    gameState.level = 1;
    gameState.totalOperations = 0;
    gameState.gameRunning = false;
    gameState.isProcessing = false;
    
    elements.timeDisplay.parentElement.classList.remove('low-time');
    
    showScreen(elements.startScreen);
}

// Inicializar
updateConfigDisplay();
showScreen(elements.startScreen);