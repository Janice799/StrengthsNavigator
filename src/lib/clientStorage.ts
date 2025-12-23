// localStorage 기반 클라이언트 기록 관리
// 비용 제로: 모든 데이터는 브라우저에 저장됩니다

export interface ClientRecord {
    id: string;
    name: string;
    strengthIds: string[];
    archetypeId?: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export interface CardHistory {
    id: string;
    clientId: string;
    occasionId: string;
    archetypeId?: string;
    strengthId?: string;
    situation: string;
    message: string;
    createdAt: string;
    sharedUrl?: string;
}

const CLIENTS_KEY = 'resonant-year-clients';
const HISTORY_KEY = 'resonant-year-card-history';

// 클라이언트 CRUD
export function getClients(): ClientRecord[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(CLIENTS_KEY);
    return data ? JSON.parse(data) : [];
}

export function getClientById(id: string): ClientRecord | undefined {
    return getClients().find(c => c.id === id);
}

export function saveClient(client: Omit<ClientRecord, 'id' | 'createdAt' | 'updatedAt'>): ClientRecord {
    const clients = getClients();
    const newClient: ClientRecord = {
        ...client,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    clients.push(newClient);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    return newClient;
}

export function updateClient(id: string, updates: Partial<ClientRecord>): ClientRecord | null {
    const clients = getClients();
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) return null;

    clients[index] = {
        ...clients[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    return clients[index];
}

export function deleteClient(id: string): boolean {
    const clients = getClients();
    const filtered = clients.filter(c => c.id !== id);
    if (filtered.length === clients.length) return false;
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(filtered));
    return true;
}

export function searchClients(query: string): ClientRecord[] {
    const clients = getClients();
    const lowerQuery = query.toLowerCase();
    return clients.filter(c =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.notes.toLowerCase().includes(lowerQuery)
    );
}

// 카드 발송 기록
export function getCardHistory(): CardHistory[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
}

export function getCardHistoryByClient(clientId: string): CardHistory[] {
    return getCardHistory().filter(h => h.clientId === clientId);
}

export function saveCardHistory(history: Omit<CardHistory, 'id' | 'createdAt'>): CardHistory {
    const histories = getCardHistory();
    const newHistory: CardHistory = {
        ...history,
        id: generateId(),
        createdAt: new Date().toISOString()
    };
    histories.unshift(newHistory); // 최신순
    localStorage.setItem(HISTORY_KEY, JSON.stringify(histories));
    return newHistory;
}

// 데이터 내보내기/가져오기 (백업용)
export function exportData(): string {
    const data = {
        clients: getClients(),
        cardHistory: getCardHistory(),
        exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): { clients: number; history: number } {
    try {
        const data = JSON.parse(jsonString);
        if (data.clients) {
            localStorage.setItem(CLIENTS_KEY, JSON.stringify(data.clients));
        }
        if (data.cardHistory) {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(data.cardHistory));
        }
        return {
            clients: data.clients?.length || 0,
            history: data.cardHistory?.length || 0
        };
    } catch (e) {
        throw new Error('유효하지 않은 데이터 형식입니다.');
    }
}

// 유틸리티
function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 클라이언트 이름으로 빠른 검색 (자동완성용)
export function getClientNames(): string[] {
    return getClients().map(c => c.name);
}
