require('dotenv').config();
const express = require('express');
const path = require('path');
const astronomy = require('astronomy-engine');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Инициализация OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

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
app.post('/api/calculate', async (req, res) => {
    try {
        const { name, city, date, time } = req.body;

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

        // Генерируем прогноз на 30 дней (асинхронно через GPT)
        const forecast = await generateForecast(name, birthDateTime, planets, zodiacSigns);

        // Сохраняем данные для последующего использования
        const chartData = {
            name,
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
        const moonVector = astronomy.GeoMoon(date);
        planets.moon = {
            name: 'Луна',
            longitude: getLongitude(moonVector),
            latitude: getLatitude(moonVector)
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
async function generateForecast(name, birthDate, planets, zodiacSigns) {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + 30);

    // Рассчитываем транзиты планет на текущую дату
    const currentTransits = calculatePlanets(now);

    // Рассчитываем транзиты планет через 15 дней (середина периода)
    const midDate = new Date(now);
    midDate.setDate(now.getDate() + 15);
    const midTransits = calculatePlanets(midDate);

    // Генерируем детальный прогноз на месяц через GPT
    const monthlyForecast = await generateMonthlyForecastWithGPT(
        name,
        birthDate,
        planets,
        zodiacSigns,
        currentTransits,
        midTransits,
        now,
        endDate
    );

    return {
        startDate: now.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        forecast: monthlyForecast
    };
}

// Генерация детального месячного прогноза через GPT-4o
async function generateMonthlyForecastWithGPT(name, birthDate, natalPlanets, zodiacSigns, currentTransits, midTransits, startDate, endDate) {
    // Если нет API ключа, используем старую функцию
    if (!process.env.OPENAI_API_KEY) {
        console.log('OpenAI API ключ не найден, используем статические прогнозы');
        return generateMonthlyForecastStatic(birthDate, natalPlanets, zodiacSigns, currentTransits, midTransits, startDate, endDate);
    }

    try {
        // Формируем данные для промпта
        const natalData = {
            sunSign: zodiacSigns.sun.sign,
            sunDegree: zodiacSigns.sun.degree,
            moonSign: zodiacSigns.moon.sign,
            moonDegree: zodiacSigns.moon.degree,
            mercurySign: zodiacSigns.mercury.sign,
            venusSign: zodiacSigns.venus.sign,
            marsSign: zodiacSigns.mars.sign,
            jupiterSign: zodiacSigns.jupiter.sign,
            saturnSign: zodiacSigns.saturn.sign
        };

        const currentTransitsData = {
            sunSign: getZodiacSign(currentTransits.sun.longitude).sign,
            sunDegree: getZodiacSign(currentTransits.sun.longitude).degree,
            moonSign: getZodiacSign(currentTransits.moon.longitude).sign,
            mercurySign: getZodiacSign(currentTransits.mercury.longitude).sign,
            venusSign: getZodiacSign(currentTransits.venus.longitude).sign,
            marsSign: getZodiacSign(currentTransits.mars.longitude).sign,
            jupiterSign: getZodiacSign(currentTransits.jupiter.longitude).sign,
            saturnSign: getZodiacSign(currentTransits.saturn.longitude).sign
        };

        // Рассчитываем основной аспект
        const sunAspect = calculateAspect(currentTransits.sun.longitude, natalPlanets.sun.longitude);

        // Промпт для GPT
        const prompt = `Персональный астрологический прогноз для ${name} на период ${startDate.toLocaleDateString('ru-RU')} - ${endDate.toLocaleDateString('ru-RU')}.

Натальная карта: Солнце ${natalData.sunSign} ${natalData.sunDegree}°, Луна ${natalData.moonSign}, Меркурий ${natalData.mercurySign}, Венера ${natalData.venusSign}, Марс ${natalData.marsSign}, Юпитер ${natalData.jupiterSign}, Сатурн ${natalData.saturnSign}.

Транзиты: Солнце ${currentTransitsData.sunSign}, Луна ${currentTransitsData.moonSign}, Меркурий ${currentTransitsData.mercurySign}, Венера ${currentTransitsData.venusSign}, Марс ${currentTransitsData.marsSign}, Юпитер ${currentTransitsData.jupiterSign}, Сатурн ${currentTransitsData.saturnSign}.

Начни "${name}, ваш астрологический прогноз готов!" и включи: введение, планетарные влияния с эмодзи, 5 сфер жизни (💼💰❤️🏥🌟), важные даты, намек на полный годовой прогноз, заключение о свободе воли. Используй термины: транзит, аспект, квадрат, тригон. Markdown.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Ты опытный астролог. Пишешь детальные персональные прогнозы на русском языке."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2500
        });

        return completion.choices[0].message.content;

    } catch (error) {
        console.error('Ошибка при генерации прогноза через GPT:', error);
        // Fallback на статический прогноз при ошибке
        return generateMonthlyForecastStatic(birthDate, natalPlanets, zodiacSigns, currentTransits, midTransits, startDate, endDate);
    }
}

// Генерация статического прогноза (fallback)
function generateMonthlyForecastStatic(birthDate, natalPlanets, zodiacSigns, currentTransits, midTransits, startDate, endDate) {
    let forecast = '';

    // Заголовок с периодом
    const startMonth = startDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    forecast += `**Астрологический прогноз на ближайший месяц (${startMonth})**\n\n`;

    // Анализ натальной карты
    const sunSign = zodiacSigns.sun.sign;
    const moonSign = zodiacSigns.moon.sign;

    forecast += `**Ваша натальная карта:**\n`;
    forecast += `Солнце в знаке ${sunSign} наделяет вас ключевыми качествами этого знака. `;
    forecast += `Луна в ${moonSign} влияет на ваш эмоциональный мир и внутренние потребности.\n\n`;

    // Основные транзиты и влияния
    forecast += `**Основные планетарные влияния:**\n\n`;

    // Солнце
    const currentSunSign = getZodiacSign(currentTransits.sun.longitude).sign;
    const midSunSign = getZodiacSign(midTransits.sun.longitude).sign;

    if (currentSunSign === midSunSign) {
        forecast += `🌞 **Солнце в ${currentSunSign}**: `;
        forecast += getSunSignInfluence(currentSunSign);
        forecast += '\n\n';
    } else {
        forecast += `🌞 **Солнце**: В начале периода Солнце находится в ${currentSunSign}, `;
        forecast += `а к середине месяца переходит в ${midSunSign}. `;
        forecast += `Это принесёт смену энергий и новые возможности для развития.\n\n`;
    }

    // Луна
    forecast += `🌙 **Луна**: В течение месяца Луна пройдёт через все знаки зодиака, `;
    forecast += `создавая различные эмоциональные фоны. Обращайте внимание на свои чувства `;
    forecast += `и интуицию - они будут особенно точны в дни, когда Луна проходит через ${moonSign}.\n\n`;

    // Меркурий
    const mercurySign = getZodiacSign(currentTransits.mercury.longitude).sign;
    forecast += `💬 **Меркурий в ${mercurySign}**: `;
    forecast += getMercuryInfluence(mercurySign);
    forecast += '\n\n';

    // Венера
    const venusSign = getZodiacSign(currentTransits.venus.longitude).sign;
    forecast += `💕 **Венера в ${venusSign}**: `;
    forecast += getVenusInfluence(venusSign);
    forecast += '\n\n';

    // Марс
    const marsSign = getZodiacSign(currentTransits.mars.longitude).sign;
    forecast += `⚡ **Марс в ${marsSign}**: `;
    forecast += getMarsInfluence(marsSign);
    forecast += '\n\n';

    // Аспекты к натальным планетам
    forecast += `**Персональные аспекты:**\n\n`;

    // Анализ транзита Солнца к натальному Солнцу
    const sunAspect = calculateAspect(currentTransits.sun.longitude, natalPlanets.sun.longitude);
    forecast += analyseSunTransit(sunAspect, currentSunSign, sunSign);
    forecast += '\n\n';

    // Общие рекомендации
    forecast += `**Рекомендации на месяц:**\n\n`;
    forecast += getMonthlyAdvice(sunSign, currentSunSign, sunAspect);

    return forecast;
}

// Вспомогательные функции для описания влияний планет
function getSunSignInfluence(sign) {
    const influences = {
        'Овен': 'Время активности, инициативы и новых начинаний. Отличный период для решительных действий.',
        'Телец': 'Период стабильности и практичности. Хорошее время для материальных дел и наслаждения жизнью.',
        'Близнецы': 'Акцент на общении, обучении и обмене информацией. Социальная активность усилится.',
        'Рак': 'Время для семьи, дома и заботы о близких. Эмоциональная чувствительность повышена.',
        'Лев': 'Период творчества, самовыражения и лидерства. Время сиять и быть в центре внимания.',
        'Дева': 'Акцент на деталях, организации и здоровье. Отличный период для наведения порядка.',
        'Весы': 'Время партнёрства, гармонии и красоты. Фокус на отношениях и балансе.',
        'Скорпион': 'Период трансформации и глубоких изменений. Время для работы с подсознанием.',
        'Стрелец': 'Расширение горизонтов, путешествия и философия. Оптимизм и стремление к росту.',
        'Козерог': 'Время структуры, ответственности и карьерных достижений. Дисциплина принесёт результаты.',
        'Водолей': 'Период инноваций, дружбы и необычных идей. Время для экспериментов.',
        'Рыбы': 'Духовность, интуиция и творческое вдохновение. Время для мечтаний и медитаций.'
    };
    return influences[sign] || 'Период благоприятен для личностного развития.';
}

function getMercuryInfluence(sign) {
    return `Коммуникация и мышление окрашены энергией ${sign}. Это влияет на то, как вы обрабатываете информацию и общаетесь с окружающими.`;
}

function getVenusInfluence(sign) {
    return `Отношения и ценности находятся под влиянием ${sign}. Обратите внимание на то, что приносит вам радость и удовольствие в этот период.`;
}

function getMarsInfluence(sign) {
    return `Ваша энергия и мотивация направлены через призму ${sign}. Это определяет, как вы действуете и отстаиваете свои интересы.`;
}

function calculateAspect(transit, natal) {
    let diff = Math.abs(transit - natal);
    if (diff > 180) diff = 360 - diff;
    return diff;
}

function analyseSunTransit(aspect, transitSign, natalSign) {
    if (aspect < 10) {
        return `Транзитное Солнце в соединении с вашим натальным Солнцем. Это время обновления энергии и новых начинаний. Отличный период для того, чтобы инициировать важные проекты.`;
    } else if (aspect > 80 && aspect < 100) {
        return `Транзитное Солнце формирует напряжённый аспект к вашему натальному Солнцу. Возможны вызовы, требующие адаптации, но они помогут вам вырасти.`;
    } else if (aspect > 110 && aspect < 130) {
        return `Транзитное Солнце в гармоничном аспекте к вашему натальному Солнцу. Энергия течёт свободно, это благоприятное время для реализации планов.`;
    } else if (aspect > 170) {
        return `Транзитное Солнце в оппозиции к вашему натальному Солнцу. Время осознания и баланса между разными сторонами вашей личности.`;
    }
    return `Транзитное Солнце движется через ${transitSign}, создавая динамичную энергию для вашего развития.`;
}

function getMonthlyAdvice(natalSunSign, currentSunSign, aspect) {
    let advice = '';

    advice += '• Используйте текущие планетарные энергии для достижения своих целей.\n';
    advice += '• Обращайте внимание на знаки судьбы и синхроничности.\n';
    advice += '• Доверяйте своей интуиции, особенно в важных решениях.\n';

    if (aspect < 30 || aspect > 330) {
        advice += '• Сейчас благоприятное время для начала новых проектов.\n';
        advice += '• Ваша жизненная энергия находится на пике - используйте её мудро.\n';
    } else if (aspect > 80 && aspect < 100) {
        advice += '• Проявите терпение при столкновении с препятствиями.\n';
        advice += '• Трудности этого периода - возможности для роста.\n';
    } else {
        advice += '• Поддерживайте баланс между действием и размышлением.\n';
        advice += '• Это время для планирования и подготовки.\n';
    }

    advice += '\nПомните: звёзды направляют, но не определяют. Ваша свобода воли всегда остаётся главной силой в вашей жизни.';

    return advice;
}

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Откройте http://localhost:${PORT} в браузере`);
});
