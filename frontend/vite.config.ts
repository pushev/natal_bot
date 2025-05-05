import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Убираем command из параметров, оставляем только mode
export default defineConfig(({ mode }) => {
  // Определяем базовый путь в зависимости от режима
  const base = mode === 'production' 
    ? '/bot_eerun/' // Для продакшн сборки (npm run build)
    : '/';           // Для разработки (npm run dev)

  return {
    plugins: [react()],
    base: base, // Устанавливаем базовый путь
    server: {
      // Добавляем разрешенный хост (например, от ngrok)
      allowedHosts: ['yak-special-marginally.ngrok-free.app'],
      // Можно также указать порт, если стандартный 5173 занят
      // port: 5173, 
    },
    // Можно добавить другие настройки сборки, если нужно
    // build: {
    //   sourcemap: true, // Например, включить sourcemaps для продакшена
    // }
  }
})
