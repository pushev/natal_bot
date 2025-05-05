#!/bin/bash
# Скрипт для сборки фронтенда и деплоя на сервер с помощью rsync

# Exit immediately if a command exits with a non-zero status.
set -e
# Treat unset variables as an error when substituting.
set -u 
# Causes a pipeline to return the exit status of the last command in the pipe that failed.
set -o pipefail 

# --- КОНФИГУРАЦИЯ (ОБЯЗАТЕЛЬНО ИЗМЕНИТЬ!) ---

# Данные для подключения к удаленному серверу
REMOTE_USER_HOST="root@212.41.15.40" 
# Пример: REMOTE_USER_HOST="deployer@192.168.1.100"

# АБСОЛЮТНЫЙ путь на удаленном сервере, куда будут загружены файлы сборки
# Важно: Эта директория ДОЛЖНА СУЩЕСТВОВАТЬ на сервере!
REMOTE_TARGET_DIR="/var/www/www-root/data/www/bots.tvoe.name/bot_eerun" 
# Пример: REMOTE_TARGET_DIR="/home/deployer/apps/eerun/frontend"

# Путь к приватному SSH ключу для беспарольного входа (рекомендуется)
# Оставьте ПУСТЫМ (" "), если используете аутентификацию по паролю или стандартный ключ (~/.ssh/id_rsa)
SSH_KEY_PATH=""

# --- Настройки проекта (обычно менять не нужно) ---

# Папка, где лежит фронтенд-проект
FRONTEND_DIR="frontend"
# Папка, куда Vite собирает билд (обычно dist)
BUILD_DIR="dist"

# --- КОНЕЦ КОНФИГУРАЦИИ ---

# Проверка наличия папки фронтенда
if [ ! -d "$FRONTEND_DIR" ]; then
  echo "Ошибка: Директория фронтенда '$FRONTEND_DIR' не найдена!" 
  exit 1
fi

echo "--- 1. Сборка фронтенда --- "
echo "Переход в директорию $FRONTEND_DIR..."
cd "$FRONTEND_DIR" || exit 1

echo "Установка зависимостей (npm ci)..."
# Используем npm ci для более надежной установки в CI/CD или скриптах
npm ci

echo "Запуск сборки (npm run build)..."
npm run build

echo "Сборка завершена. Директория сборки: $BUILD_DIR"

echo "Возврат в корневую директорию..."
cd .. || exit 1

BUILD_SOURCE_PATH="./$FRONTEND_DIR/$BUILD_DIR/"

# Проверка наличия папки сборки
if [ ! -d "$BUILD_SOURCE_PATH" ]; then
  echo "Ошибка: Директория сборки '$BUILD_SOURCE_PATH' не найдена после npm run build!" 
  exit 1
fi

echo "--- 2. Загрузка на сервер ($REMOTE_USER_HOST) --- "

# Формируем опцию для SSH ключа, если он указан
SSH_OPT=""
if [ -n "$SSH_KEY_PATH" ]; then
  # Раскрываем тильду (~) в пути к ключу
  eval EXPANDED_SSH_KEY_PATH="$SSH_KEY_PATH"
  if [ -f "$EXPANDED_SSH_KEY_PATH" ]; then
      SSH_OPT="-e \"ssh -i $EXPANDED_SSH_KEY_PATH\""
      echo "Используется SSH ключ: $EXPANDED_SSH_KEY_PATH"
  else
      echo "ПРЕДУПРЕЖДЕНИЕ: SSH ключ не найден по пути '$EXPANDED_SSH_KEY_PATH'. Попытка подключения без явного указания ключа." 
  fi
else
  echo "SSH ключ не указан. Попытка подключения с использованием стандартных настроек SSH."
fi

# Команда rsync
# -a: режим архива (рекурсия, сохранение прав, ссылок, времени и т.д.)
# -v: подробный вывод
# -z: сжатие данных при передаче
# --delete: удаляет файлы на сервере, которых нет в источнике (в папке сборки)
#           ВАЖНО: гарантирует, что на сервере будет точная копия сборки

DEST_PATH="$REMOTE_USER_HOST:$REMOTE_TARGET_DIR/"

echo "Синхронизация '$BUILD_SOURCE_PATH' -> '$DEST_PATH'"

# Используем eval для корректной подстановки SSH_OPT с кавычками, если он не пустой
if [ -n "$SSH_OPT" ]; then
  eval rsync -avz --delete "$SSH_OPT" "$BUILD_SOURCE_PATH" "$DEST_PATH"
else
  rsync -avz --delete "$BUILD_SOURCE_PATH" "$DEST_PATH"
fi

echo "--- Деплой успешно завершен! ---" 