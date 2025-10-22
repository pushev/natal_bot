require('dotenv').config();
const astronomy = require('astronomy-engine');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

function calculatePlanets(date) {
    const planets = {};
    try {
        const sun = astronomy.SunPosition(date);
        planets.sun = { name: 'Солнце', longitude: sun.elon, latitude: sun.elat };

        const moonVector = astronomy.GeoMoon(date);
        planets.moon = { name: 'Луна', longitude: getLongitude(moonVector), latitude: getLatitude(moonVector) };

        const mercury = astronomy.GeoVector('Mercury', date, false);
        planets.mercury = { name: 'Меркурий', longitude: getLongitude(mercury), latitude: getLatitude(mercury) };

        const venus = astronomy.GeoVector('Venus', date, false);
        planets.venus = { name: 'Венера', longitude: getLongitude(venus), latitude: getLatitude(venus) };

        const mars = astronomy.GeoVector('Mars', date, false);
        planets.mars = { name: 'Марс', longitude: getLongitude(mars), latitude: getLatitude(mars) };

        const jupiter = astronomy.GeoVector('Jupiter', date, false);
        planets.jupiter = { name: 'Юпитер', longitude: getLongitude(jupiter), latitude: getLatitude(jupiter) };

        const saturn = astronomy.GeoVector('Saturn', date, false);
        planets.saturn = { name: 'Сатурн', longitude: getLongitude(saturn), latitude: getLatitude(saturn) };
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
    const signs = ['Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева', 'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы'];
    const normalizedLon = ((longitude % 360) + 360) % 360;
    const signIndex = Math.floor(normalizedLon / 30);
    const degree = normalizedLon % 30;
    return { sign: signs[signIndex], degree: degree.toFixed(2) };
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

function getAspectType(aspect) {
    if (aspect < 8) return 'соединение (0°)';
    if (aspect >= 52 && aspect <= 68) return 'секстиль (60°) - гармоничный';
    if (aspect >= 82 && aspect <= 98) return 'квадрат (90°) - напряженный';
    if (aspect >= 112 && aspect <= 128) return 'тригон (120°) - гармоничный';
    if (aspect >= 172) return 'оппозиция (180°) - напряженный';
    return `${Math.round(aspect)}°`;
}

async function testForecast() {
    console.log('🧪 ТЕСТИРОВАНИЕ ГЕНЕРАЦИИ ПРОГНОЗА\n');

    // Тестовые данные
    const name = 'Анна';
    const birthDate = new Date('1988-03-30T09:45');
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + 30);

    console.log(`👤 Клиент: ${name}`);
    console.log(`📅 Дата рождения: ${birthDate.toLocaleDateString('ru-RU')}`);
    console.log(`⏰ Период прогноза: ${now.toLocaleDateString('ru-RU')} - ${endDate.toLocaleDateString('ru-RU')}\n`);

    // Расчеты
    const natalPlanets = calculatePlanets(birthDate);
    const zodiacSigns = calculateZodiacSigns(natalPlanets);
    const currentTransits = calculatePlanets(now);

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
        moonSign: getZodiacSign(currentTransits.moon.longitude).sign,
        mercurySign: getZodiacSign(currentTransits.mercury.longitude).sign,
        venusSign: getZodiacSign(currentTransits.venus.longitude).sign,
        marsSign: getZodiacSign(currentTransits.mars.longitude).sign,
        jupiterSign: getZodiacSign(currentTransits.jupiter.longitude).sign,
        saturnSign: getZodiacSign(currentTransits.saturn.longitude).sign
    };

    const sunAspect = calculateAspect(currentTransits.sun.longitude, natalPlanets.sun.longitude);

    console.log('🔮 АСТРОЛОГИЧЕСКИЕ ДАННЫЕ:');
    console.log(`   Натальное Солнце: ${natalData.sunSign} ${natalData.sunDegree}°`);
    console.log(`   Натальная Луна: ${natalData.moonSign} ${natalData.moonDegree}°`);
    console.log(`   Транзитное Солнце: ${currentTransitsData.sunSign}`);
    console.log(`   Аспект Солнце: ${getAspectType(sunAspect)}\n`);

    // Промпт
    const prompt = `Персональный астрологический прогноз для ${name} на период ${now.toLocaleDateString('ru-RU')} - ${endDate.toLocaleDateString('ru-RU')}.

Натальная карта: Солнце ${natalData.sunSign} ${natalData.sunDegree}°, Луна ${natalData.moonSign}, Меркурий ${natalData.mercurySign}, Венера ${natalData.venusSign}, Марс ${natalData.marsSign}, Юпитер ${natalData.jupiterSign}, Сатурн ${natalData.saturnSign}.

Транзиты: Солнце ${currentTransitsData.sunSign}, Луна ${currentTransitsData.moonSign}, Меркурий ${currentTransitsData.mercurySign}, Венера ${currentTransitsData.venusSign}, Марс ${currentTransitsData.marsSign}, Юпитер ${currentTransitsData.jupiterSign}, Сатурн ${currentTransitsData.saturnSign}.

Начни "${name}, ваш астрологический прогноз готов!" и включи: введение, планетарные влияния с эмодзи, 5 сфер жизни (💼💰❤️🏥🌟), важные даты, намек на полный годовой прогноз, заключение о свободе воли. Используй термины: транзит, аспект, квадрат, тригон. Markdown.`;

    console.log('📨 ОТПРАВКА ЗАПРОСА К GPT-4o...\n');

    try {
        const startTime = Date.now();

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

        const endTime = Date.now();
        const forecast = completion.choices[0].message.content;
        const wordCount = forecast.split(/\s+/).length;

        console.log('✅ ПРОГНОЗ ПОЛУЧЕН!\n');
        console.log(`⏱️  Время генерации: ${((endTime - startTime) / 1000).toFixed(2)} сек`);
        console.log(`📝 Количество слов: ${wordCount}`);
        console.log(`🔤 Количество символов: ${forecast.length}\n`);
        console.log('─'.repeat(80));
        console.log('\n📄 ТЕКСТ ПРОГНОЗА:\n');
        console.log(forecast);
        console.log('\n' + '─'.repeat(80));

        // Проверки
        console.log('\n✓ ПРОВЕРКИ:');
        console.log(`   ${forecast.includes(name) ? '✅' : '❌'} Есть персонализация (имя ${name})`);
        console.log(`   ${forecast.includes('💼') || forecast.includes('💰') || forecast.includes('❤️') ? '✅' : '❌'} Есть эмодзи для сфер жизни`);
        console.log(`   ${forecast.includes('транзит') || forecast.includes('аспект') ? '✅' : '❌'} Используются астрологические термины`);
        console.log(`   ${wordCount >= 400 ? '✅' : '❌'} Объем прогноза достаточный (${wordCount} слов)`);
        console.log(`   ${!forecast.includes('Извините') && !forecast.includes('Sorry') ? '✅' : '❌'} Нет отказа от генерации\n`);

    } catch (error) {
        console.error('❌ ОШИБКА:', error.message);
        throw error;
    }
}

testForecast().catch(console.error);
