import React, { useState } from 'react';

interface StepsScreenProps {
  onCompleteSteps: (steps?: number) => void; // Может быть undefined, если пропущено
}

const StepsScreen: React.FC<StepsScreenProps> = ({ onCompleteSteps }) => {
  const [steps, setSteps] = useState<string>('');

  const handleStepsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Оставляем только цифры
    if (/^\d*$/.test(value)) {
      setSteps(value);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let stepsNumber: number | undefined = undefined;
    if (steps) {
        const parsed = parseInt(steps, 10);
        if (!isNaN(parsed)) {
            stepsNumber = parsed;
        } else {
            console.warn("Invalid steps value ignored: ", steps);
        }
    }
    onCompleteSteps(stepsNumber);
  };

  const handleSkip = () => {
    onCompleteSteps(undefined); // Передаем undefined при пропуске
  };

  return (
    <div>
      <h2>Среднее количество шагов</h2>
      <p>Если ты знаешь свое среднее количество шагов в день (например, из фитнес-трекера или телефона), укажи его здесь.</p>
      <p style={{ fontSize: '0.9em', color: 'grey', marginTop: '5px' }}>
          *Это поможет точнее настроить начальную нагрузку. Если ты уже проходишь 10 000+ шагов, прогресс в беге может быть быстрее.
      </p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginTop: '15px', marginBottom: '15px' }}>
          <label>
            Среднее количество шагов в день:
            <input
              type="tel"
              value={steps}
              onChange={handleStepsChange}
              placeholder="Пример: 8000"
              style={{ marginLeft: '5px', width: '100px' }}
            />
          </label>
        </div>
        
        {/* Кнопка "Далее" активна всегда, т.к. ввод опционален */}
        <button type="submit" style={{ marginRight: '10px' }}>Далее</button>
        
        {/* Добавляем кнопку "Пропустить" */}
        <button type="button" onClick={handleSkip}>Пропустить</button>
      </form>
    </div>
  );
};

export default StepsScreen; 