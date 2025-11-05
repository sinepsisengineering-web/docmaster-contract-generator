
import type { Contract } from '../types';

export const generateContractNumber = (abbreviation: string, existingContracts: Contract[]): string => {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;

    const todayContractsOfSameType = existingContracts.filter(c => {
        const contractDate = new Date(c.createdAt);
        return c.contractNumber.startsWith(`${datePrefix}-${abbreviation}`) &&
               contractDate.getFullYear() === today.getFullYear() &&
               contractDate.getMonth() === today.getMonth() &&
               contractDate.getDate() === today.getDate();
    });

    const nextSequentialNumber = todayContractsOfSameType.length + 1;
    const sequentialPart = nextSequentialNumber.toString().padStart(3, '0');

    return `${datePrefix}-${abbreviation}-${sequentialPart}`;
};
