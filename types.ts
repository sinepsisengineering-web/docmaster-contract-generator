

export interface Template {
    id: string;
    name: string;
    categoryId: string | null;
    isAppendix: boolean;
    abbreviation: string;
    
    // New structured content
    header: string;
    body: string;
    
    // Document settings
    autoDate: boolean;
    autoNumbering: boolean;

    // Parties' details for preamble and footer
    partyOneDetails: {
        roleName: string; // e.g. Исполнитель
        companyName: string; // e.g. ООО "Ромашка"
        representative: string; // e.g. в лице Генерального директора Иванова И.И.
        basis: string; // e.g. действующего на основании Устава
        fullDetails: string; // For the footer block (ИНН, ОГРН, Адрес...)
    };
    counterpartyType: 'individual' | 'legal';
}

export interface Category {
    id: string;
    name:string;
}

export interface MarkerValue {
    name: string;
    value: string;
}

export interface Contract {
    id: string;
    contractNumber: string;
    templateName: string;
    customerName: string;
    content: string;
    createdAt: string;
    markers: MarkerValue[];
}

export interface MarkerInfo {
    name: string;
    type: 'text' | 'number' | 'date' | 'email' | 'textarea' | 'select';
    options?: string[];
}

// FIX: Add ChatMessage type for the chatbot component.
export interface ChatMessage {
    role: 'user' | 'bot';
    content: string;
}
