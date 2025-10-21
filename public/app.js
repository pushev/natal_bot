// Элементы DOM
const cityInput = document.getElementById('city');
const cityDropdown = document.getElementById('cityDropdown');
const birthForm = document.getElementById('birthForm');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');

let selectedCity = '';
let cities = [];

// Загрузка списка городов при вводе
cityInput.addEventListener('input', async (e) => {
    const search = e.target.value.trim();

    if (search.length < 2) {
        cityDropdown.classList.add('hidden');
        return;
    }

    try {
        const response = await fetch(`/api/cities?search=${encodeURIComponent(search)}`);
        cities = await response.json();

        if (cities.length > 0) {
            displayCityDropdown(cities);
        } else {
            cityDropdown.classList.add('hidden');
        }
    } catch (error) {
        console.error('Ошибка при загрузке городов:', error);
    }
});

// Отображение выпадающего списка городов
function displayCityDropdown(cities) {
    cityDropdown.innerHTML = '';

    cities.forEach(city => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = city.name;
        item.addEventListener('click', () => {
            cityInput.value = city.name;
            selectedCity = city.name;
            cityDropdown.classList.add('hidden');
        });
        cityDropdown.appendChild(item);
    });

    cityDropdown.classList.remove('hidden');
}

// Закрытие выпадающего списка при клике вне его
document.addEventListener('click', (e) => {
    if (e.target !== cityInput && e.target !== cityDropdown) {
        cityDropdown.classList.add('hidden');
    }
});

// Обработка отправки формы
birthForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const city = cityInput.value.trim();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    if (!city || !date || !time) {
        showError('Пожалуйста, заполните все поля');
        return;
    }

    // Показываем индикатор загрузки
    loadingDiv.classList.remove('hidden');
    errorDiv.classList.add('hidden');
    birthForm.classList.add('hidden');

    try {
        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ city, date, time })
        });

        if (!response.ok) {
            throw new Error('Ошибка при расчёте');
        }

        const result = await response.json();

        if (result.success) {
            // Сохраняем данные в localStorage
            localStorage.setItem('natalChartData', JSON.stringify(result.data));

            // Переходим на страницу прогноза
            window.location.href = '/forecast.html';
        } else {
            throw new Error(result.error || 'Ошибка при расчёте');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showError('Произошла ошибка при расчёте. Пожалуйста, попробуйте ещё раз.');
        loadingDiv.classList.add('hidden');
        birthForm.classList.remove('hidden');
    }
});

// Отображение ошибки
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
}

// Установка максимальной даты (сегодня)
const today = new Date().toISOString().split('T')[0];
document.getElementById('date').setAttribute('max', today);
