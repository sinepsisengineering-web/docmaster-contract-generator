

export const extractMarkers = (text: string): string[] => {
    const regex = /{{(.*?)}}/g;
    const matches = text.match(regex);
    if (!matches) {
        return [];
    }
    const uniqueMarkers = new Set(matches.map(m => m.replace(/{{|}}/g, '')));
    return Array.from(uniqueMarkers);
};

export const getCounterpartyMarkers = (type: 'individual' | 'legal'): string[] => {
    if (type === 'legal') {
        return [
            'НАИМЕНОВАНИЕ_КОМПАНИИ',
            'ЮРИДИЧЕСКИЙ_АДРЕС',
            'ИНН',
            'КПП',
            'ОГРН',
            'БАНКОВСКИЕ_РЕКВИЗИТЫ'
        ];
    }
    // Default to individual
    return [
        'ФИО_КОНТРАГЕНТА',
        'ПАСПОРТ_СЕРИЯ_НОМЕР',
        'ПАСПОРТ_ВЫДАН',
        'ДАТА_ВЫДАЧИ_ПАСПОРТА',
        'АДРЕС_РЕГИСТРАЦИИ'
    ];
};