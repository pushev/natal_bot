import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faListCheck, // Иконка для Плана
  faBullseye,  // Меняем иконку на Цели (мишень)
  faUsers,     // Иконка для Клуба
  faUserCircle // Иконка для Профиля
} from '@fortawesome/free-solid-svg-icons';

// Обновляем тип ActiveTab
export type ActiveTab = 'plan' | 'goals' | 'club' | 'profile';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {

  const navItems = [
    { id: 'plan', icon: faListCheck, label: 'План' },
    { id: 'goals', icon: faBullseye, label: 'Цели' }, // Меняем id, иконку, label
    { id: 'club', icon: faUsers, label: 'Клуб' },
    { id: 'profile', icon: faUserCircle, label: 'Профиль' },
  ];

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderTop: '1px solid #ccc',
    padding: '8px 0',
    boxSizing: 'border-box'
  };

  const buttonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '5px',
    fontSize: '12px',
    color: '#555'
  };

  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    color: '#007bff', // Цвет активной иконки
    fontWeight: 'bold'
  };

  return (
    <nav style={navStyle}>
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id as ActiveTab)}
          style={activeTab === item.id ? activeButtonStyle : buttonStyle}
        >
          <FontAwesomeIcon icon={item.icon} size="lg" />
          <span style={{ marginTop: '4px' }}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav; 