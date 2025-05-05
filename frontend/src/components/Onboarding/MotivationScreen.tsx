import React, { useState } from 'react';

interface MotivationScreenProps {
  onCompleteMotivation: (motivation: string) => void;
}

const MotivationScreen: React.FC<MotivationScreenProps> = ({ onCompleteMotivation }) => {
  const [motivation, setMotivation] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCompleteMotivation(motivation);
  };

  return (
    <div>
      <h2>Мотивация (опционально)</h2>
      <p>Что привело тебя к решению начать бегать или подготовиться к этой дистанции? Что тебя мотивирует?</p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          placeholder="Например: хочу улучшить здоровье, подготовиться к первому забегу, сбросить вес..."
          rows={4}
          style={{ width: '90%', marginTop: '10px', marginBottom: '15px' }}
        />
        <br />
        {/* Кнопка "Далее" активна всегда, т.к. шаг опциональный */}
        <button type="submit">Далее</button>
        {/* Можно добавить кнопку "Пропустить" */}
        {/* <button type="button" onClick={() => onCompleteMotivation('')}>Пропустить</button> */}
      </form>
    </div>
  );
};

export default MotivationScreen; 