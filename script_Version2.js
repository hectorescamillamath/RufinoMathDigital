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
    operations: ['+', '-', '*', '/']
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
    submitBtn: document.getElementById('submitBtn'),
    restartBtn: document.getElementById('restartBtn'),
    
    answerInput: document.getElementById('answerInput'),
    operationDisplay: document.getElementById('operationDisplay'),
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
elements.submitBtn.addEventListener('click', submitAnswer);
elements.restartBtn.addEventListener('click', resetGame);
elements.answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitAnswer();
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
        'multiplicacion': ['*'],
        'division': ['/'],
        'all': ['+', '-', '*', '/']
    };
    
    return operationsMap[modality] || ['+', '-', '*', '/'];
}

// Generar operación
function generateOperation() {
    const config = difficultyConfig[gameState.level] || difficultyConfig[5];
    const numOperands = config.operands;
    const maxNumber = config.maxNumber;
    const operations = gameState.operations;
    
    let operation = Math.floor(Math.random() * maxNumber) + 1;
    
    for (let i = 1; i < numOperands; i++) {
        const op = operations[Math.floor(Math.random() * operations.length)];
        const operand = Math.floor(Math.random() * maxNumber) + 1;
        operation = createOperation(operation, operand, op);
    }
    
    // Agregar potencias y raíces después de 30 operaciones
    if (gameState.totalOperations >= 30 && Math.random() > 0.7) {
        if (Math.random() > 0.5) {
            // Potencia
            const base = Math.floor(Math.random() * 5) + 2;
            const exp = Math.floor(Math.random() * 3) + 2;
            return {
                display: `${base}^${exp} = ?`,
                answer: Math.pow(base, exp)
            };
        } else {
            // Raíz cuadrada
            const base = Math.floor(Math.random() * 10) + 1;
            const radicand = base * base;
            return {
                display: `√${radicand} = ?`,
                answer: base
            };
        }
    }
    
    return operation;
}

function createOperation(num1, num2, op) {
    let answer;
    
    switch(op) {
        case '+':
            answer = num1 + num2;
            break;
        case '-':
            answer = num1 - num2;
            if (answer < 0) answer = Math.abs(answer);
            break;
        case '*':
            answer = num1 * num2;
            break;
        case '/':
            // Asegurar división exacta
            answer = num1;
            num1 = answer * num2;
            break;
    }
    
    return {
        display: `${num1} ${op} ${num2} = ?`,
        answer: Math.round(answer)
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
    
    showScreen(elements.gameScreen);
    generateNewOperation();
    updateDisplay();
    
    // Temporizador principal
    gameState.timeInterval = setInterval(() => {
        gameState.timeLeft--;
        updateDisplay();
        
        // Advertencia de poco tiempo
        if (gameState.timeLeft <= 10) {
            elements.timeDisplay.parentElement.classList.add('low-time');
        }
        
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
    
    elements.answerInput.focus();
}

// Generar nueva operación
function generateNewOperation() {
    gameState.currentOperation = generateOperation();
    elements.operationDisplay.textContent = gameState.currentOperation.display;
    elements.answerInput.value = '';
    elements.feedbackMessage.textContent = '';
    elements.feedbackMessage.className = 'feedback-message';
}

// Enviar respuesta
function submitAnswer() {
    if (!gameState.gameRunning) return;
    
    const userAnswer = parseInt(elements.answerInput.value);
    
    if (isNaN(userAnswer)) {
        showFeedback('Por favor, ingresa un número válido', 'incorrect');
        return;
    }
    
    if (userAnswer === gameState.currentOperation.answer) {
        gameState.correct++;
        gameState.timeLeft += 3;
        showFeedback('✅ ¡Correcto!', 'correct');
    } else {
        gameState.incorrect++;
        gameState.timeLeft = Math.max(0, gameState.timeLeft - 1);
        showFeedback(`❌ Incorrecto. La respuesta era ${gameState.currentOperation.answer}`, 'incorrect');
    }
    
    gameState.totalOperations++;
    updateLevel();
    updateDisplay();
    
    // Siguiente operación después de 1 segundo
    setTimeout(() => {
        generateNewOperation();
        elements.answerInput.focus();
    }, 1000);
}

// Mostrar retroalimentación
function showFeedback(message, type) {
    elements.feedbackMessage.textContent = message;
    elements.feedbackMessage.className = `feedback-message ${type}`;
}

// Actualizar nivel
function updateLevel() {
    const newLevel = Math.floor(gameState.totalOperations / 10) + 1;
    gameState.level = Math.min(newLevel, 5);
}

// Actualizar pantalla
function updateDisplay() {
    elements.timeDisplay.textContent = gameState.timeLeft;
    elements.levelDisplay.textContent = gameState.level;
    elements.correctDisplay.textContent = gameState.correct;
    elements.incorrectDisplay.textContent = gameState.incorrect;
}

// Finalizar juego
function endGame() {
    gameState.gameRunning = false;
    clearInterval(gameState.timeInterval);
    showResults();
}

// Mostrar resultados
function showResults() {
    const totalOperations = gameState.correct + gameState.incorrect;
    const score = gameState.correct * 10 - gameState.incorrect * 5;
    
    elements.finalCorrect.textContent = gameState.correct;
    elements.finalIncorrect.textContent = gameState.incorrect;
    elements.finalScore.textContent = score;
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
    gameState.timeLeft = gameState.totalTime;
    gameState.correct = 0;
    gameState.incorrect = 0;
    gameState.level = 1;
    gameState.totalOperations = 0;
    gameState.gameRunning = false;
    
    clearInterval(gameState.timeInterval);
    elements.timeDisplay.parentElement.classList.remove('low-time');
    
    showScreen(elements.startScreen);
}

// Inicializar
updateConfigDisplay();
showScreen(elements.startScreen);