import React, { useState } from 'react';

interface TimeAvailabilityScreenProps {
  onCompleteAvailability: (daysPerWeek: number, timePerSession: string) => void;
}

const TimeAvailabilityScreen: React.FC<TimeAvailabilityScreenProps> = ({ onCompleteAvailability }) => {
  const [daysPerWeek, setDaysPerWeek] = useState<number | null>(null);
  const [timePerSession, setTimePerSession] = useState<string | null>(null);

  const daysOptions = [2, 3, 4, 5]; // 5 означает 5+
  const timeOptions = [
    '30-45 мин',
    '45-60 мин',
    '60-90 мин',
    'Больше 90 мин',
  ];

  const handleDaysChange = (days: number) => {
    setDaysPerWeek(days);
    // НЕ ПЕРЕХОДИМ ДАЛЬШЕ
  };

  const handleTimeChange = (time: string) => {
    setTimePerSession(time);
    // НЕ ПЕРЕХОДИМ ДАЛЬШЕ
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (daysPerWeek !== null && timePerSession !== null) {
      onCompleteAvailability(daysPerWeek, timePerSession);
    }
  };

  // Определяем, активна ли кнопка
  const isNextDisabled = daysPerWeek === null || timePerSession === null;

  return (
    <div>
      <h2>Доступное время</h2>
      <form onSubmit={handleSubmit}> {/* Используем onSubmit формы */}
        <div style={{ marginBottom: '20px' }}>
            <p>Сколько дней в неделю ты реально сможешь посвящать тренировкам?</p>
            {daysOptions.map((days) => (
                <label key={days} style={{ marginRight: '15px' }}>
                    <input
                        type="radio"
                        name="daysPerWeek"
                        value={days}
                        checked={daysPerWeek === days}
                        onChange={() => handleDaysChange(days)}
                        style={{ marginRight: '5px' }}
                    />
                    {days === 5 ? '5+' : days} {days === 1 ? 'день' : (days < 5 ? 'дня' : 'дней')}
                </label>
            ))}
        </div>

        <div>
            <p>Сколько примерно времени у тебя есть на одну тренировку (включая разминку и заминку)?</p>
            {timeOptions.map((time) => (
                <div key={time}>
                     <label style={{ display: 'block', marginBottom: '10px' }}>
                        <input
                            type="radio"
                            name="timePerSession"
                            value={time}
                            checked={timePerSession === time}
                            onChange={() => handleTimeChange(time)}
                            style={{ marginRight: '8px' }}
                        />
                        {time}
                    </label>
                </div>
            ))}
        </div>
        
        {/* Кнопка видна всегда, но активна по условию */}
        <button type="submit" style={{ marginTop: '15px' }} disabled={isNextDisabled}>
             Завершить онбординг
        </button>
      </form>
    </div>
  );
};

export default TimeAvailabilityScreen; 