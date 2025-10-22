require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Импортируем функции из server.js
const astronomy = require('astronomy-engine');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Тестовые данные для генерации
const testCases = [
    {
        name: 'Анна',
        birthDate: '1988-03-30',
        birthTime: '09:45',
        city: 'Москва',
        lat: 55.7558,
        lon: 37.6173
    },
    {
        name: 'Мария',
        birthDate: '1992-07-15',
        birthTime: '14:30',
        city: 'Санкт-Петербург',
        lat: 59.9343,
        lon: 30.3351
    },
    {
        name: 'Екатерина',
        birthDate: '1985-11-22',
        birthTime: '08:20',
        city: 'Казань',
        lat: 55.7887,
        lon: 49.1221
    },
    {
        name: 'Ольга',
        birthDate: '1995-05-08',
        birthTime: '18:45',
        city: 'Новосибирск',
        lat: 55.0084,
        lon: 82.9357
    }
];

// Копируем функции из server.js
function calculatePlanets(date) {
    const planets = {};

    try {
        const sun = astronomy.SunPosition(date);
        planets.sun = {
            name: 'Солнце',
            longitude: sun.elon,
            latitude: sun.elat
        };

        const moonVector = astronomy.GeoMoon(date);
        planets.moon = {
            name: 'Луна',
            longitude: getLongitude(moonVector),
            latitude: getLatitude(moonVector)
        };

        const mercury = astronomy.GeoVector('Mercury', date, false);
        planets.mercury = {
            name: 'Меркурий',
            longitude: getLongitude(mercury),
            latitude: getLatitude(mercury)
        };

        const venus = astronomy.GeoVector('Venus', date, false);
        planets.venus = {
            name: 'Венера',
            longitude: getLongitude(venus),
            latitude: getLatitude(venus)
        };

        const mars = astronomy.GeoVector('Mars', date, false);
        planets.mars = {
            name: 'Марс',
            longitude: getLongitude(mars),
            latitude: getLatitude(mars)
        };

        const jupiter = astronomy.GeoVector('Jupiter', date, false);
        planets.jupiter = {
            name: 'Юпитер',
            longitude: getLongitude(jupiter),
            latitude: getLatitude(jupiter)
        };

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

function getLongitude(vector) {
    const ecliptic = astronomy.Ecliptic(vector);
    return ecliptic.elon;
}

function getLatitude(vector) {
    const ecliptic = astronomy.Ecliptic(vector);
    return ecliptic.elat;
}

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

function calculateZodiacSigns(planets) {
    const zodiacSigns = {};

    for (const [key, planet] of Object.entries(planets)) {
        zodiacSigns[key] = getZodiacSign(planet.longitude);
    }

    return zodiacSigns;
}

function calculateAspect(transit, natal) {
    let diff = Math.abs(transit - natal);
    if (diff > 180) diff = 360 - diff;
    return diff;
}

async function generateMonthlyForecastWithGPT(name, birthDate, natalPlanets, zodiacSigns, currentTransits, midTransits, startDate, endDate) {
    try {
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

        const sunAspect = calculateAspect(currentTransits.sun.longitude, natalPlanets.sun.longitude);

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
        throw error;
    }
}

// Основная функция генерации
async function generateTestForecasts() {
    console.log('Начинаем генерацию тестовых прогнозов...\n');

    // Создаем директорию для результатов
    const resultsDir = path.join(__dirname, 'examples', 'generated_forecasts');
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`\n[${i + 1}/${testCases.length}] Генерируем прогноз для ${testCase.name}...`);

        try {
            // Парсим дату рождения
            const birthDateTime = new Date(`${testCase.birthDate}T${testCase.birthTime}`);

            // Рассчитываем натальные планеты
            const natalPlanets = calculatePlanets(birthDateTime);
            const zodiacSigns = calculateZodiacSigns(natalPlanets);

            // Текущая дата и транзиты
            const now = new Date();
            const endDate = new Date(now);
            endDate.setDate(now.getDate() + 30);

            const currentTransits = calculatePlanets(now);
            const midDate = new Date(now);
            midDate.setDate(now.getDate() + 15);
            const midTransits = calculatePlanets(midDate);

            console.log(`  Натальное Солнце: ${zodiacSigns.sun.sign} ${zodiacSigns.sun.degree}°`);
            console.log(`  Натальная Луна: ${zodiacSigns.moon.sign} ${zodiacSigns.moon.degree}°`);
            console.log('  Генерируем прогноз через GPT-4o...');

            // Генерируем прогноз
            const forecast = await generateMonthlyForecastWithGPT(
                testCase.name,
                birthDateTime,
                natalPlanets,
                zodiacSigns,
                currentTransits,
                midTransits,
                now,
                endDate
            );

            // Формируем полный отчет
            const fullReport = `# Астрологический прогноз для ${testCase.name}

## Данные рождения
- **Имя:** ${testCase.name}
- **Дата рождения:** ${testCase.birthDate}
- **Время рождения:** ${testCase.birthTime}
- **Город:** ${testCase.city}

## Натальная карта
- ☉ Солнце: ${zodiacSigns.sun.sign} ${zodiacSigns.sun.degree}°
- ☽ Луна: ${zodiacSigns.moon.sign} ${zodiacSigns.moon.degree}°
- ☿ Меркурий: ${zodiacSigns.mercury.sign}
- ♀ Венера: ${zodiacSigns.venus.sign}
- ♂ Марс: ${zodiacSigns.mars.sign}
- ♃ Юпитер: ${zodiacSigns.jupiter.sign}
- ♄ Сатурн: ${zodiacSigns.saturn.sign}

## Период прогноза
${now.toLocaleDateString('ru-RU')} - ${endDate.toLocaleDateString('ru-RU')}

---

${forecast}

---

*Прогноз сгенерирован: ${new Date().toLocaleString('ru-RU')}*
*Модель: GPT-4o*
`;

            // Сохраняем в файл
            const filename = `forecast_${testCase.name.toLowerCase()}_${testCase.birthDate}.md`;
            const filepath = path.join(resultsDir, filename);
            fs.writeFileSync(filepath, fullReport, 'utf-8');

            const wordCount = forecast.split(/\s+/).length;
            console.log(`  ✓ Готово! Слов в прогнозе: ${wordCount}`);
            console.log(`  Сохранено в: ${filepath}`);

            // Небольшая пауза между запросами
            if (i < testCases.length - 1) {
                console.log('  Ждем 2 секунды перед следующим запросом...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

        } catch (error) {
            console.error(`  ✗ Ошибка при генерации прогноза для ${testCase.name}:`, error.message);
        }
    }

    console.log('\n\n✨ Генерация завершена! Результаты сохранены в examples/generated_forecasts/');
}

// Запускаем генерацию
generateTestForecasts().catch(console.error);
