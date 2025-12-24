// Game State
const state = {
    initialized: false,
    level: 1,
    rank: 'E',
    hp: 100,
    maxHp: 100,
    mp: 100,
    maxMp: 100,
    debt: 187000,
    initialDebt: 187000,
    skills: {
        csharp: 0,
        gym: 0,
        willpower: 0
    },
    quests: {
        wakeUp: false,
        work: false,
        blockbench: false,
        purity: false
    },
    lastUpdate: new Date().toDateString(),
    cleanDays: 0,
    benchPress: 0,
    employmentStatus: 'searching',
    incomeHistory: []
};

// DOM Elements
const app = document.getElementById('app');
const initialSetup = document.getElementById('initial-setup');
const setupForm = document.getElementById('setup-form');
const feedbackText = document.getElementById('feedback-text');
const incomeInput = document.getElementById('income-input');
const addIncomeBtn = document.getElementById('add-income');
const debtAmount = document.getElementById('debt-amount');
const debtProgress = document.getElementById('debt-progress');
const hpBar = document.getElementById('hp-bar');
const mpBar = document.getElementById('mp-bar');
const hpValue = document.getElementById('hp-value');
const mpValue = document.getElementById('mp-value');
const playerLevel = document.getElementById('player-level');
const playerRank = document.getElementById('player-rank');
const questCheckboxes = document.querySelectorAll('#quests-list input[type="checkbox"]');

// Initialize the application
function init() {
    // Load saved state
    loadState();
    
    // Check if it's a new day
    checkNewDay();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update UI
    updateUI();
    
    // Show initial setup if not initialized
    if (!state.initialized) {
        initialSetup.classList.remove('hidden');
    } else {
        app.classList.remove('hidden');
        updateFeedback();
    }
}

// Set up event listeners
function setupEventListeners() {
    // Initial setup form
    setupForm.addEventListener('submit', handleSetupSubmit);
    
    // Add income button
    addIncomeBtn.addEventListener('click', handleAddIncome);
    
    // Quest checkboxes
    questCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleQuestToggle);
    });
    
    // Allow Enter key in income input
    incomeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddIncome();
        }
    });
}

// Handle initial setup form submission
function handleSetupSubmit(e) {
    e.preventDefault();
    
    // Get form values
    state.debt = parseInt(document.getElementById('debt').value) || 187000;
    state.initialDebt = state.debt;
    state.benchPress = parseInt(document.getElementById('bench-press').value) || 0;
    state.cleanDays = parseInt(document.getElementById('clean-days').value) || 0;
    state.employmentStatus = document.getElementById('employment').value;
    
    // Mark as initialized
    state.initialized = true;
    
    // Hide setup modal with animation
    initialSetup.style.animation = 'fadeOut 0.5s forwards';
    
    // Show main app after animation
    setTimeout(() => {
        initialSetup.classList.add('hidden');
        app.classList.remove('hidden');
        app.style.animation = 'fadeIn 0.5s forwards';
        
        // Update UI and show welcome message
        updateUI();
        showTemporaryMessage('Игра началась! Удачи в достижении целей!', 'success');
    }, 500);
    
    // Update last update time
    state.lastUpdate = new Date().toDateString();
    
    // Show welcome message
    feedbackText.textContent = 'Синхронизация завершена. Присвоен Ранг E. Начинаю процесс левелинга...';
    
    // Update UI
    updateUI();
    
    // Show feedback after a short delay
    setTimeout(updateFeedback, 2000);
}

// Handle adding income
function handleAddIncome() {
    const amount = parseInt(incomeInput.value);
    
    if (isNaN(amount) || amount <= 0) {
        showTemporaryMessage('Введите корректную сумму', 'error');
        return;
    }
    
    // Add to income history
    state.incomeHistory.push({
        amount,
        date: new Date().toISOString()
    });
    
    // Calculate amount to deduct (46,000 for living expenses)
    const livingExpenses = Math.min(46000, amount);
    const remaining = amount - livingExpenses;
    
    // Update debt
    state.debt = Math.max(0, state.debt - remaining);
    
    // Update skills based on income
    updateSkillsFromIncome(amount);
    
    // Clear input
    incomeInput.value = '';
    
    // Save state
    saveState();
    
    // Update UI
    updateUI();
    
    // Show success message
    showTemporaryMessage(`+${amount}₽ зачислено! Долг уменьшен на ${remaining}₽`);
    
    // Update feedback
    updateFeedback();
}

// Handle quest toggle
function handleQuestToggle(e) {
    const questId = e.target.id;
    const completed = e.target.checked;
    
    // Update quest status
    state.quests[questId] = completed;
    
    // Update stats based on quest completion
    updateStatsFromQuests();
    
    // Save state
    saveState();
    
    // Update UI
    updateUI();
    
    // Update feedback
    updateFeedback();
}

// Update stats based on completed quests
function updateStatsFromQuests() {
    // Reset HP/MP
    state.hp = state.maxHp;
    state.mp = state.maxMp;
    
    // Check each quest
    const completedQuests = Object.values(state.quests).filter(q => q).length;
    const totalQuests = Object.keys(state.quests).length;
    const completionRatio = completedQuests / totalQuests;
    
    // Update HP based on completion
    state.hp = Math.floor(completionRatio * state.maxHp);
    
    // Special bonuses for specific quests
    if (state.quests.wakeUp) {
        state.hp += 20; // Bonus for waking up early
    }
    
    if (state.quests.purity) {
        state.cleanDays++;
        state.skills.willpower += 2;
        state.mp += 20; // Bonus for maintaining purity
    }
    
    if (state.quests.work) {
        state.skills.csharp += 1;
    }
    
    if (state.quests.blockbench) {
        state.skills.csharp += 2; // Blockbench helps with C# skills
    }
    
    // Cap values
    state.hp = Math.min(state.hp, state.maxHp);
    state.mp = Math.min(state.mp, state.maxMp);
    
    // Update level based on skills
    updateLevel();
}

// Update skills based on income
function updateSkillsFromIncome(amount) {
    // More income = more skill points
    const skillPoints = Math.floor(amount / 10000);
    
    // Distribute points based on activity
    if (state.quests.work) {
        state.skills.csharp += skillPoints * 0.5;
    }
    
    if (state.quests.blockbench) {
        state.skills.csharp += skillPoints * 0.3;
    }
    
    // Update level based on skills
    updateLevel();
}

// Update player level based on skills
function updateLevel() {
    // Calculate total skill points
    const totalSkillPoints = Object.values(state.skills).reduce((sum, val) => sum + val, 0);
    
    // Update level based on skill points
    const newLevel = Math.floor(totalSkillPoints / 10) + 1;
    
    // Check for level up
    if (newLevel > state.level) {
        // Level up!
        const levelsGained = newLevel - state.level;
        state.level = newLevel;
        
        // Increase max HP/MP on level up
        state.maxHp += 10 * levelsGained;
        state.maxMp += 10 * levelsGained;
        state.hp = state.maxHp;
        state.mp = state.maxMp;
        
        // Show level up message
        showTemporaryMessage(`Уровень повышен до ${state.level}!`, 'level-up');
    }
    
    // Update rank based on level
    updateRank();
}

// Update player rank based on level
function updateRank() {
    const ranks = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
    const rankIndex = Math.min(Math.floor(state.level / 10), ranks.length - 1);
    state.rank = ranks[rankIndex];
}

// Update feedback text based on current state
function updateFeedback() {
    const completedQuests = Object.values(state.quests).filter(q => q).length;
    const totalQuests = Object.keys(state.quests).length;
    
    if (completedQuests === 0) {
        feedbackText.textContent = 'Игрок, твоя пассивность ведет к деградации. Выполни ежедневные задания!';
    } else if (completedQuests < totalQuests) {
        feedbackText.textContent = 'Хорошее начало, но ты можешь лучше. Продолжай выполнять квесты!';
    } else {
        feedbackText.textContent = 'Отличная работа, Игрок! Ты выполнил все квесты за сегодня. Ты на верном пути к величию!';
    }
    
    // Add motivational messages based on progress
    if (state.debt < state.initialDebt * 0.5) {
        feedbackText.textContent += ' Ты уже преодолел половину пути к финансовой свободе!';
    }
    
    if (state.cleanDays >= 30) {
        feedbackText.textContent += ' 30+ дней чистоты! Твоя сила воли растет с каждым днем.';
    }
}

// Update UI elements
function updateUI() {
    // Update HP/MP bars
    updateBar('hp', state.hp, state.maxHp);
    updateBar('mp', state.mp, state.maxMp);
    
    // Update debt info
    const debtPercentage = Math.max(0, Math.min(100, (state.debt / state.initialDebt) * 100));
    debtProgress.style.width = `${100 - debtPercentage}%`;
    debtAmount.textContent = `Долг: ${formatNumber(state.debt)}/${formatNumber(state.initialDebt)} ₽`;
    
    // Update level and rank
    playerLevel.textContent = state.level;
    playerRank.textContent = state.rank;
    
    // Update skill bars
    updateSkillBar('csharp', state.skills.csharp);
    updateSkillBar('gym', state.skills.gym);
    updateSkillBar('willpower', state.skills.willpower);
    
    // Update quest checkboxes
    questCheckboxes.forEach(checkbox => {
        checkbox.checked = state.quests[checkbox.id] || false;
    });
}

// Update a status bar
function updateBar(type, current, max) {
    const percentage = (current / max) * 100;
    const bar = document.getElementById(`${type}-bar`);
    const value = document.getElementById(`${type}-value`);
    
    if (bar) bar.style.width = `${percentage}%`;
    if (value) value.textContent = `${current}/${max}`;
    
    // Change color based on percentage
    if (bar) {
        if (percentage < 20) {
            bar.style.background = 'linear-gradient(90deg, #ff7675, #d63031)';
        } else if (percentage < 50) {
            bar.style.background = 'linear-gradient(90deg, #fdcb6e, #e17055)';
        } else {
            bar.style.background = 'linear-gradient(90deg, var(--primary), var(--secondary))';
        }
    }
}

// Update a skill bar
function updateSkillBar(skill, value) {
    const max = 100;
    const percentage = Math.min(100, (value / max) * 100);
    const bar = document.getElementById(`${skill}-bar`);
    const progress = document.getElementById(`${skill}-progress`);
    
    if (bar) bar.style.width = `${percentage}%`;
    if (progress) progress.textContent = `${Math.round(percentage)}%`;
}

// Show temporary message
function showTemporaryMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    
    // Add to DOM
    document.body.appendChild(messageEl);
    
    // Remove after delay
    setTimeout(() => {
        messageEl.classList.add('fade-out');
        setTimeout(() => messageEl.remove(), 500);
    }, 3000);
}

// Check if it's a new day and reset daily quests
function checkNewDay() {
    const today = new Date().toDateString();
    
    if (state.lastUpdate !== today) {
        // Reset daily quests
        Object.keys(state.quests).forEach(quest => {
            state.quests[quest] = false;
        });
        
        // Update last update date
        state.lastUpdate = today;
        
        // Save state
        saveState();
        
        // Show new day message
        showTemporaryMessage('Новый день - новые возможности! Проверь свои квесты.', 'info');
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('monarch_system_state', JSON.stringify(state));
}

// Load state from localStorage
function loadState() {
    const savedState = localStorage.getItem('monarch_system_state');
    
    if (savedState) {
        try {
            const parsedState = JSON.parse(savedState);
            
            // Merge with default state to ensure all properties exist
            Object.assign(state, parsedState);
            
            // Mark as initialized if we loaded a valid state
            state.initialized = true;
        } catch (e) {
            console.error('Failed to load saved state:', e);
        }
    }
}

// Format number with spaces as thousand separators
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Add CSS for messages
const style = document.createElement('style');
style.textContent = `
    .message {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        opacity: 0.95;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease-out;
    }
    
    .message.info {
        background: var(--primary);
    }
    
    .message.success {
        background: var(--success);
    }
    
    .message.error {
        background: var(--danger);
    }
    
    .message.level-up {
        background: linear-gradient(90deg, #fdcb6e, #e17055);
        font-size: 1.2em;
        padding: 15px 30px;
    }
    
    .fade-out {
        animation: fadeOut 0.5s ease-out forwards;
    }
    
    @keyframes slideIn {
        from { transform: translate(-50%, 100px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 0.95; }
    }
    
    @keyframes fadeOut {
        from { opacity: 0.95; }
        to { opacity: 0; transform: translate(-50%, -20px); }
    }
`;
document.head.appendChild(style);

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}
