import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTelegramPlane } from '@fortawesome/free-brands-svg-icons';
import { faUserPlus, faTrophy, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

// Примерные данные для участников
const sampleMembers = [
    { id: 1, name: 'Алиса', city: 'Москва', avatar: '👩' },
    { id: 2, name: 'Борис', city: 'СПб', avatar: '👨' },
    { id: 3, name: 'Виктория', city: 'Москва', avatar: '🧑‍🦰' },
    { id: 4, name: 'Григорий', city: 'Казань', avatar: '🧔' },
    { id: 5, name: 'Дарья', city: 'СПб', avatar: '👩‍🦱' },
    { id: 6, name: 'Евгений', city: 'Москва', avatar: '👨‍🦳' },
    { id: 7, name: 'Жанна', city: 'Другие', avatar: '👩‍🦲' }, // Используем "Другие"
    { id: 8, name: 'Иван', city: 'СПб', avatar: '👨‍🦱' },
    { id: 9, name: 'Ксения', city: 'Москва', avatar: '👱‍♀️' },
    { id: 10, name: 'Леонид', city: 'Новосибирск', avatar: '👴' },
];

// Примерные данные для лидерборда (просто имена и очки/км)
const sampleLeaderboard = [
    { id: 1, name: 'Алиса', score: 125 },
    { id: 5, name: 'Дарья', score: 110 },
    { id: 9, name: 'Ксения', score: 98 },
    { id: 2, name: 'Борис', score: 85 },
    { id: 6, name: 'Евгений', score: 72 },
];

// Список городов для фильтра + "Другие"
const cities = ['Москва', 'СПб', 'Казань', 'Новосибирск', 'Другие'];

// Добавляем userData в пропсы
interface ClubScreenProps {
  userData: Record<string, any>;
}

const ClubScreen: React.FC<ClubScreenProps> = ({ userData }) => {
    const [cityFilter, setCityFilter] = useState<string>('all');

    // Получаем город пользователя (пока будет undefined)
    // В будущем поле должно называться 'city' в userData
    const userCity = userData.city; 
    // Проверяем, можем ли мы отфильтровать по городу пользователя
    const canFilterByUserCity = userCity && cities.includes(userCity);

    // Стили (добавляем/обновляем)
    const cardStyle: React.CSSProperties = { backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };
    const telegramButtonStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '10px 20px', fontSize: '16px', fontWeight: 'bold', color: 'white', backgroundColor: '#0088cc', border: 'none', borderRadius: '5px', textDecoration: 'none', cursor: 'pointer', marginTop: '10px' };
    const filterButtonStyle: React.CSSProperties = { padding: '5px 10px', marginRight: '8px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '15px', background: '#f8f9fa', cursor: 'pointer', fontSize: '13px' };
    const activeFilterButtonStyle: React.CSSProperties = { ...filterButtonStyle, background: '#007bff', color: 'white', borderColor: '#007bff' };
    const disabledFilterButtonStyle: React.CSSProperties = { ...filterButtonStyle, cursor: 'not-allowed', opacity: 0.6 }; // Стиль для неактивной кнопки
    const avatarStyle: React.CSSProperties = { fontSize: '2rem', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee', margin: '3px' };
    const inviteButtonStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px 15px', fontSize: '14px', fontWeight: 'bold', color: '#198754', backgroundColor: '#d1e7dd', border: '1px solid #a3cfbb', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' };

    // Фильтруем участников
    const filteredMembers = useMemo(() => {
        if (cityFilter === 'all') return sampleMembers;
        return sampleMembers.filter(member => member.city === cityFilter);
    }, [cityFilter]);

    const handleMyCityFilter = () => {
        if (canFilterByUserCity) {
            setCityFilter(userCity);
        }
    };

    return (
        <div style={{ paddingBottom: '80px', paddingLeft: '10px', paddingRight: '10px' }}>
            <h1>Клуб Eerun</h1>

            {/* Чат Telegram */}
            <div style={cardStyle}>
                <h2>Наше сообщество</h2>
                <p>Присоединяйся к нашему закрытому чату для обмена опытом, мотивации и поиска компании для пробежек!</p>
                <a href="#" target="_blank" rel="noopener noreferrer" style={telegramButtonStyle}>
                    <FontAwesomeIcon icon={faTelegramPlane} style={{ marginRight: '10px' }} />
                    Войти в чат Telegram
                </a>
                <p style={{ fontSize: '0.8em', color: 'grey', marginTop: '15px' }}>* Чат доступен только для активных пользователей приложения.</p>
            </div>

            {/* Участники клуба */} 
            <div style={cardStyle}>
                <h2>Участники ({sampleMembers.length})</h2>
                {/* Фильтр по городам */} 
                <div style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                     <button 
                        onClick={() => setCityFilter('all')}
                        style={cityFilter === 'all' ? activeFilterButtonStyle : filterButtonStyle}
                    >Все города</button>
                    {/* Добавляем кнопку "Мой город" */} 
                    <button 
                        onClick={handleMyCityFilter} 
                        style={cityFilter === userCity ? activeFilterButtonStyle : (canFilterByUserCity ? filterButtonStyle : disabledFilterButtonStyle)} 
                        disabled={!canFilterByUserCity} // Делаем неактивной, если город не известен/не в списке
                    >
                         <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '5px' }} />
                         Мой город {userCity ? `(${userCity})` : ''} {/* Показываем город, если он есть */}
                     </button>
                    {cities.map(city => (
                         <button 
                            key={city}
                            onClick={() => setCityFilter(city)}
                            style={cityFilter === city ? activeFilterButtonStyle : filterButtonStyle}
                        >{city}</button>
                    ))}
                </div>
                {/* Сетка аватарок */} 
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {filteredMembers.length > 0 ? (
                        filteredMembers.map(member => (
                            <div key={member.id} title={member.name} style={avatarStyle}> {/* title для подсказки имени */}
                                {member.avatar}
                            </div>
                        ))
                    ) : (
                         <p style={{ width: '100%', textAlign: 'center', color: 'grey' }}>Участников из этого города пока нет.</p>
                    )}
                </div>
                 <p style={{ fontSize: '0.8em', color: 'grey', marginTop: '15px' }}>* Показаны случайные участники. Скоро здесь можно будет найти друзей!</p>
            </div>
            
            {/* Друзья */} 
            <div style={cardStyle}>
                <h2>Друзья</h2>
                <p>Пригласи друга в Eerun и получи месяц PRO-доступа бесплатно!</p>
                <button style={inviteButtonStyle} onClick={() => console.log('Пригласить друга')}>
                     <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: '8px' }} />
                     Пригласить друга
                </button>
                 <p style={{ fontSize: '0.8em', color: 'grey', marginTop: '15px' }}>* PRO-доступ откроет расширенную аналитику и кастомные планы.</p>
            </div>

            {/* Лидерборд */} 
            <div style={cardStyle}>
                 <h2><FontAwesomeIcon icon={faTrophy} /> Лидерборд недели (км)</h2>
                 {/* Простой список лидеров */} 
                 <ol style={{ paddingLeft: '20px', margin: 0 }}>
                     {sampleLeaderboard.map(user => (
                         <li key={user.id} style={{ marginBottom: '5px' }}>
                             {user.name} - {user.score} км
                         </li>
                     ))}
                 </ol>
                  <p style={{ fontSize: '0.8em', color: 'grey', marginTop: '15px' }}>* Соревнуйся с друзьями и другими участниками клуба!</p>
            </div>

            {/* Групповые пробежки (оставляем) */}
            <div style={cardStyle}>
                <h2>Групповые пробежки</h2>
                <p>🏃‍♀️ Мы работаем над организацией совместных тренировок. Анонсы - в чате!</p>
            </div>

        </div>
    );
};

export default ClubScreen; 