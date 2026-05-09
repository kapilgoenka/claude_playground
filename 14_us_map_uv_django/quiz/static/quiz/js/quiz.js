// Quiz Game Logic
class USStatesQuiz {
    constructor() {
        this.totalQuestions = 10;
        this.currentQuestion = 0;
        this.score = 0;
        this.usedStates = [];
        this.currentState = null;
        this.isAnswered = false;

        this.init();
    }

    playCorrectSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create a pleasant ascending chord for correct answer
            const frequencies = [523.25, 659.25, 783.99]; // C, E, G notes
            const duration = 0.3;

            frequencies.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.type = 'sine';
                oscillator.frequency.value = freq;

                const startTime = audioContext.currentTime + (index * 0.08);
                gainNode.gain.setValueAtTime(0.2, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            });
        } catch (e) {
            console.log('Audio not supported:', e);
        }
    }

    playIncorrectSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create a descending "wrong" sound
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.log('Audio not supported:', e);
        }
    }

    init() {
        this.renderMap();
        this.startQuiz();

        // Event listeners
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartQuiz();
        });
    }

    renderMap() {
        const mapSvg = document.getElementById('us-map');

        // Create all state paths
        US_STATES.forEach(state => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', state.path);
            path.setAttribute('class', 'state');
            path.setAttribute('data-state', state.name);
            mapSvg.appendChild(path);
        });
    }

    startQuiz() {
        this.currentQuestion = 0;
        this.score = 0;
        this.usedStates = [];
        this.updateScore();
        this.nextQuestion();
    }

    nextQuestion() {
        if (this.currentQuestion >= this.totalQuestions) {
            this.showResults();
            return;
        }

        this.currentQuestion++;
        this.isAnswered = false;
        this.updateQuestionNumber();

        // Select random state that hasn't been used
        const availableStates = US_STATES.filter(
            state => !this.usedStates.includes(state.name)
        );

        this.currentState = availableStates[
            Math.floor(Math.random() * availableStates.length)
        ];
        this.usedStates.push(this.currentState.name);

        // Highlight the state on map
        this.highlightState(this.currentState.name);

        // Generate answer options
        this.generateAnswers();

        // Clear feedback
        this.clearFeedback();
    }

    highlightState(stateName) {
        // Remove previous highlights
        document.querySelectorAll('.state').forEach(state => {
            state.classList.remove('highlighted');
        });

        // Highlight current state
        const stateElement = document.querySelector(`[data-state="${stateName}"]`);
        if (stateElement) {
            stateElement.classList.add('highlighted');
        }
    }

    generateAnswers() {
        const answersContainer = document.getElementById('answers-container');
        answersContainer.innerHTML = '';

        // Get 3 random incorrect answers
        const incorrectStates = US_STATES.filter(
            state => state.name !== this.currentState.name
        );

        const shuffledIncorrect = this.shuffleArray(incorrectStates);
        const wrongAnswers = shuffledIncorrect.slice(0, 3);

        // Combine correct and wrong answers
        const allAnswers = [this.currentState, ...wrongAnswers];
        const shuffledAnswers = this.shuffleArray(allAnswers);

        // Create answer buttons
        shuffledAnswers.forEach(state => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = state.name;
            button.addEventListener('click', () => this.checkAnswer(state.name, button));
            answersContainer.appendChild(button);
        });
    }

    checkAnswer(selectedState, button) {
        if (this.isAnswered) return;

        this.isAnswered = true;
        const isCorrect = selectedState === this.currentState.name;

        // Disable all buttons
        const allButtons = document.querySelectorAll('.answer-btn');
        allButtons.forEach(btn => btn.disabled = true);

        // Show visual feedback and play sound
        if (isCorrect) {
            button.classList.add('correct');
            this.score++;
            this.updateScore();
            this.showFeedback('Correct! Great job!', true);
            this.playCorrectSound(); // Play correct sound
        } else {
            button.classList.add('incorrect');
            // Highlight the correct answer
            allButtons.forEach(btn => {
                if (btn.textContent === this.currentState.name) {
                    btn.classList.add('correct');
                }
            });
            this.showFeedback(`Oops! The correct answer was ${this.currentState.name}`, false);
            this.playIncorrectSound(); // Play incorrect sound
        }

        // Move to next question after delay
        setTimeout(() => {
            this.nextQuestion();
        }, 2500);
    }

    showFeedback(message, isCorrect) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = 'feedback ' + (isCorrect ? 'correct' : 'incorrect');
    }

    clearFeedback() {
        const feedback = document.getElementById('feedback');
        feedback.textContent = '';
        feedback.className = 'feedback';
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    updateQuestionNumber() {
        document.getElementById('current-question').textContent = this.currentQuestion;
    }

    showResults() {
        // Hide quiz screen
        document.getElementById('quiz-screen').classList.add('hidden');

        // Show results screen
        const resultsScreen = document.getElementById('results-screen');
        resultsScreen.classList.remove('hidden');

        // Display final score
        document.getElementById('final-score').textContent = this.score;

        // Display encouraging message based on score
        const message = this.getResultsMessage(this.score);
        document.getElementById('results-message').textContent = message;
    }

    getResultsMessage(score) {
        if (score === 10) {
            return 'Perfect Score! You\'re a US Geography Champion!';
        } else if (score >= 8) {
            return 'Amazing! You really know your states!';
        } else if (score >= 6) {
            return 'Great job! Keep practicing!';
        } else if (score >= 4) {
            return 'Good effort! Try again to improve!';
        } else {
            return 'Keep learning! You\'ll do better next time!';
        }
    }

    restartQuiz() {
        // Hide results screen
        document.getElementById('results-screen').classList.add('hidden');

        // Show quiz screen
        document.getElementById('quiz-screen').classList.remove('hidden');

        // Restart the quiz
        this.startQuiz();
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Initialize quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new USStatesQuiz();
});
