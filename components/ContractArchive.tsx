
import React, { useState, useMemo } from 'react';
import type { Contract } from '../types';

const ContractArchive: React.FC<{ contracts: Contract[] }> = ({ contracts }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

    const filteredContracts = useMemo(() => {
        return contracts
            .filter(contract =>
                contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contract.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contract.templateName.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [contracts, searchTerm]);
    
    if (selectedContract) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <button onClick={() => setSelectedContract(null)} className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">← Назад к архиву</button>
                <h2 className="text-2xl font-bold mb-2">{selectedContract.contractNumber} - {selectedContract.templateName}</h2>
                <p className="text-gray-600 mb-4">Заказчик: {selectedContract.customerName} | Создан: {new Date(selectedContract.createdAt).toLocaleDateString()}</p>
                 <div className="prose max-w-none border p-8 rounded-md bg-gray-50 h-[60vh] overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: selectedContract.content.replace(/\n/g, '<br />') }} />
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Архив договоров</h2>
            <input
                type="text"
                placeholder="Поиск по номеру, заказчику или названию..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm mb-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Номер договора</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Заказчик</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип договора</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Действия</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredContracts.map(contract => (
                            <tr key={contract.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contract.contractNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.customerName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.templateName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(contract.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => setSelectedContract(contract)} className="text-indigo-600 hover:text-indigo-900">Просмотр</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredContracts.length === 0 && <p className="text-center text-gray-500 py-4">Договоры не найдены.</p>}
            </div>
        </div>
    );
};

export default ContractArchive;
