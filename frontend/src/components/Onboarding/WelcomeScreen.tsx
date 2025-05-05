import React from 'react';

interface WelcomeScreenProps {
  // Пока пропсы не нужны, но оставим для будущего, 
  // например, для передачи функции обработчика выбора
  onSelectGoal: (goal: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectGoal }) => {
  const goals = ['5 км', '10 км', 'Полумарафон (21.1 км)'];

  return (
    <div>
      <h1>Привет!</h1>
      <p>Я твой персональный помощник в мире бега. Готов начать путь к своей цели?</p>
      <p>Выбери дистанцию, которую хочешь покорить:</p>
      <div>
        {goals.map((goal) => (
          <button 
            key={goal} 
            onClick={() => onSelectGoal(goal)} 
            style={{ margin: '5px', padding: '10px 20px', fontSize: '16px' }}
          >
            {goal}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen; 