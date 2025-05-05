import React, { useState, useMemo } from 'react';

// Потребуется samplePlan для расчета длительности
// В идеале, план и дата старта должны приходить из App.tsx или context,
// но для MVP дублируем/рассчитываем здесь.
const samplePlan = [
  { week: 1, day: 1, type: 'Чередование', description: '2 мин бег / 3 мин ходьба, 5 повторений' }, { week: 1, day: 2, type: 'Отдых', description: '-' }, { week: 1, day: 3, type: 'Чередование', description: '3 мин бег / 3 мин ходьба, 4 повторения' }, { week: 1, day: 4, type: 'Отдых', description: '-' }, { week: 1, day: 5, type: 'Легкая ходьба', description: '30 минут' }, { week: 1, day: 6, type: 'Отдых', description: '-' }, { week: 1, day: 7, type: 'Отдых', description: '-' },
  { week: 2, day: 1, type: 'Чередование', description: '3 мин бег / 2 мин ходьба, 5 повторений' }, { week: 2, day: 2, type: 'Отдых', description: '-' }, { week: 2, day: 3, type: 'Чередование', description: '4 мин бег / 2 мин ходьба, 4 повторения' }, { week: 2, day: 4, type: 'Отдых', description: '-' }, { week: 2, day: 5, type: 'Легкий бег', description: '15-20 минут' }, { week: 2, day: 6, type: 'Отдых', description: '-' }, { week: 2, day: 7, type: 'Отдых', description: '-' },
  { week: 3, day: 1, type: 'Чередование', description: '5 мин бег / 2 мин ходьба, 4 повторения' }, { week: 3, day: 2, type: 'Отдых', description: '-' }, { week: 3, day: 3, type: 'Чередование', description: '6 мин бег / 2 мин ходьба, 3 повторения' }, { week: 3, day: 4, type: 'Отдых', description: '-' }, { week: 3, day: 5, type: 'Легкий бег', description: '20-25 минут' }, { week: 3, day: 6, type: 'Отдых', description: '-' }, { week: 3, day: 7, type: 'Отдых', description: '-' },
];

// Примерные данные для стартов
const sampleStarts = [
    { id: 1, name: 'Московский Марафон', location: 'Москва', month: 'Сентябрь', distances: ['10k', '42k'], registeredUsersCount: 15 },
    { id: 2, name: 'Забег "Белые Ночи"', location: 'СПб', month: 'Июнь', distances: ['10k', '21k'], registeredUsersCount: 8 },
    { id: 3, name: 'Серия "Бегом по Золотому Кольцу"', location: 'Разные города', month: 'Лето', distances: ['5k', '10k', '21k'], registeredUsersCount: 25 },
    { id: 4, name: 'Онлайн-забег "Бегу к цели"', location: 'Онлайн', month: 'Круглый год', distances: ['5k', '10k'], registeredUsersCount: 5 },
    { id: 5, name: 'Парковый забег "5 верст"', location: 'Многие парки', month: 'Каждую субботу', distances: ['5k'], registeredUsersCount: 42 },
    { id: 6, name: 'Тушинский полумарафон', location: 'Москва', month: 'Август', distances: ['21k'], registeredUsersCount: 3 },
];

// Тип для фильтра дистанции
type DistanceFilter = 'all' | '5k' | '10k' | '21k';

// Хелпер для форматирования даты
const formatDateFull = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
};

// Компонент теперь принимает userData
interface GoalsScreenProps {
  userData: Record<string, any>;
}

// Функция для получения начального фильтра
const getInitialFilter = (goal: string | undefined): DistanceFilter => {
  // Проверяем наличие числа в строке цели
  if (!goal) return 'all'; // Если цели нет
  
  if (goal.includes('21')) { // Проверяем сначала 21
    return '21k';
  }
  if (goal.includes('10')) {
    return '10k';
  }
  if (goal.includes('5')) {
    return '5k';
  }

  return 'all'; // По умолчанию, если не нашли совпадений
};

const GoalsScreen: React.FC<GoalsScreenProps> = ({ userData }) => {
   // Устанавливаем начальное состояние фильтра на основе цели пользователя
   const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>(() => getInitialFilter(userData.goal)); 

   const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

   // Стиль для "золотой" плашки
   const goldCardStyle: React.CSSProperties = {
       ...cardStyle,
       backgroundColor: '#fffbeb', // Светло-желтый
       border: '1px solid #ffeeba' // Золотистый
   };

   // Стиль для карточки старта
   const startCardStyle: React.CSSProperties = {
       ...cardStyle,
       padding: '15px', // Уменьшим паддинг для компактности
       display: 'flex',
       flexDirection: 'column',
       gap: '5px', // Отступ между элементами внутри карточки
       position: 'relative' // Для позиционирования иконок
   };

   // Стили для кнопок фильтра
   const filterButtonStyle: React.CSSProperties = { padding: '5px 10px', marginRight: '10px', border: '1px solid #ccc', borderRadius: '15px', background: '#f8f9fa', cursor: 'pointer', fontSize: '14px' };
   const activeFilterButtonStyle: React.CSSProperties = { ...filterButtonStyle, background: '#007bff', color: 'white', borderColor: '#007bff' };

   // Стиль для контейнера фильтров
   const filterContainerStyle: React.CSSProperties = {
       padding: '10px 0', // Небольшой вертикальный отступ
       marginBottom: '15px',
       borderBottom: '1px solid #eee', // Линия снизу для отделения
   };

   // Расчет примерной даты завершения (пока на основе samplePlan)
   const estimatedEndDate = useMemo(() => {
       const planStartDate = new Date(); // Берем текущую дату как старт
       planStartDate.setHours(0, 0, 0, 0);
       const totalWeeks = Math.max(0, ...samplePlan.map(item => item.week));
       if (totalWeeks === 0) return null;

       const endDate = new Date(planStartDate);
       endDate.setDate(planStartDate.getDate() + totalWeeks * 7 -1); // Конец последней недели
       return formatDateFull(endDate);
   }, []); // Рассчитываем один раз

   // Фильтруем старты на основе выбранной дистанции
   const filteredStarts = useMemo(() => {
       if (distanceFilter === 'all') {
           return sampleStarts;
       }
       return sampleStarts.filter(start => start.distances.includes(distanceFilter));
   }, [distanceFilter]);

  return (
     // Добавляем отступы
    <div style={{ paddingBottom: '80px', paddingLeft: '10px', paddingRight: '10px' }}>
      <h1>Мои цели</h1>
      
      {/* "Золотая" карточка текущей цели */} 
      <div style={goldCardStyle}>
        <h2 style={{ marginTop: 0 }}>Текущая цель</h2>
        <p style={{ fontSize: '1.4em', fontWeight: 'bold', margin: '10px 0' }}>
           🎯 {userData.goal || 'Цель не выбрана'} 
        </p>
        <p style={{ margin: '5px 0' }}>
            <strong>Статус:</strong> В процессе
        </p>
        {estimatedEndDate && (
             <p style={{ margin: '5px 0' }}>
                 <strong>Примерное завершение:</strong> {estimatedEndDate}
            </p>
        )}
      </div>

      {/* Карточка про старты */}
       <div style={cardStyle}>
        <h2>🎯 Беги к старту!</h2>
        <p>Лучшая мотивация - зарегистрироваться на реальный забег! Это поможет не бросить тренировки и получить незабываемые эмоции на финише.</p>
        
        {/* Контейнер с фильтрами */} 
        <div style={filterContainerStyle}> 
            {/* Убираем текстовую метку */} 
            {/* <span>Показать старты: </span> */}
            <button 
                onClick={() => setDistanceFilter('all')}
                style={distanceFilter === 'all' ? activeFilterButtonStyle : filterButtonStyle}
            >Все</button>
            <button 
                onClick={() => setDistanceFilter('5k')}
                style={distanceFilter === '5k' ? activeFilterButtonStyle : filterButtonStyle}
            >5 км</button>
            <button 
                 onClick={() => setDistanceFilter('10k')}
                 style={distanceFilter === '10k' ? activeFilterButtonStyle : filterButtonStyle}
            >10 км</button>
             <button 
                 onClick={() => setDistanceFilter('21k')}
                 style={distanceFilter === '21k' ? activeFilterButtonStyle : filterButtonStyle}
             >21 км</button>
        </div>

        {/* Список стартов в виде карточек */} 
        {filteredStarts.length > 0 ? (
            filteredStarts.map(start => (
                <div key={start.id} style={startCardStyle}>
                   {/* Добавляем блок с иконками справа вверху */} 
                   <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                       {/* Иконка "участники" */} 
                       {start.registeredUsersCount > 0 && (
                           <span title={`Уже участвуют: ${start.registeredUsersCount}`} style={{ fontSize: '0.9em', color: '#6c757d', display: 'flex', alignItems: 'center' }}>
                               <span style={{ marginRight: '3px' }}>👥</span> {/* Эмодзи или FontAwesome иконка */} 
                               {start.registeredUsersCount}
                           </span>
                       )}
                       {/* Иконка "выбрать целью" (пока заглушка) */} 
                       <span title="Сделать ключевым стартом" style={{ cursor: 'pointer', color: '#ffc107' }}>
                           ⭐ {/* Эмодзи или FontAwesome иконка */} 
                       </span>
                   </div>

                   <h4 style={{ margin: 0, paddingRight: '50px' }}>{start.name}</h4> {/* Добавляем отступ справа для иконок */}
                   <span style={{ fontSize: '0.9em', color: 'grey' }}>{start.location}, {start.month}</span>
                   {/* Отображаем доступные дистанции */} 
                   <div style={{ fontSize: '0.8em' }}>
                       Дистанции: {start.distances.join(', ').replace(/k/g, ' км')}
                   </div>
                   {/* Можно добавить ссылку на сайт старта */}
                   {/* <a href="#" target="_blank">Подробнее...</a> */}
                </div>
            ))
        ) : (
            <p>Подходящих стартов не найдено для выбранной дистанции.</p>
        )}
        
        <p style={{ marginTop: '15px' }}><i>Ищи актуальные старты в своем городе или онлайн!</i></p>
      </div>

       {/* Карточка архива */}
       <div style={cardStyle}>
        <h2>Архив целей</h2>
        <p>Здесь будут отображаться твои прошлые достижения.</p>
        <p><i>(В разработке)</i></p>
      </div>
      
       {/* Карточка новых целей (можно убрать или оставить) */}
       {/* <div style={cardStyle}>
        <h2>Поставить новую цель</h2>
        <p>Возможность выбрать новую дистанцию или тип цели появится после завершения текущего плана.</p>
         <p><i>(В разработке)</i></p>
      </div> */} 

    </div>
  );
};

export default GoalsScreen; 