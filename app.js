document.addEventListener('DOMContentLoaded', () => {
    // 1. Отримуємо всі елементи інтерфейсу
    const appContainer = document.getElementById('app');
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingStatus = document.getElementById('loadingStatus');
    const playBtn = document.getElementById('playBtn');
    const usernameInput = document.getElementById('username');
    const serverContainer = document.getElementById('serverList') || document.querySelector('.server-list');
    
    // Елементи вікна ОЗП
    const ramBtn = document.getElementById('ramBtn');
    const ramLabel = document.getElementById('ramLabel');
    const ramModal = document.getElementById('ramModal');
    const ramPresets = document.querySelectorAll('.ram-option[data-ram]');
    const ramCustomBtn = document.getElementById('ramCustomBtn');
    const customRam = document.getElementById('customRam');
    const customRamInput = document.getElementById('customRamInput');
    const ramOk = document.getElementById('ramOk');
    const ramCancel = document.getElementById('ramCancel');

    let selectedServer = null;

    // 2. ДІЗНАЄМОСЯ ОЗП КОМП'ЮТЕРА
    let maxPCMemory = 8;
    if (window.electronAPI && window.electronAPI.getTotalRAM) {
        maxPCMemory = window.electronAPI.getTotalRAM();
    }
    if (customRamInput) customRamInput.max = maxPCMemory;

    // 3. ЗАВАНТАЖУЄМО ЗБЕРЕЖЕНІ ДАНІ
    let selectedRam = 4;
    const savedUsername = localStorage.getItem('nexcraft_username');
    const savedRam = localStorage.getItem('nexcraft_ram');

    if (savedUsername && usernameInput) usernameInput.value = savedUsername;
    if (savedRam) {
        selectedRam = parseInt(savedRam, 10);
        if (selectedRam > maxPCMemory) selectedRam = maxPCMemory;
    }
    if (ramLabel) ramLabel.innerText = selectedRam;

    // 4. НАШІ СЕРВЕРИ (Тепер вони безпечно зашиті прямо в код!)
    const myServers = [
        { "name": "Локально (тест)", "host": "127.0.0.1", "port": 25565, "description": "Тестовий сервер на цьому ПК" },
        { "name": "Приклад A", "host": "mc.example.com", "port": 25565, "description": "Основний сервер виживання" }
    ];

    if (serverContainer) {
        serverContainer.innerHTML = ''; // Очищаємо текст "Завантаження..."
        myServers.forEach((server, index) => {
            const card = document.createElement('div');
            card.className = 'server-item';
            card.innerHTML = `
                <div style="cursor:pointer; width:100%;">
                    <strong style="display:block; font-size: 16px;">${server.name}</strong>
                    <span style="font-size: 12px; color: var(--muted);">${server.description}</span>
                </div>
            `;
            
            card.addEventListener('click', () => {
                document.querySelectorAll('.server-item').forEach(c => c.style.border = 'none');
                card.style.border = '1px solid var(--accent)'; // Підсвічуємо вибраний сервер
                selectedServer = server;
            });

            serverContainer.appendChild(card);
            
            // Автоматично вибираємо перший сервер у списку
            if (index === 0) card.click(); 
        });
    }

    // 5. ЛОГІКА ВІКНА ОЗП
    if (ramBtn) ramBtn.addEventListener('click', () => ramModal.classList.remove('hidden'));
    
    if (ramCancel) ramCancel.addEventListener('click', () => {
        ramModal.classList.add('hidden');
        customRam.classList.add('hidden');
    });

    ramPresets.forEach(btn => {
        btn.addEventListener('click', (e) => {
            let val = parseInt(e.target.getAttribute('data-ram'), 10);
            if (val > maxPCMemory) {
                alert(`На вашому комп'ютері всього ${maxPCMemory} ГБ ОЗП!`);
                return;
            }
            selectedRam = val;
            ramLabel.innerText = selectedRam;
            ramModal.classList.add('hidden');
        });
    });

    if (ramCustomBtn) ramCustomBtn.addEventListener('click', () => customRam.classList.remove('hidden'));

    if (ramOk) ramOk.addEventListener('click', () => {
        if (!customRam.classList.contains('hidden')) {
            let val = parseInt(customRamInput.value, 10);
            if (val > maxPCMemory) val = maxPCMemory;
            if (val < 1) val = 1;
            selectedRam = val;
            ramLabel.innerText = selectedRam;
        }
        ramModal.classList.add('hidden');
        customRam.classList.add('hidden');
    });

    // 6. ЛОГІКА КНОПКИ ГРАТИ
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            const username = usernameInput ? usernameInput.value.trim() : '';

            // Перевірки, які раніше блокували запуск
            if (!username) { alert("Будь ласка, введіть логін!"); return; }
            if (!selectedServer) { alert("Помилка: Сервер не вибрано!"); return; }

            localStorage.setItem('nexcraft_username', username);
            localStorage.setItem('nexcraft_ram', selectedRam);

            // Перехід на екран завантаження
            if (appContainer) appContainer.style.display = 'none';
            if (loadingScreen) {
                loadingScreen.classList.remove('hidden');
                loadingScreen.style.display = 'flex';
            }
            if (loadingStatus) loadingStatus.innerText = "Ініціалізація...";

            // Відправка команди в ядро (main.js)
            if (window.electronAPI && window.electronAPI.launchGame) {
                window.electronAPI.launchGame({
                    username: username,
                    ramGB: selectedRam,
                    server: selectedServer
                });
            }
        });
    }

    // 7. СТАТУСИ ВІД ЯДРА
    if (window.electronAPI && window.electronAPI.onLauncherStatus) {
        window.electronAPI.onLauncherStatus((message) => {
            if (loadingStatus) loadingStatus.innerText = message;
            
            // Якщо помилка — повертаємо назад
            if (message.startsWith('Помилка')) {
                setTimeout(() => {
                    if (loadingScreen) loadingScreen.style.display = 'none';
                    if (appContainer) appContainer.style.display = 'flex';
                    alert(message);
                }, 2000);
            }
        });
    }
});