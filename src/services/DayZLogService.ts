import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';

export class DayZLogService extends EventEmitter {
    private logPath: string;

    constructor(serverProfilePath: string) {
        super();
        this.logPath = path.join(serverProfilePath, 'DiscordExport.json');
        this.initWatcher();
    }

    private initWatcher() {
        if (!fs.existsSync(this.logPath)) {
            console.log(`[DayZ Sync] Ожидание создания файла логов: ${this.logPath}`);
            // Создаем пустой файл, если его нет
            fs.writeFileSync(this.logPath, JSON.stringify({}));
        }

        fs.watch(this.logPath, (eventType) => {
            if (eventType === 'change') {
                this.handleLogChange();
            }
        });
    }

    private handleLogChange() {
        try {
            const content = fs.readFileSync(this.logPath, 'utf-8');
            const data = JSON.parse(content);
            
            if (data.type) {
                this.emit(data.type, data.payload);
                // Очищаем файл после прочтения, чтобы не обрабатывать дубликаты
                // Или используем систему ID транзакций
            }
        } catch (err) {
            console.error('[DayZ Sync] Ошибка парсинга лога:', err);
        }
    }

    public sendCommand(command: string, params: any[]) {
        const cmdPath = path.join(path.dirname(this.logPath), 'DiscordRemote.json');
        const cmdData = {
            command,
            params,
            timestamp: Math.floor(Date.now() / 1000)
        };
        fs.writeFileSync(cmdPath, JSON.stringify(cmdData, null, 2));
    }
}
