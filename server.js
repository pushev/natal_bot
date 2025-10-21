const express = require('express');
const path = require('path');
const astronomy = require('astronomy-engine');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Справочник городов России
const cities = require('./data/cities.json');

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API для получения списка городов
app.get('/api/cities', (req, res) => {
    const search = req.query.search ? req.query.search.toLowerCase() : '';
    const filtered = cities.filter(city =>
        city.name.toLowerCase().includes(search)
    );
    res.json(filtered.slice(0, 50)); // Ограничим до 50 результатов
});

// API для расчёта натальной карты
app.post('/api/calculate', (req, res) => {
    try {
        const { city, date, time } = req.body;

        // Найти город в справочнике
        const selectedCity = cities.find(c => c.name === city);
        if (!selectedCity) {
            return res.status(400).json({ error: 'Город не найден' });
        }

        // Парсим дату и время
        const birthDateTime = new Date(`${date}T${time}`);

        // Рассчитываем положения планет
        const planets = calculatePlanets(birthDateTime);

        // Рассчитываем знаки зодиака
        const zodiacSigns = calculateZodiacSigns(planets);

        // Рассчитываем дома (упрощённо, без учёта времени суток)
        const houses = calculateHouses(birthDateTime, selectedCity.lat, selectedCity.lon);

        // Генерируем прогноз на 30 дней
        const forecast = generateForecast(birthDateTime, planets, zodiacSigns);

        // Сохраняем данные для последующего использования
        const chartData = {
            city: selectedCity,
            birthDate: birthDateTime,
            planets,
            zodiacSigns,
            houses,
            forecast
        };

        res.json({
            success: true,
            data: chartData
        });

    } catch (error) {
        console.error('Ошибка при расчёте:', error);
        res.status(500).json({ error: 'Ошибка при расчёте натальной карты' });
    }
});

// Функция расчёта положений планет
function calculatePlanets(date) {
    const planets = {};

    try {
        // Солнце
        const sun = astronomy.SunPosition(date);
        planets.sun = {
            name: 'Солнце',
            longitude: sun.elon,
            latitude: sun.elat
        };

        // Луна
        const moon = astronomy.GeoMoon(date);
        planets.moon = {
            name: 'Луна',
            longitude: moon.lon,
            latitude: moon.lat
        };

        // Меркурий
        const mercury = astronomy.GeoVector('Mercury', date, false);
        planets.mercury = {
            name: 'Меркурий',
            longitude: getLongitude(mercury),
            latitude: getLatitude(mercury)
        };

        // Венера
        const venus = astronomy.GeoVector('Venus', date, false);
        planets.venus = {
            name: 'Венера',
            longitude: getLongitude(venus),
            latitude: getLatitude(venus)
        };

        // Марс
        const mars = astronomy.GeoVector('Mars', date, false);
        planets.mars = {
            name: 'Марс',
            longitude: getLongitude(mars),
            latitude: getLatitude(mars)
        };

        // Юпитер
        const jupiter = astronomy.GeoVector('Jupiter', date, false);
        planets.jupiter = {
            name: 'Юпитер',
            longitude: getLongitude(jupiter),
            latitude: getLatitude(jupiter)
        };

        // Сатурн
        const saturn = astronomy.GeoVector('Saturn', date, false);
        planets.saturn = {
            name: 'Сатурн',
            longitude: getLongitude(saturn),
            latitude: getLatitude(saturn)
        };

    } catch (error) {
        console.error('Ошибка при расчёте планет:', error);
    }

    return planets;
}

// Вспомогательные функции для конвертации координат
function getLongitude(vector) {
    const ecliptic = astronomy.Ecliptic(vector);
    return ecliptic.elon;
}

function getLatitude(vector) {
    const ecliptic = astronomy.Ecliptic(vector);
    return ecliptic.elat;
}

// Функция определения знака зодиака по долготе
function getZodiacSign(longitude) {
    const signs = [
        'Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева',
        'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы'
    ];

    const normalizedLon = ((longitude % 360) + 360) % 360;
    const signIndex = Math.floor(normalizedLon / 30);
    const degree = normalizedLon % 30;

    return {
        sign: signs[signIndex],
        degree: degree.toFixed(2)
    };
}

// Функция расчёта знаков зодиака для планет
function calculateZodiacSigns(planets) {
    const zodiacSigns = {};

    for (const [key, planet] of Object.entries(planets)) {
        zodiacSigns[key] = getZodiacSign(planet.longitude);
    }

    return zodiacSigns;
}

// Функция расчёта домов (упрощённая)
function calculateHouses(date, lat, lon) {
    const houses = [];
    const ascendant = calculateAscendant(date, lat, lon);

    // Упрощённый расчёт 12 домов (система Placidus упрощена)
    for (let i = 0; i < 12; i++) {
        const houseLongitude = (ascendant + i * 30) % 360;
        houses.push({
            number: i + 1,
            longitude: houseLongitude,
            sign: getZodiacSign(houseLongitude).sign
        });
    }

    return houses;
}

// Упрощённый расчёт асцендента
function calculateAscendant(date, lat, lon) {
    const siderealTime = getSiderealTime(date, lon);
    // Упрощённая формула (в реальности нужен более сложный расчёт)
    const ascendant = (siderealTime * 15 + lon) % 360;
    return ascendant;
}

// Расчёт звёздного времени
function getSiderealTime(date, lon) {
    const J2000 = new Date('2000-01-01T12:00:00Z');
    const daysSinceJ2000 = (date - J2000) / (1000 * 60 * 60 * 24);
    const T = daysSinceJ2000 / 36525;

    const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    const ST = (6.697374558 + 0.06570982441908 * daysSinceJ2000 + 1.00273790935 * hours + lon / 15) % 24;

    return ST;
}

// Функция генерации прогноза
function generateForecast(birthDate, planets, zodiacSigns) {
    const forecasts = [];
    const now = new Date();

    // Генерируем прогнозы на 30 дней
    for (let i = 0; i < 30; i++) {
        const forecastDate = new Date(now);
        forecastDate.setDate(now.getDate() + i);

        // Рассчитываем транзиты планет на эту дату
        const transitPlanets = calculatePlanets(forecastDate);

        // Генерируем текст прогноза на основе транзитов
        const forecastText = generateForecastText(
            i,
            transitPlanets,
            planets,
            zodiacSigns
        );

        forecasts.push({
            date: forecastDate.toISOString().split('T')[0],
            day: i + 1,
            text: forecastText,
            isToday: i === 0
        });
    }

    return forecasts;
}

// Генерация текста прогноза
function generateForecastText(dayIndex, transitPlanets, natalPlanets, zodiacSigns) {
    const templates = {
        positive: [
            'Отличный день для новых начинаний!',
            'Энергия планет благоприятствует вашим планам.',
            'Сегодня вы почувствуете прилив сил и вдохновения.',
            'Благоприятный день для общения и новых знакомств.',
            'Ваша интуиция будет особенно сильна сегодня.'
        ],
        neutral: [
            'День подходит для решения повседневных задач.',
            'Стабильный период, подходящий для планирования.',
            'Умеренная активность планет создаёт спокойную атмосферу.',
            'День благоприятен для размышлений и анализа.',
            'Хорошее время для работы над долгосрочными проектами.'
        ],
        challenging: [
            'Будьте внимательны к деталям сегодня.',
            'День может принести неожиданные повороты.',
            'Рекомендуется проявить осторожность в принятии решений.',
            'Энергия планет требует от вас терпения.',
            'Избегайте конфликтных ситуаций сегодня.'
        ]
    };

    // Упрощённая логика выбора типа прогноза
    const sunSign = zodiacSigns.sun.sign;
    const transitSunLon = transitPlanets.sun.longitude;
    const natalSunLon = natalPlanets.sun.longitude;

    // Рассчитываем аспект между транзитным и натальным Солнцем
    const aspect = Math.abs(transitSunLon - natalSunLon) % 360;

    let category;
    if (aspect < 30 || aspect > 330 || (aspect > 110 && aspect < 130)) {
        category = 'positive'; // Соединение или трин
    } else if ((aspect > 80 && aspect < 100) || (aspect > 170 && aspect < 190)) {
        category = 'challenging'; // Квадрат или оппозиция
    } else {
        category = 'neutral';
    }

    const randomIndex = Math.floor(Math.random() * templates[category].length);
    let forecast = templates[category][randomIndex];

    // Добавляем информацию о знаке зодиака Солнца
    const transitSunSign = getZodiacSign(transitSunLon).sign;
    forecast += ` Солнце сегодня в знаке ${transitSunSign}.`;

    // Добавляем совет на основе положения Луны
    const transitMoonSign = getZodiacSign(transitPlanets.moon.longitude).sign;
    forecast += ` Луна в знаке ${transitMoonSign} способствует `;

    const moonAdvice = {
        'Овен': 'активным действиям и решительности.',
        'Телец': 'практичности и заботе о материальном благополучии.',
        'Близнецы': 'общению и обмену информацией.',
        'Рак': 'заботе о близких и домашним делам.',
        'Лев': 'творчеству и самовыражению.',
        'Дева': 'организации и вниманию к деталям.',
        'Весы': 'гармонии в отношениях и эстетике.',
        'Скорпион': 'глубоким размышлениям и трансформации.',
        'Стрелец': 'расширению горизонтов и обучению.',
        'Козерог': 'целеустремлённости и карьерным достижениям.',
        'Водолей': 'новаторству и общению с друзьями.',
        'Рыбы': 'интуиции и духовным практикам.'
    };

    forecast += moonAdvice[transitMoonSign] || 'позитивному настрою.';

    return forecast;
}

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Откройте http://localhost:${PORT} в браузере`);
});
