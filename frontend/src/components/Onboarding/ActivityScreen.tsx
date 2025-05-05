import React, { useState } from 'react';

interface ActivityScreenProps {
  onSelectActivity: (activityLevel: string) => void;
}

const ActivityScreen: React.FC<ActivityScreenProps> = ({ onSelectActivity }) => {
  const [activityLevel, setActivityLevel] = useState<string | null>(null);

  const activityLevels = [
    'В основном сидячая работа/образ жизни.',
    'Умеренная активность (прогулки, легкие упражнения).',
    'Высокая активность (физическая работа, регулярные занятия спортом).',
  ];

  const handleLevelChange = (level: string) => {
    setActivityLevel(level);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (activityLevel) {
          onSelectActivity(activityLevel);
      }
  };

  const isNextDisabled = !activityLevel;

  return (
    <div>
      <h2>Физическая активность</h2>
      <p>Насколько ты активен(на) в обычной жизни? Как много двигаешься в течение дня?</p>
      <form onSubmit={handleSubmit}>
          {activityLevels.map((level) => (
              <div key={level}>
                  <label style={{ display: 'block', marginBottom: '10px' }}>
                      <input
                          type="radio"
                          name="activityLevel"
                          value={level}
                          checked={activityLevel === level}
                          onChange={() => handleLevelChange(level)}
                          style={{ marginRight: '8px' }}
                      />
                      {level}
                  </label>
              </div>
          ))}

          <button type="submit" style={{ marginTop: '15px' }} disabled={isNextDisabled}>
              Далее
          </button>
      </form>
    </div>
  );
};

export default ActivityScreen; 