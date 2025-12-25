'use client';

import { useState } from 'react';

// Mock data for professionals
const MOCK_PROFESSIONALS = [
    { id: '1', name: 'Dr. Ana Silva', specialty: 'Dermatologia', avatar: '👩‍⚕️' },
    { id: '2', name: 'Dr. Carlos Santos', specialty: 'Dermatologia', avatar: '👨‍⚕️' },
    { id: '3', name: 'Dra. Bia Costa', specialty: 'Estética', avatar: '👩‍⚕️' },
    { id: '4', name: 'João Oliveira', specialty: 'Massoterapia', avatar: '👨‍💼' },
    { id: '5', name: 'Maria Souza', specialty: 'Estética', avatar: '👩‍💼' },
];

export default function AgendaPage() {
    // State for professionals filter visibility
    const [showFilters, setShowFilters] = useState(true);

    // State for selected professionals (default: select all)
    const [selectedPros, setSelectedPros] = useState<string[]>(
        MOCK_PROFESSIONALS.map(p => p.id)
    );

    // Group professionals by specialty
    const professionalsBySpecialty = MOCK_PROFESSIONALS.reduce((acc, pro) => {
        if (!acc[pro.specialty]) {
            acc[pro.specialty] = [];
        }
        acc[pro.specialty].push(pro);
        return acc;
    }, {} as Record<string, typeof MOCK_PROFESSIONALS>);

    const toggleProfessional = (id: string) => {
        setSelectedPros(prev =>
            prev.includes(id)
                ? prev.filter(p => p !== id)
                : [...prev, id]
        );
    };

    const toggleAllInSpecialty = (specialty: string) => {
        const prosInSpecialty = professionalsBySpecialty[specialty].map(p => p.id);
        const allSelected = prosInSpecialty.every(id => selectedPros.includes(id));

        if (allSelected) {
            setSelectedPros(prev => prev.filter(id => !prosInSpecialty.includes(id)));
        } else {
            setSelectedPros(prev => [...Array.from(new Set([...prev, ...prosInSpecialty]))]);
        }
    };

    return (
        <div className="flex h-full gap-4 relative">

            {/* Toggle Button for Filter Panel (when hidden) */}
            {!showFilters && (
                <button
                    onClick={() => setShowFilters(true)}
                    className="absolute top-0 left-0 z-10 p-2 bg-white/80 backdrop-blur shadow-md rounded-r-md hover:bg-white transition-all text-slate-600"
                    title="Mostrar Filtros"
                >
                    👥
                </button>
            )}

            {/* Professionals Filter Column */}
            <div
                className={`
                    flex flex-col
                    glass rounded-2xl border border-white/40
                    transition-all duration-300 ease-in-out overflow-hidden
                    ${showFilters ? 'w-72 opacity-100' : 'w-0 opacity-0 border-0 p-0'}
                `}
            >
                <div className="p-4 border-b border-white/20 flex justify-between items-center bg-white/5">
                    <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                        <span>👥</span> Profissionais
                    </h2>
                    <button
                        onClick={() => setShowFilters(false)}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-black/5"
                        title="Recolher"
                    >
                        ◀
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {Object.entries(professionalsBySpecialty).map(([specialty, pros]) => (
                        <div key={specialty}>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    {specialty}
                                </h3>
                                <button
                                    onClick={() => toggleAllInSpecialty(specialty)}
                                    className="text-xs text-primary hover:underline"
                                >
                                    Toggle
                                </button>
                            </div>
                            <div className="space-y-2">
                                {pros.map(pro => (
                                    <div
                                        key={pro.id}
                                        className={`
                                            flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border
                                            ${selectedPros.includes(pro.id)
                                                ? 'bg-primary/5 border-primary/20 shadow-sm'
                                                : 'bg-white/30 border-transparent hover:bg-white/50'}
                                        `}
                                        onClick={() => toggleProfessional(pro.id)}
                                    >
                                        <div className={`
                                            w-4 h-4 rounded-full border flex items-center justify-center transition-colors
                                            ${selectedPros.includes(pro.id) ? 'bg-primary border-primary' : 'border-slate-300 bg-white'}
                                        `}>
                                            {selectedPros.includes(pro.id) && (
                                                <span className="text-white text-[10px]">✓</span>
                                            )}
                                        </div>
                                        <span className="text-lg">{pro.avatar}</span>
                                        <span className={`text-sm ${selectedPros.includes(pro.id) ? 'font-medium text-slate-800' : 'text-slate-500'}`}>
                                            {pro.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-3 border-t border-white/20 bg-white/5 text-xs text-center text-slate-400">
                    {selectedPros.length} selecionados
                </div>
            </div>

            {/* Main Agenda Grid */}
            <div className="flex-1 glass rounded-2xl border border-white/40 flex flex-col overflow-hidden relative">

                {/* Header / Date Navigation Placeholder */}
                <div className="h-16 border-b border-white/20 flex items-center justify-between px-6 bg-white/5">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-slate-800">25 de Dezembro, 2025</h1>
                        <span className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Hoje</span>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="flex-1 overflow-auto p-4 bg-white/30">
                    {selectedPros.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <span className="text-4xl mb-4">📅</span>
                            <p>Selecione um profissional para ver a agenda.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 h-full" style={{
                            gridTemplateColumns: `repeat(${selectedPros.length}, minmax(250px, 1fr))`
                        }}>
                            {/* Columns for each selected professional */}
                            {selectedPros.map(proId => {
                                const pro = MOCK_PROFESSIONALS.find(p => p.id === proId);
                                if (!pro) return null;
                                return (
                                    <div key={pro.id} className="flex flex-col h-full">
                                        {/* Column Header */}
                                        <div className="bg-white/60 p-3 rounded-t-lg border border-b-0 border-white/30 flex items-center justify-center gap-2 shadow-sm">
                                            <span>{pro.avatar}</span>
                                            <span className="font-medium text-slate-700">{pro.name}</span>
                                        </div>

                                        {/* Column Body (Time Slots) */}
                                        <div className="flex-1 bg-white/20 border border-white/30 rounded-b-lg p-2 space-y-2 overflow-y-auto">
                                            {/* Mock Slots */}
                                            {['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                                                <div key={time} className="h-20 border-b border-white/10 last:border-0 relative group">
                                                    <span className="text-xs text-slate-400 absolute top-1 left-1">{time}</span>
                                                    <div className="absolute inset-0 hover:bg-white/20 rounded cursor-pointer transition-colors" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
