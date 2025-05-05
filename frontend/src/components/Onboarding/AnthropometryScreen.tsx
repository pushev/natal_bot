import React, { useState, useMemo } from 'react';

interface AnthropometryScreenProps {
  onCompleteAnthropometry: (height: number, weight: number, age: number, bmi: number) => void;
}

const AnthropometryScreen: React.FC<AnthropometryScreenProps> = ({ onCompleteAnthropometry }) => {
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [age, setAge] = useState<string>('');

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, allowDecimal: boolean = false) => 
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      const regex = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
      if (regex.test(value)) {
        setter(value);
      }
  };

  const calculateBMI = (h: number, w: number): number | null => {
    if (h > 0 && w > 0) {
        const heightInMeters = h / 100;
        const bmi = w / (heightInMeters * heightInMeters);
        return parseFloat(bmi.toFixed(1));
    }
    return null;
  };

  const heightNum = parseFloat(height);
  const weightNum = parseFloat(weight);
  const ageNum = parseInt(age, 10);

  const bmi = useMemo(() => calculateBMI(heightNum, weightNum), [heightNum, weightNum]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (bmi !== null && heightNum > 0 && weightNum > 0 && ageNum > 0 && !isNaN(ageNum)) {
        onCompleteAnthropometry(heightNum, weightNum, ageNum, bmi);
    } else {
        alert("Пожалуйста, введите корректные рост, вес и возраст.");
    }
  };

  return (
    <div>
      <h2>Антропометрия и возраст</h2>
      <p>Эти данные помогут точнее адаптировать нагрузку и план восстановления.</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Рост (см):
            <input
              type="text"
              inputMode="decimal"
              value={height}
              onChange={handleInputChange(setHeight, true)}
              placeholder="175"
              required
              style={{ marginLeft: '5px', width: '80px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '5px' }}>
          <label>
            Вес (кг):
            <input
              type="text"
              inputMode="decimal"
              value={weight}
              onChange={handleInputChange(setWeight, true)}
              placeholder="70.5"
              required
              style={{ marginLeft: '5px', width: '80px' }}
            />
          </label>
        </div>
        <p style={{ fontSize: '0.8em', color: 'grey', marginTop: '0px', marginBottom: '15px', marginLeft: '10px' }}>
             *При избыточном весе может потребоваться больше времени на адаптацию.
        </p>
        <div style={{ marginBottom: '5px' }}>
          <label>
            Возраст (полных лет):
            <input
              type="tel"
              inputMode="numeric"
              value={age}
              onChange={handleInputChange(setAge)}
              placeholder="30"
              required
              style={{ marginLeft: '5px', width: '80px' }}
            />
          </label>
        </div>
        <p style={{ fontSize: '0.8em', color: 'grey', marginTop: '0px', marginBottom: '15px', marginLeft: '10px' }}>
             *Возраст влияет на рекомендации по восстановлению и разминке.
        </p>
        {bmi !== null && (
          <p>Ваш Индекс Массы Тела (ИМТ): <strong>{bmi}</strong></p>
        )}
        <button type="submit" disabled={!height || !weight || !age}>Далее</button>
      </form>
    </div>
  );
};

export default AnthropometryScreen; 