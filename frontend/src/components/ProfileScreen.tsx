import React from 'react';

interface ProfileScreenProps {
  userData: Record<string, any>;
  onResetProfile: () => void; // Передаем сюда функцию сброса
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ userData, onResetProfile }) => {

  // Функция для отображения значения (с обработкой undefined/null и boolean)
  const renderValue = (value: any) => {
    if (value === undefined || value === null) return '-';
    if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
    if (value === 'male') return 'Мужской';
    if (value === 'female') return 'Женский';
    return String(value);
  }

  // Определяем, какие поля выводить и под какими названиями
  const profileFields = [
    { key: 'goal', label: 'Цель' },
    { key: 'experienceLevel', label: 'Уровень опыта' },
    { key: 'experienceDetails', label: 'Детали опыта' },
    { key: 'activityLevel', label: 'Уровень активности' },
    { key: 'averageSteps', label: 'Среднее кол-во шагов' },
    { key: 'gender', label: 'Пол' },
    { key: 'location', label: 'Город' },
    { key: 'height', label: 'Рост (см)' },
    { key: 'weight', label: 'Вес (кг)' },
    { key: 'age', label: 'Возраст' },
    { key: 'bmi', label: 'ИМТ' },
    { key: 'motivation', label: 'Мотивация' },
    { key: 'hasLimitations', label: 'Наличие ограничений' },
    { key: 'limitationDetails', label: 'Детали ограничений' },
    { key: 'daysPerWeek', label: 'Тренировок в неделю' },
    { key: 'timePerSession', label: 'Время на тренировку' },
  ];

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '15px 20px', // Чуть больше паддинга
    marginBottom: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  return (
    // Добавляем горизонтальные отступы
    <div style={{ paddingBottom: '80px', paddingLeft: '10px', paddingRight: '10px' }}> 
      <h1>Профиль</h1>

      {/* Карточка с данными пользователя */}
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0, marginBottom: '15px' }}>Мои данные</h2>
        {profileFields.map(({ key, label }) => (
          // Не выводим поле, если его нет в userData или оно пустое (кроме булевых)
          (userData[key] !== undefined && userData[key] !== null && userData[key] !== '') || typeof userData[key] === 'boolean' ? (
            <p key={key} style={{ margin: '5px 0' }}> {/* Уменьшаем отступы параграфов */}
              <strong>{label}:</strong> {renderValue(userData[key])}
            </p>
          ) : null
        ))}
      </div>

      {/* Карточка с информацией об оплате (заглушка) */}
      <div style={cardStyle}>
         <h2 style={{ marginTop: 0, marginBottom: '15px' }}>Статус подписки</h2>
         <p>Информация о подписке и возможностях оплаты появится здесь в следующих версиях.</p>
         <p>Сейчас вам доступен полный функционал.</p> 
         {/* Можно добавить кнопку "Управление подпиской" в будущем */}
      </div>

      {/* Кнопка сброса теперь под карточками */} 
      <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <button 
            onClick={onResetProfile} 
            style={{ backgroundColor: '#ffdddd', color: '#a00', border: '1px solid #a00', padding: '8px 15px', borderRadius: '5px' }}
          >
            Сбросить профиль и начать заново
          </button>
      </div>
    </div>
  );
};

export default ProfileScreen; 