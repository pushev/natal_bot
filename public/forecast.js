// Загрузка данных из localStorage
const chartData = JSON.parse(localStorage.getItem('natalChartData'));

if (!chartData) {
    // Если нет данных, перенаправляем на главную страницу
    window.location.href = '/';
} else {
    // Отображаем данные натальной карты и прогноз
    displayNatalChart(chartData);
    displayMonthlyForecast(chartData);
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

// Отображение месячного прогноза
function displayMonthlyForecast(data) {
    const todayContent = document.getElementById('todayContent');
    const { forecast } = data;

    if (forecast && forecast.forecast) {
        // Форматируем период прогноза
        const startDate = new Date(forecast.startDate);
        const endDate = new Date(forecast.endDate);

        const periodText = `${startDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} - ${endDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}`;

        // Преобразуем markdown в HTML
        const forecastHtml = convertMarkdownToHtml(forecast.forecast);

        todayContent.innerHTML = `
            <div class="forecast-date">Период: ${periodText}</div>
            <div class="forecast-text">${forecastHtml}</div>
        `;
    }
}

// Улучшенный конвертер markdown в HTML
function convertMarkdownToHtml(markdown) {
    let html = markdown;

    // Заголовки третьего уровня ### Заголовок
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');

    // Заголовки второго уровня ## Заголовок
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');

    // Жирный текст **текст**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Разделяем на параграфы по двойным переводам строк
    const paragraphs = html.split('\n\n');

    html = paragraphs.map(para => {
        // Если это заголовок, не оборачиваем в <p>
        if (para.startsWith('<h2>') || para.startsWith('<h3>')) {
            return para;
        }
        // Если параграф пустой, пропускаем
        if (para.trim() === '') {
            return '';
        }
        // Заменяем одинарные переводы строк на <br>
        const withBreaks = para.replace(/\n/g, '<br>');
        return `<p>${withBreaks}</p>`;
    }).join('\n');

    return html;
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
