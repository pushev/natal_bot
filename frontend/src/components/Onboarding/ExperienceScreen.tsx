import React, { useState } from 'react';

interface ExperienceScreenProps {
  onSelectExperience: (experienceLevel: string, details?: string) => void;
}

const ExperienceScreen: React.FC<ExperienceScreenProps> = ({ onSelectExperience }) => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [details, setDetails] = useState('');

  const regularRunnerLevel = 'Уже бегаю регулярно';

  const experienceLevels = [
    'Совсем новичок, никогда не бегал(а) регулярно.',
    'Пробовал(а) бегать раньше, но без системы.',
    'Бегаю время от времени / нерегулярно.',
    regularRunnerLevel,
  ];

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    if (level !== regularRunnerLevel) {
      setDetails('');
    }
  };

  const handleDetailsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDetails(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedLevel) {
      if (selectedLevel !== regularRunnerLevel || details.trim() !== '') {
        onSelectExperience(selectedLevel, selectedLevel === regularRunnerLevel ? details : undefined);
      }
    }
  };

  const isNextDisabled = !selectedLevel || (selectedLevel === regularRunnerLevel && details.trim() === '');

  return (
    <div>
      <h2>Опыт бега</h2>
      <p>Расскажи немного о своем беговом опыте. Как бы ты его описал(а)?</p>
      <form onSubmit={handleSubmit}>
        {experienceLevels.map((level) => (
          <div key={level}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <input
                type="radio"
                name="experienceLevel"
                value={level}
                checked={selectedLevel === level}
                onChange={() => handleLevelChange(level)}
                style={{ marginRight: '8px' }}
              />
              {level}
            </label>
            {level === regularRunnerLevel && selectedLevel === regularRunnerLevel && (
              <div style={{ marginLeft: '25px', marginBottom: '10px' }}>
                <label>
                  Опиши подробнее (раз в неделю, дистанция/время):
                  <input
                    type="text"
                    value={details}
                    onChange={handleDetailsChange}
                    placeholder="Пример: 3 раза в неделю по 5 км"
                    style={{ marginLeft: '5px', width: '80%' }}
                    required
                  />
                </label>
              </div>
            )}
          </div>
        ))}
        <button type="submit" style={{ marginTop: '15px' }} disabled={isNextDisabled}>
          Далее
        </button>
      </form>
    </div>
  );
};

export default ExperienceScreen; 