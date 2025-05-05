import React from 'react';

interface GenderStepProps {
  onNext: (gender: 'male' | 'female') => void; // Pass the selected gender
  setUserData: React.Dispatch<React.SetStateAction<any>>; // TODO: Use a proper type for userData
  userData: any; // TODO: Use a proper type for userData
}

const GenderStep: React.FC<GenderStepProps> = ({ onNext, setUserData, userData }) => {
  const handleSelectGender = (gender: 'male' | 'female') => {
    setUserData((prev: any) => ({ ...prev, gender }));
    // Не переходим автоматически, ждем нажатия "Далее"
  };

  const isNextDisabled = !userData.gender;

  return (
    <div className="onboarding-step">
      <h2>Укажите ваш пол</h2>
      <p className="step-explanation">Это поможет точнее адаптировать план тренировок.</p>
      <div className="gender-options">
        <button
          className={`gender-button ${userData.gender === 'male' ? 'selected' : ''}`}
          onClick={() => handleSelectGender('male')}
        >
          <span role="img" aria-label="male">👨</span> Мужской
        </button>
        <button
          className={`gender-button ${userData.gender === 'female' ? 'selected' : ''}`}
          onClick={() => handleSelectGender('female')}
        >
          <span role="img" aria-label="female">👩</span> Женский
        </button>
      </div>
      {/* Передаем выбранный пол в onNext */}
      <button onClick={() => onNext(userData.gender)} disabled={isNextDisabled} className="button-next">
        Далее
      </button>
      {/* Стили будут в App.css */}
    </div>
  );
};

export default GenderStep; 