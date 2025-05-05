import { useState, useEffect } from 'react'
import './App.css'
import WelcomeScreen from './components/Onboarding/WelcomeScreen'
import ExperienceScreen from './components/Onboarding/ExperienceScreen'
import ActivityScreen from './components/Onboarding/ActivityScreen'
import StepsScreen from './components/Onboarding/StepsScreen'
import GenderStep from './components/Onboarding/GenderStep'
import LocationStep from './components/Onboarding/LocationStep'
import AnthropometryScreen from './components/Onboarding/AnthropometryScreen'
import MotivationScreen from './components/Onboarding/MotivationScreen'
import LimitationsScreen from './components/Onboarding/LimitationsScreen'
import TimeAvailabilityScreen from './components/Onboarding/TimeAvailabilityScreen'
import DashboardScreen from './components/DashboardScreen'
import GoalsScreen from './components/GoalsScreen'
import ClubScreen from './components/ClubScreen'
import ProfileScreen from './components/ProfileScreen'
import BottomNav, { type ActiveTab } from './components/BottomNav'

// Этапы онбординга + специальное состояние 'app' для основного интерфейса
type AppState = 
  | 'welcome' 
  | 'experience' 
  | 'activity' 
  | 'steps' 
  | 'gender'
  | 'location'
  | 'anthropometry' 
  | 'motivation' 
  | 'limitations' 
  | 'timeAvailability' 
  | 'app' // Состояние, когда онбординг пройден

// Ключи localStorage
const LS_STATE_KEY = 'eerun_appState'
const LS_USER_DATA_KEY = 'eerun_userData'
const LS_ACTIVE_TAB_KEY = 'eerun_activeTab' // Сохраняем активную вкладку

function App() {
  // --- Состояния --- 
  const [appState, setAppState] = useState<AppState>(() => {
    const savedState = localStorage.getItem(LS_STATE_KEY) as AppState | null
    // Если сохранено 'app', начинаем с основного интерфейса, иначе с 'welcome'
    return savedState === 'app' ? 'app' : 'welcome'
  })

  const [userData, setUserData] = useState<Record<string, any>>(() => {
    const savedData = localStorage.getItem(LS_USER_DATA_KEY)
    try {
      return savedData ? JSON.parse(savedData) : {}
    } catch (e) {
      console.error("Failed to parse user data from localStorage", e)
      return {}
    }
  })

  // Состояние для активной вкладки в основном интерфейсе
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const savedTab = localStorage.getItem(LS_ACTIVE_TAB_KEY) as ActiveTab | null
    // Проверяем, что сохраненная вкладка валидна, иначе сбрасываем на 'plan'
    const validTabs: ActiveTab[] = ['plan', 'goals', 'club', 'profile']
    return savedTab && validTabs.includes(savedTab) ? savedTab : 'plan'
  })

  // --- Эффекты для localStorage --- 
  useEffect(() => {
    // Сохраняем только если онбординг пройден или не был сброшен
    if (appState !== 'welcome' || localStorage.getItem(LS_STATE_KEY)) { 
      localStorage.setItem(LS_STATE_KEY, appState)
      localStorage.setItem(LS_USER_DATA_KEY, JSON.stringify(userData))
      // Сохраняем активную вкладку только если мы в режиме 'app'
      if (appState === 'app') {
        localStorage.setItem(LS_ACTIVE_TAB_KEY, activeTab)
      }
      console.log(`Saved state: appState=${appState}, activeTab=${appState === 'app' ? activeTab : 'N/A'}, data=`, userData)
    }
  }, [appState, userData, activeTab])

  // --- Обработчики онбординга --- 
  const handleGoalSelection = (goal: string) => {
    setUserData(prev => ({ ...prev, goal }))
    setAppState('experience')
  }

  const handleExperienceSelection = (experienceLevel: string, details?: string) => {
    console.log('Выбран опыт:', experienceLevel, 'Детали:', details)
    setUserData(prev => ({ ...prev, experienceLevel, experienceDetails: details }))
    setAppState('activity')
  }

  const handleActivitySelection = (activityLevel: string) => {
    setUserData(prev => ({ ...prev, activityLevel }))
    setAppState('steps')
  }

  const handleStepsComplete = (steps?: number) => {
    setUserData(prev => ({ ...prev, averageSteps: steps }))
    setAppState('gender')
  }

  const handleGenderComplete = (gender: 'male' | 'female') => {
    setUserData(prev => ({ ...prev, gender }))
    setAppState('location')
  }

  const handleLocationComplete = (location: string) => {
    setUserData(prev => ({ ...prev, location }))
    setAppState('anthropometry')
  }

  const handleAnthropometryComplete = (height: number, weight: number, age: number, bmi: number) => {
    setUserData(prev => ({ ...prev, height, weight, age, bmi }))
    setAppState('motivation')
  }

  const handleMotivationComplete = (motivation: string) => {
    setUserData(prev => ({ ...prev, motivation }))
    setAppState('limitations')
  }

  const handleLimitationsComplete = (hasLimitations: boolean, details: string) => {
    setUserData(prev => ({ ...prev, hasLimitations, limitationDetails: details }))
    setAppState('timeAvailability')
  }

  const handleAvailabilityComplete = (daysPerWeek: number, timePerSession: string) => {
    const finalUserData = { ...userData, daysPerWeek, timePerSession }
    setUserData(finalUserData)
    console.log("Onboarding complete. User data:", finalUserData)
    setActiveTab('plan') // При завершении всегда открываем План
    setAppState('app') // Переключаемся в режим основного приложения
  }
  
  // --- Обработчик сброса --- 
  const handleResetProfile = () => {
    console.log("Resetting profile...")
    localStorage.removeItem(LS_STATE_KEY)
    localStorage.removeItem(LS_USER_DATA_KEY)
    localStorage.removeItem(LS_ACTIVE_TAB_KEY)
    setUserData({})
    setActiveTab('plan') // Сбрасываем вкладку на 'plan'
    setAppState('welcome') // Возвращаемся к онбордингу
  }

  // --- Рендеринг контента --- 
  const renderContent = () => {
    console.log('Rendering state:', appState, 'Active tab:', activeTab)
    
    // Если идет онбординг
    if (appState !== 'app') {
      switch (appState) {
        case 'welcome': return <WelcomeScreen onSelectGoal={handleGoalSelection} />
        case 'experience': return <ExperienceScreen onSelectExperience={handleExperienceSelection} />
        case 'activity': return <ActivityScreen onSelectActivity={handleActivitySelection} />
        case 'steps': return <StepsScreen onCompleteSteps={handleStepsComplete} />
        case 'gender': return <GenderStep onNext={handleGenderComplete} setUserData={setUserData} userData={userData} />
        case 'location': return <LocationStep onNext={handleLocationComplete} setUserData={setUserData} userData={userData} />
        case 'anthropometry': return <AnthropometryScreen onCompleteAnthropometry={handleAnthropometryComplete} />
        case 'motivation': return <MotivationScreen onCompleteMotivation={handleMotivationComplete} />
        case 'limitations': return <LimitationsScreen onCompleteLimitations={handleLimitationsComplete} />
        case 'timeAvailability': return <TimeAvailabilityScreen onCompleteAvailability={handleAvailabilityComplete} />
        default: return <div>Неизвестный шаг онбординга</div> // На случай ошибки
      }
    }

    // Если онбординг пройден, рендерим основной интерфейс по активной вкладке
    switch (activeTab) {
      case 'plan': return <DashboardScreen userData={userData} />
      case 'goals': return <GoalsScreen userData={userData} />
      case 'club': return <ClubScreen userData={userData} />
      case 'profile': return <ProfileScreen userData={userData} onResetProfile={handleResetProfile} />
      default: return <div>Неизвестная вкладка</div>
    }
  }

  return (
    <div className="App">
      {/* Основной контент рендерится здесь */}
      <div className="main-content">
         {renderContent()} 
      </div>
      
      {/* Нижнее меню показываем только когда онбординг пройден */}
      {appState === 'app' && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
      </div>
  )
}

export default App
