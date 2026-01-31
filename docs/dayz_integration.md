# Интеграция с DayZ (Enforce Script Connect)

## Технология: File-System Bridge
Использование общей папки профиля сервера для обмена данными.

## 1. Направление: DayZ » Discord (Log Streaming)
Бот отслеживает изменения в файлах логов:
- `scripts.log` или кастомный `DiscordExport.json`.
- **События:**
  - 💀 **Killfeed:** Кто, кого, из чего, дистанция.
  - 🛠️ **Admin Log:** Использование админ-панелей.
  - 📦 **Events:** Запуск ивентов (AirDrop, Care Packages).

## 2. Направление: Discord » DayZ (Command Injection)
Бот пишет в файл `DiscordRemote.json`:
```json
{
  "command": "MSG_GLOBAL",
  "params": ["Внимание!", "Рестарт через 5 минут"],
  "timestamp": 1706795200
}
```
Мод на стороне DayZ (Enforce Script) парсит этот файл через `JsonFileLoader` в `OnUpdate` или по таймеру.

## 3. Структура Enforce Script (Пример)
```cpp
// Пример записи из DayZ
void SendToDiscord(string message) {
    auto data = new DiscordMessage(message);
    JsonFileLoader<DiscordMessage>.JsonSaveFile("$profile:DiscordExport.json", data);
}
```
