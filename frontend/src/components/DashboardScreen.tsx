import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPen, faRepeat } from '@fortawesome/free-solid-svg-icons';
// Убираем импорты framer-motion
// import { motion, AnimatePresence } from 'framer-motion'; 

interface DashboardScreenProps {
  userData: Record<string, any>; // Получаем все собранные данные
}

// Расширяем примерный план на 3 недели
const samplePlan = [
  // Неделя 1
  { week: 1, day: 1, type: 'Чередование', description: '2 мин бег / 3 мин ходьба, 5 повторений' },
  { week: 1, day: 2, type: 'Отдых', description: '-' },
  { week: 1, day: 3, type: 'Чередование', description: '3 мин бег / 3 мин ходьба, 4 повторения' },
  { week: 1, day: 4, type: 'Отдых', description: '-' },
  { week: 1, day: 5, type: 'Легкая ходьба', description: '30 минут' },
  { week: 1, day: 6, type: 'Отдых', description: '-' },
  { week: 1, day: 7, type: 'Отдых', description: '-' },
  // Неделя 2
  { week: 2, day: 1, type: 'Чередование', description: '3 мин бег / 2 мин ходьба, 5 повторений' },
  { week: 2, day: 2, type: 'Отдых', description: '-' },
  { week: 2, day: 3, type: 'Чередование', description: '4 мин бег / 2 мин ходьба, 4 повторения' },
  { week: 2, day: 4, type: 'Отдых', description: '-' },
  { week: 2, day: 5, type: 'Легкий бег', description: '15-20 минут' },
  { week: 2, day: 6, type: 'Отдых', description: '-' },
  { week: 2, day: 7, type: 'Отдых', description: '-' },
  // Неделя 3
  { week: 3, day: 1, type: 'Чередование', description: '5 мин бег / 2 мин ходьба, 4 повторения' },
  { week: 3, day: 2, type: 'Отдых', description: '-' },
  { week: 3, day: 3, type: 'Чередование', description: '6 мин бег / 2 мин ходьба, 3 повторения' },
  { week: 3, day: 4, type: 'Отдых', description: '-' },
  { week: 3, day: 5, type: 'Легкий бег', description: '20-25 минут' },
  { week: 3, day: 6, type: 'Отдых', description: '-' },
  { week: 3, day: 7, type: 'Отдых', description: '-' },
  // ... и так далее
];

// Хелпер для форматирования даты в DD.MM
const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы с 0
    return `${day}.${month}`;
};

// Тип для элемента плана
interface PlanItem {
    week: number;
    day: number;
    type: string;
    description: string;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ userData }) => {
  const [currentWeek, setCurrentWeek] = useState(1); // Состояние для текущей недели
  const [todayTask, setTodayTask] = useState<PlanItem | null>(null); // Задача на сегодня
  const [todayWeek, setTodayWeek] = useState<number | null>(null); // Номер недели, в которой сегодня
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null); // Дней до цели
  // Убираем состояние direction
  // const [direction, setDirection] = useState(0); 

  // Определяем дату начала плана (пока текущая дата)
  // В будущем это может приходить из userData или настроек
  const planStartDate = useMemo(() => new Date(), []); 

  // Вычисляем общее количество недель в плане
  const totalWeeks = useMemo(() => {
    if (samplePlan.length === 0) return 0;
    // Находим максимальный номер недели в массиве
    return Math.max(...samplePlan.map(item => item.week));
  }, []); // Убираем зависимость от samplePlan, если он статичен

  // Эффект для определения сегодняшней задачи и прогресса
  useEffect(() => {
    const today = new Date();
    // Убираем время, чтобы сравнивать только даты
    today.setHours(0, 0, 0, 0); 
    planStartDate.setHours(0, 0, 0, 0);

    // Разница в миллисекундах
    const diffTime = today.getTime() - planStartDate.getTime();
    // +1, так как первый день плана - это день 0 разницы
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 

    // Определяем номер текущей недели и дня в неделе (1-7)
    const currentPlanWeek = Math.ceil(diffDays / 7);
    const currentPlanDayOfWeek = ((diffDays - 1) % 7) + 1;

    setTodayWeek(currentPlanWeek);

    // Ищем задачу на сегодня
    const task = samplePlan.find(item => item.week === currentPlanWeek && item.day === currentPlanDayOfWeek) || null;
    setTodayTask(task);

    // Устанавливаем отображаемую неделю на текущую неделю плана
    if (currentPlanWeek <= totalWeeks) {
        setCurrentWeek(currentPlanWeek);
    } else {
        // Если план пройден, показываем последнюю неделю
        setCurrentWeek(totalWeeks > 0 ? totalWeeks : 1);
    }
    
    // Примерный расчет оставшихся дней
    const totalPlanDays = totalWeeks * 7;
    const remaining = Math.max(0, totalPlanDays - diffDays + 1); // +1 т.к. diffDays нумеруется с 1
    setDaysRemaining(remaining);

  }, [planStartDate, totalWeeks]); // Запускаем один раз при монтировании (planStartDate не меняется)

  // Рассчитываем даты для текущей недели
  const currentWeekDates = useMemo(() => {
    const startOffset = (currentWeek - 1) * 7; // Дней до начала недели
    const endOffset = startOffset + 6; // Дней до конца недели

    const weekStartDate = new Date(planStartDate);
    weekStartDate.setDate(planStartDate.getDate() + startOffset);

    const weekEndDate = new Date(planStartDate);
    weekEndDate.setDate(planStartDate.getDate() + endOffset);

    return {
        start: formatDate(weekStartDate),
        end: formatDate(weekEndDate)
    };

  }, [currentWeek, planStartDate]);

  // Фильтруем план для отображения только текущей недели
  const weekPlan = useMemo(() => 
      samplePlan.filter(item => item.week === currentWeek)
  , [currentWeek]);

  const goToPreviousWeek = () => {
    // setDirection(-1); // Убираем
    setCurrentWeek(prev => Math.max(1, prev - 1)); // Не уходим меньше 1
  };

  const goToNextWeek = () => {
    // setDirection(1); // Убираем
    setCurrentWeek(prev => Math.min(totalWeeks, prev + 1)); // Не уходим дальше последней недели
  };

  // Заглушки для обработчиков кнопок
  const handleMarkAsDone = () => console.log("Отметить как сделано");
  const handleReschedule = () => console.log("Перенести");
  const handleAddComment = () => console.log("Написать комментарий");

  // Стили для карточки сегодняшней задачи
  const todayCardStyle: React.CSSProperties = {
      backgroundColor: '#e7f3ff', // Светло-голубой фон
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px',
      border: '1px solid #b3d7ff'
  };

  // Стили для кнопок действий
  const actionButtonStyle: React.CSSProperties = {
      background: 'none',
      border: '1px solid #007bff',
      color: '#007bff',
      padding: '5px 10px',
      borderRadius: '5px',
      cursor: 'pointer',
      marginRight: '10px',
      fontSize: '14px'
  };

  return (
    <div style={{ paddingBottom: '80px' }}> {/* Добавляем отступ снизу для меню */}
      {/* Переносим главный заголовок сюда */}
      <h1 style={{ textAlign: 'center', marginTop: '10px', marginBottom: '20px' }}>Мой план тренировок</h1>
      
      {/* 1. Блок "Сегодняшняя задача" */} 
      {todayTask && todayWeek && todayWeek <= totalWeeks && (
          <div style={todayCardStyle}>
              <h2 style={{ marginTop: 0, marginBottom: '10px' }}>🎯 Сегодня ({formatDate(new Date())}): {todayTask.type}</h2>
              <p style={{ margin: '0 0 15px 0' }}>{todayTask.description}</p>
              <div>
                  <button style={actionButtonStyle} onClick={handleMarkAsDone}><FontAwesomeIcon icon={faCheck} /> Сделал</button>
                  <button style={actionButtonStyle} onClick={handleReschedule}><FontAwesomeIcon icon={faRepeat} /> Перенести</button>
                  <button style={actionButtonStyle} onClick={handleAddComment}><FontAwesomeIcon icon={faPen} /> Как прошло?</button>
              </div>
               {/* Мини-статус */} 
               <p style={{ marginTop: '15px', marginBottom: '0', fontSize: '0.9em', color: '#555' }}>
                  Ты на {todayWeek}-й неделе &mdash; 
                  {daysRemaining !== null ? ` осталось ${daysRemaining} дней до ${userData.goal || 'цели'}` : 'идешь к цели!'}
               </p>
          </div>
      )} 
      {/* Если сегодня нет задачи или план завершен */}
      {(!todayTask || (todayWeek && todayWeek > totalWeeks)) && (
           <div style={{ ...todayCardStyle, backgroundColor: '#f8f9fa', borderColor: '#dee2e6', textAlign: 'center' }}>
               <p style={{ margin: 0, fontWeight: 'bold' }}>
                 {todayWeek && todayWeek > totalWeeks ? 'Поздравляем с завершением плана!' : 'Сегодня отдых или нет запланированных задач.'} 
               </p>
           </div>
      )}

      {/* Навигация по неделям с датами */} 
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
        <button onClick={goToPreviousWeek} disabled={currentWeek === 1}>
          &lt;
        </button>
        <div style={{ textAlign: 'center' }}>
            <h2>Неделя {currentWeek} из {totalWeeks}</h2>
            <p style={{ margin: '0', fontSize: '0.9em', color: 'grey' }}>
                ({currentWeekDates.start} - {currentWeekDates.end})
            </p>
        </div>
        <button onClick={goToNextWeek} disabled={currentWeek === totalWeeks}>
           &gt;
        </button>
      </div>

      {/* Возвращаем таблицу */} 
      <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
        <thead>
          <tr>
            <th>День</th>
            <th>Тип тренировки</th>
            <th>Описание</th>
          </tr>
        </thead>
        <tbody>
          {weekPlan.length > 0 ? (
             weekPlan.map((item) => (
                // Возвращаем tr и td
                <tr key={`${item.week}-${item.day}`}>
                    <td>День {item.day}</td>
                    <td>{item.type}</td>
                    <td>{item.description}</td>
                </tr>
            ))
          ) : (
            <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '10px' }}>Нет данных для этой недели.</td>
            </tr>
          )}
        </tbody>
      </table>
      
      {/* 2. Блок "AI-фидбек" (заглушка) */} 
      <div style={{ backgroundColor: '#f0fff0', borderRadius: '8px', padding: '15px', marginTop: '20px', border: '1px solid #c3e6cb' }}>
          <h3 style={{ marginTop: 0, color: '#155724' }}>🧠 Аналитика и советы</h3>
          <p style={{ color: '#155724' }}>
              Анализ твоих тренировок и персональные рекомендации появятся здесь после того, как ты начнешь отмечать выполнение задач.
          </p>
           {/* <p style={{ color: '#155724' }}>
               Пример: "Молодец, ты уже пробежал(а) X км за эту неделю! Это +Y% к прошлой. Не забывай про разминку."
           </p> */} 
      </div>

      {/* Здесь в будущем будет навигация по неделям, отметка о выполнении и т.д. */}
    </div>
  );
};

export default DashboardScreen; 