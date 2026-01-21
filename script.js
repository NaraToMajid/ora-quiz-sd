// Game State
let daftarSoal = [];
let indexSoal = 0;
let jawabanBenar = "";
let totalSoal = 0;
let score = 0;
let correctCount = 0;
let wrongCount = 0;
let selectedOption = null;
let currentSubject = "matematika";

// DOM Elements
const soalElement = document.getElementById('soal');
const optionsGrid = document.getElementById('options-grid');
const submitBtn = document.getElementById('submit-btn');
const nextBtn = document.getElementById('next-btn');
const resultPanel = document.getElementById('result-panel');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');
const resultCorrectAnswer = document.getElementById('result-correct-answer');
const scoreElement = document.getElementById('score');
const correctElement = document.getElementById('correct');
const wrongElement = document.getElementById('wrong');
const mapelSelect = document.getElementById('mapel');
const progressText = document.getElementById('progress-text');
const progressBar = document.getElementById('progress-bar');
const gameContainer = document.querySelector('.game-container');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Setup event listeners
    submitBtn.addEventListener('click', submitJawaban);
    nextBtn.addEventListener('click', soalBerikutnya);
    mapelSelect.addEventListener('change', function() {
        currentSubject = this.value;
        updateSubjectTheme();
        mulaiQuiz();
    });
    
    // Load initial quiz
    mulaiQuiz();
});

// Update subject theme
function updateSubjectTheme() {
    gameContainer.className = 'game-container';
    gameContainer.classList.add(`subject-${currentSubject}`);
}

// Start quiz
async function mulaiQuiz() {
    // Reset state
    resetGameState();
    
    // Show loading
    soalElement.innerHTML = `
        <div class="loading">
            <div class="loading-text">Memuat ${currentSubject.toUpperCase()}...</div>
            <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;

    optionsGrid.innerHTML = '';
    updateSubjectTheme();

    try {
        const res = await fetch(
            `https://api.siputzx.my.id/api/games/cc-sd?matapelajaran=${currentSubject}&jumlahsoal=10`,
            { cache: "no-store" }
        );

        const json = await res.json();
        console.log("API Response:", json);

        daftarSoal = json.data.soal || [];
        indexSoal = 0;
        totalSoal = daftarSoal.length;

        if (daftarSoal.length === 0) {
            throw new Error("Tidak ada soal tersedia");
        }

        // Display first question
        tampilkanSoal();

    } catch (err) {
        console.error("Error:", err);
        soalElement.innerHTML = `
            <div style="text-align: center; color: #f44336; padding: 8px;">
                <div style="margin-bottom: 6px; font-size: 12px; font-weight: 700;">⚠️ Gagal memuat soal</div>
                <button onclick="mulaiQuiz()" style="background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-family: 'Poppins'; cursor: pointer; font-size: 10px; font-weight: 700; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
                    Coba Lagi
                </button>
            </div>
        `;
        submitBtn.disabled = true;
        nextBtn.disabled = true;
    }
}

// Display question
function tampilkanSoal() {
    if (indexSoal >= totalSoal) {
        tampilkanSelesai();
        return;
    }

    const soal = daftarSoal[indexSoal];
    jawabanBenar = soal.jawaban_benar;

    // Update progress
    progressText.textContent = `Soal: ${indexSoal + 1}/${totalSoal}`;
    progressBar.style.width = `${((indexSoal + 1) / totalSoal) * 100}%`;

    // Display question
    soalElement.innerHTML = `<div class="question-text">${soal.pertanyaan}</div>`;

    // Clear and display options
    optionsGrid.innerHTML = '';
    selectedOption = null;

    const letters = ['A', 'B', 'C', 'D'];
    let optionIndex = 0;

    soal.semua_jawaban.forEach(obj => {
        const key = Object.keys(obj)[0];
        const value = obj[key];

        const optionItem = document.createElement('div');
        optionItem.className = 'option-item';
        optionItem.dataset.value = key;
        
        optionItem.innerHTML = `
            <div class="option-letter">${letters[optionIndex]}</div>
            <div class="option-text">${value}</div>
            <input type="radio" name="jawaban" value="${key}" id="option-${optionIndex}">
        `;

        optionItem.addEventListener('click', function() {
            selectOption(this);
        });

        optionsGrid.appendChild(optionItem);
        optionIndex++;
    });

    // Reset result panel
    resetResultPanel();
    
    // Update button states
    submitBtn.disabled = true;
    nextBtn.disabled = true;
    
    // Re-enable options click
    document.querySelectorAll('.option-item').forEach(item => {
        item.style.pointerEvents = 'auto';
    });
}

// Select option
function selectOption(optionElement) {
    // Deselect all options
    document.querySelectorAll('.option-item').forEach(item => {
        item.classList.remove('selected');
    });

    // Select clicked option
    optionElement.classList.add('selected');
    selectedOption = optionElement.dataset.value;
    
    // Enable submit button
    submitBtn.disabled = false;
}

// Submit answer
function submitJawaban() {
    if (!selectedOption || !jawabanBenar) return;

    // Disable options
    document.querySelectorAll('.option-item').forEach(item => {
        item.style.pointerEvents = 'none';
    });

    // Check answer
    const isCorrect = selectedOption === jawabanBenar;
    
    // Update stats
    if (isCorrect) {
        score += 10;
        correctCount++;
        showResult('✅ BENAR!', 'Jawaban tepat!', true);
    } else {
        wrongCount++;
        showResult('❌ SALAH!', 'Jawaban benar:', false);
    }

    // Update displays
    scoreElement.textContent = score;
    correctElement.textContent = correctCount;
    wrongElement.textContent = wrongCount;
    
    // Update button states
    submitBtn.disabled = true;
    nextBtn.disabled = false;
    nextBtn.focus();
    
    // Highlight correct answer
    highlightCorrectAnswer();
}

// Show result
function showResult(title, message, isCorrect) {
    resultTitle.textContent = title;
    resultMessage.textContent = message;
    
    if (!isCorrect) {
        resultCorrectAnswer.textContent = jawabanBenar.toUpperCase();
    } else {
        resultCorrectAnswer.textContent = '';
    }

    // Animation
    if (isCorrect) {
        resultPanel.style.animation = 'correctAnswer 0.5s ease';
    } else {
        resultPanel.style.animation = 'wrongAnswer 0.3s ease';
    }

    setTimeout(() => {
        resultPanel.style.animation = '';
    }, 500);
}

// Highlight correct answer
function highlightCorrectAnswer() {
    document.querySelectorAll('.option-item').forEach(item => {
        if (item.dataset.value === jawabanBenar) {
            item.style.background = '#4caf50';
            item.style.borderColor = '#4caf50';
            item.querySelector('.option-text').style.color = 'white';
            item.querySelector('.option-letter').style.background = 'white';
            item.querySelector('.option-letter').style.color = '#4caf50';
        } else if (item.classList.contains('selected')) {
            item.style.background = '#f44336';
            item.style.borderColor = '#f44336';
        }
    });
}

// Next question
function soalBerikutnya() {
    indexSoal++;
    
    if (indexSoal < totalSoal) {
        tampilkanSoal();
    } else {
        tampilkanSelesai();
    }
}

// Show completion screen
function tampilkanSelesai() {
    const accuracy = totalSoal > 0 ? Math.round((correctCount / totalSoal) * 100) : 0;
    
    soalElement.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <div style="font-size: 16px; font-weight: 900; color: #667eea; margin-bottom: 6px; line-height: 1.1;">🎉 Selesai!</div>
            <div style="font-size: 12px; color: #666; line-height: 1.2;">
                Semua soal terjawab
            </div>
        </div>
    `;

    optionsGrid.innerHTML = '';
    
    resultTitle.textContent = '🏆 SELESAI';
    resultMessage.textContent = `Benar: ${correctCount}/${totalSoal}`;
    resultCorrectAnswer.textContent = `Akurasi: ${accuracy}%`;
    
    progressText.textContent = 'Quiz Selesai';
    progressBar.style.width = '100%';
    
    submitBtn.disabled = true;
    nextBtn.disabled = false;
    nextBtn.textContent = 'Ulangi Quiz';
    
    // Update next button handler for restart
    nextBtn.onclick = function() {
        mulaiQuiz();
        nextBtn.textContent = 'Lanjut';
        nextBtn.onclick = soalBerikutnya;
    };
}

// Reset result panel
function resetResultPanel() {
    resultTitle.textContent = '⏳ Pilih Jawaban';
    resultMessage.textContent = 'Pilih salah satu jawaban';
    resultCorrectAnswer.textContent = '';
}

// Reset game state
function resetGameState() {
    indexSoal = 0;
    score = 0;
    correctCount = 0;
    wrongCount = 0;
    selectedOption = null;
    
    scoreElement.textContent = '0';
    correctElement.textContent = '0';
    wrongElement.textContent = '0';
    
    progressText.textContent = 'Soal: 0/0';
    progressBar.style.width = '0%';
    
    submitBtn.disabled = true;
    nextBtn.disabled = true;
    nextBtn.textContent = 'Lanjut';
    nextBtn.onclick = soalBerikutnya;
}

// Initial load
updateSubjectTheme();
