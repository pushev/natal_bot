import React, { useState } from 'react';

interface LocationStepProps {
  onNext: (location: string) => void;
  setUserData: React.Dispatch<React.SetStateAction<any>>;
  userData: any;
}

// Список крупных городов России (можно дополнить/изменить)
const majorCities = [
  'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 
  'Казань', 'Нижний Новгород', 'Челябинск', 'Самара', 'Омск', 'Ростов-на-Дону'
];

const LocationStep: React.FC<LocationStepProps> = ({ onNext, setUserData, userData }) => {
  const [selectedCity, setSelectedCity] = useState<string>(userData.location || '');
  const [otherCity, setOtherCity] = useState<string>(
    (userData.location && !majorCities.includes(userData.location) && userData.location !== 'Другой город') 
      ? userData.location 
      : ''
  );
  const [showOtherInput, setShowOtherInput] = useState<boolean>(
     userData.location && !majorCities.includes(userData.location) && userData.location !== 'Другой город'
  );

  const handleCitySelection = (city: string) => {
    if (city === 'Другой город') {
      setSelectedCity(city);
      setShowOtherInput(true);
      // Сразу обновляем userData, если пользователь переключился на "Другой город" с уже введенным значением
      if (otherCity) {
          setUserData((prev: any) => ({ ...prev, location: otherCity }));
      } else {
          // Если поле пустое, пока не записываем location в userData
           setUserData((prev: any) => ({ ...prev, location: undefined }));
      }
    } else {
      setSelectedCity(city);
      setShowOtherInput(false);
      setOtherCity(''); // Сбрасываем ручной ввод
      setUserData((prev: any) => ({ ...prev, location: city }));
    }
  };

  const handleOtherCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setOtherCity(value);
    setUserData((prev: any) => ({ ...prev, location: value }));
  };

  const isNextDisabled = !selectedCity || (selectedCity === 'Другой город' && !otherCity);

  return (
    <div className="onboarding-step">
      <h2>Откуда вы?</h2>
      <p className="step-explanation">Это поможет находить старты и бегунов рядом с вами.</p>
      
      <div className="city-options">
        {majorCities.map(city => (
          <button
            key={city}
            className={`city-button ${selectedCity === city ? 'selected' : ''}`}
            onClick={() => handleCitySelection(city)}
          >
            {city}
          </button>
        ))}
        <button
          className={`city-button ${selectedCity === 'Другой город' ? 'selected' : ''}`}
          onClick={() => handleCitySelection('Другой город')}
        >
          Другой город
        </button>
      </div>

      {showOtherInput && (
        <div className="other-city-input">
          <input
            type="text"
            placeholder="Введите ваш город"
            value={otherCity}
            onChange={handleOtherCityChange}
            autoFocus // Автофокус на поле ввода
          />
        </div>
      )}

      <button onClick={() => onNext(userData.location)} disabled={isNextDisabled} className="button-next">
        Далее
      </button>

      {/* Стили перенесены в App.css */}
    </div>
  );
};

export default LocationStep; 