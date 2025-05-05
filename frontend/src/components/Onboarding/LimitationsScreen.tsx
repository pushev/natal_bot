import React, { useState } from 'react';

interface LimitationsScreenProps {
  onCompleteLimitations: (hasLimitations: boolean, details: string) => void;
}

const LimitationsScreen: React.FC<LimitationsScreenProps> = ({ onCompleteLimitations }) => {
  const [hasLimitations, setHasLimitations] = useState<boolean | null>(null);
  const [details, setDetails] = useState('');

  const handleOptionChange = (value: string) => {
    const boolValue = value === 'yes';
    setHasLimitations(boolValue);
    if (!boolValue) {
      setDetails(''); // Очищаем детали, если выбрано "Нет"
      // НЕ ПЕРЕХОДИМ ДАЛЬШЕ АВТОМАТИЧЕСКИ
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (hasLimitations !== null) {
      if (hasLimitations === false || details.trim() !== '') {
        onCompleteLimitations(hasLimitations, details);
      }
    }
  };

  // Определяем, активна ли кнопка "Далее"
  const isNextDisabled = hasLimitations === null || (hasLimitations === true && details.trim() === '');

  return (
    <div>
      <h2>Ограничения по здоровью</h2>
      <p>Важно: есть ли у тебя какие-либо травмы или медицинские состояния (сердце, суставы и т.д.), о которых мне нужно знать?</p>
      <p style={{ fontSize: '0.9em', color: 'grey', marginTop: '5px' }}>
          *Честный ответ поможет построить безопасный план, избежать травм и подобрать правильное время для восстановления.
      </p>
      <form onSubmit={handleSubmit}> {/* Используем onSubmit формы */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '20px' }}>
            <input
              type="radio"
              name="limitations"
              value="no"
              checked={hasLimitations === false}
              onChange={(e) => handleOptionChange(e.target.value)}
              style={{ marginRight: '5px' }}
            />
            Нет
          </label>
          <label>
            <input
              type="radio"
              name="limitations"
              value="yes"
              checked={hasLimitations === true}
              onChange={(e) => handleOptionChange(e.target.value)}
              style={{ marginRight: '5px' }}
            />
            Да
          </label>
        </div>

        {hasLimitations === true && (
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="limitationDetails">Пожалуйста, кратко опиши:</label>
            <textarea
              id="limitationDetails"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              required // HTML5 валидация
              style={{ width: '90%', marginTop: '5px', display: 'block' }}
            />
          </div>
        )}

        {/* Кнопка "Далее" видна всегда, но активна по условию */}
        <button type="submit" style={{ marginTop: '15px' }} disabled={isNextDisabled}>
          Далее
        </button>
      </form>
    </div>
  );
};

export default LimitationsScreen; 