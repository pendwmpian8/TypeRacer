document.addEventListener('DOMContentLoaded', function () {
    const easyTexts = [
        "The cat sat on the mat.",
        "A quick brown fox jumps over the lazy dog.",
        "She sells seashells by the seashore."
    ];
    const mediumTexts = [
        "To be or not to be, that is the question.",
        "All that glitters is not gold.",
        "A journey of a thousand miles begins with a single step."
    ];
    const hardTexts = [
        "It was the best of times, it was the worst of times.",
        "In the beginning God created the heavens and the earth.",
        "The only thing we have to fear is fear itself."
    ];

    // DOM Elements
    const difficultySelect = document.getElementById('difficulty');
    const sampleTextDiv = document.getElementById('sample-text');
    const stopButton = document.getElementById('stop-btn');
    const retryButton = document.getElementById('retry-btn');
    const resultDiv = document.getElementById('results-area');
    const userInputElem = document.getElementById('user-input');
    const levelSpan = document.getElementById('level');
    const timeSpan = document.getElementById('time');
    const wpmSpan = document.getElementById('wpm');

    let startTime, endTime, timerInterval;
    let currentText = "";
    let testRunning = false;

    function getRandomText(textArray) {
        const randomIndex = Math.floor(Math.random() * textArray.length);
        return textArray[randomIndex];
    }

    function updateSampleText() {
        const selectedDifficulty = difficultySelect.value;

        if (selectedDifficulty === 'easy') {
            currentText = getRandomText(easyTexts);
        } else if (selectedDifficulty === 'medium') {
            currentText = getRandomText(mediumTexts);
        } else if (selectedDifficulty === 'hard') {
            currentText = getRandomText(hardTexts);
        }

        sampleTextDiv.innerHTML = wrapTextWords(currentText);
        levelSpan.textContent = selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1);
    }

    function wrapTextWords(text) {
        return text.split(' ').map((word, i) => `<span id="word-${i}">${word}</span>`).join(' ');
    }

    function beginTypingTest() {
        testRunning = true;
        startTime = Date.now();
        updateLiveTimer();
        timerInterval = setInterval(updateLiveTimer, 100);
        stopButton.disabled = false;
    }

    function stopTest() {
        clearInterval(timerInterval);
        endTime = Date.now();
        testRunning = false;

        userInputElem.disabled = true;
        stopButton.disabled = true;

        displayResults();
    }

    function retryTest() {
        userInputElem.value = '';
        userInputElem.disabled = false;
        userInputElem.focus();
        timeSpan.textContent = '0';
        wpmSpan.textContent = '0';
        clearResults();
        updateSampleText();
        testRunning = false;
        clearInterval(timerInterval);
    }

    function clearResults() {
        const oldMessages = resultDiv.querySelectorAll('.text-info, .text-success, .text-danger');
        oldMessages.forEach(msg => msg.remove());
    }

    function calculateCorrectWords(userInput, sampleText) {
        const userWords = userInput.trim().split(/\s+/);
        const sampleWords = sampleText.trim().split(/\s+/);
        let correct = 0;

        for (let i = 0; i < userWords.length && i < sampleWords.length; i++) {
            if (userWords[i] === sampleWords[i]) correct++;
        }

        return correct;
    }

    function displayResults() {
        const userInput = userInputElem.value.trim();
        const sampleText = currentText;
        const elapsedTime = ((endTime - startTime) / 1000);

        const correctWords = calculateCorrectWords(userInput, sampleText);
        const wpm = Math.round((correctWords / elapsedTime) * 60);

        timeSpan.textContent = elapsedTime.toFixed(2);
        wpmSpan.textContent = isNaN(wpm) ? 0 : wpm;

        const resultMessage = document.createElement('p');
        resultMessage.className = 'text-info';
        resultMessage.textContent = `You typed ${correctWords} correct words. Your WPM is ${wpm}. Difficulty: ${levelSpan.textContent}`;

        resultDiv.appendChild(resultMessage);
    }

    function updateLiveTimer() {
        const currentTime = Date.now();
        const elapsed = ((currentTime - startTime) / 1000);
        timeSpan.textContent = elapsed.toFixed(2);
    }

    function highlightLiveInput() {
        const userWords = userInputElem.value.trim().split(/\s+/);
        const sampleWords = currentText.trim().split(/\s+/);

        sampleWords.forEach((_, i) => {
            const wordSpan = document.getElementById(`word-${i}`);
            if (!wordSpan) return;

            if (userWords[i] === undefined) {
                wordSpan.style.backgroundColor = 'transparent';
            } else if (userWords[i] === sampleWords[i]) {
                wordSpan.style.backgroundColor = '#d4edda'; // green
            } else {
                wordSpan.style.backgroundColor = '#f8d7da'; // red
            }
        });
    }

    // Event Listeners
    difficultySelect.addEventListener('change', updateSampleText);
    // Remove manual stop button functionality
// stopButton.addEventListener('click', stopTest);

// Listen for Enter key to stop test
userInputElem.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // prevent newline
        if (testRunning) {
            stopTest();
        }
    }
});

    retryButton.addEventListener('click', retryTest);

    userInputElem.addEventListener('input', function () {
        if (!testRunning && userInputElem.value.trim().length > 0) {
            beginTypingTest();
        }
        highlightLiveInput();
    });

    // Init
    userInputElem.disabled = false;
    stopButton.disabled = true;
    updateSampleText();
});
