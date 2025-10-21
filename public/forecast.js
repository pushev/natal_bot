// Загрузка данных из localStorage
const chartData = JSON.parse(localStorage.getItem('natalChartData'));

if (!chartData) {
    // Если нет данных, перенаправляем на главную страницу
    window.location.href = '/';
} else {
    // Отображаем данные натальной карты и прогноз
    displayNatalChart(chartData);
    displayTodayForecast(chartData);
    displayAdditionalForecasts(chartData);
}

// Отображение натальной карты
function displayNatalChart(data) {
    const chartInfo = document.getElementById('chartInfo');
    const { planets, zodiacSigns, city, birthDate } = data;

    // Информация о дате и месте рождения
    const birthInfo = document.createElement('div');
    birthInfo.className = 'planet-info';
    birthInfo.innerHTML = `
        <div class="planet-name">Дата рождения</div>
        <div class="planet-position">${formatDate(birthDate)}</div>
        <div class="planet-position">${city.name}</div>
    `;
    chartInfo.appendChild(birthInfo);

    // Отображение планет и их положений
    const planetOrder = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

    planetOrder.forEach(key => {
        if (planets[key] && zodiacSigns[key]) {
            const planetDiv = document.createElement('div');
            planetDiv.className = 'planet-info';

            planetDiv.innerHTML = `
                <div class="planet-name">${planets[key].name}</div>
                <div class="planet-position">
                    ${zodiacSigns[key].sign} ${Math.floor(zodiacSigns[key].degree)}°
                </div>
            `;

            chartInfo.appendChild(planetDiv);
        }
    });
}

// Отображение прогноза на сегодня
function displayTodayForecast(data) {
    const todayContent = document.getElementById('todayContent');
    const { forecast } = data;

    // Находим прогноз на сегодня
    const todayForecast = forecast.find(f => f.isToday);

    if (todayForecast) {
        todayContent.innerHTML = `
            <div class="forecast-date">${formatDateRu(todayForecast.date)}</div>
            <div class="forecast-text">${todayForecast.text}</div>
        `;
    }
}

// Отображение дополнительных прогнозов (следующие 7 дней как превью)
function displayAdditionalForecasts(data) {
    const forecastList = document.getElementById('forecastList');
    const { forecast } = data;

    // Показываем только следующие 7 дней после сегодня
    const nextDaysForecasts = forecast.slice(1, 8);

    nextDaysForecasts.forEach(f => {
        const forecastDiv = document.createElement('div');
        forecastDiv.className = 'forecast-preview';

        // Укорачиваем текст для превью
        const previewText = f.text.split('.')[0] + '...';

        forecastDiv.innerHTML = `
            <div class="forecast-preview-date">${formatDateRu(f.date)} (День ${f.day})</div>
            <div class="forecast-preview-text">${previewText}</div>
        `;

        forecastList.appendChild(forecastDiv);
    });

    document.getElementById('additionalForecasts').classList.remove('hidden');
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Форматирование даты на русском
function formatDateRu(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Обработка кнопки покупки
document.getElementById('buyButton').addEventListener('click', () => {
    alert('Спасибо за интерес! Функция покупки будет доступна в ближайшее время. Свяжитесь с нами для получения полного прогноза на год.');
});
