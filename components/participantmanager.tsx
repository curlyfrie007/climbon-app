// components/ParticipantManager.tsx
'use client';

import { useState } from 'react';
import { useParticipantManager, StartClassType } from '@/hooks/useParticipants';

export default function ParticipantManager() {
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        startclass: 'Maennlich' as StartClassType,
        secret: ''
    });

    // Selected class for filtering
    const [selectedClass, setSelectedClass] = useState<StartClassType | null>(null);

    // Use the combined hook for all participant functionality
    const {
        participants,
        participantsLoading,
        participantsError,
        refetchParticipants,
        createParticipant,
        createLoading,
        createError,
        createSuccess,
        updateResults,
        updateLoading,
        updateError
    } = useParticipantManager();

    // Handle form input changes
    function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    // Handle form submission
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const result = await createParticipant(
            formData.name,
            formData.startclass,
            formData.secret
        );

        if (result) {
            // Reset form on success
            setFormData({
                name: '',
                startclass: 'Maennlich',
                secret: ''
            });

            // Refresh participant list
            refetchParticipants();
        }
    }

    // Handle class filter change
    const handleClassFilterChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as StartClassType | '';
        setSelectedClass(value as StartClassType || null);
    };

    // Handle updating a participant's results
    const handleUpdateResult = async (id: string) => {
        // Simple prompt UI for demo purposes
        const routeNumber = prompt("Enter route number (1-8):", "1");
        const zone = prompt("Enter zone (1-5):", "3");
        const attempts = prompt("Enter attempts:", "1");

        if (!routeNumber || !zone || !attempts) return;

        const result = await updateResults(
            id,
            parseInt(routeNumber, 10),
            parseInt(zone, 10),
            parseInt(attempts, 10)
        );

        if (result) {
            // Refresh participant list to show updated data
            refetchParticipants();
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Participants Manager</h1>

            {/* Registration Form */}
            <div className="bg-white p-4 rounded shadow mb-8">
                <h2 className="text-xl font-semibold mb-4">Register New Participant</h2>

                {createSuccess && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        Participant registered successfully!
                    </div>
                )}

                {createError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        Error: {createError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                            Name:
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="startclass" className="block text-sm font-medium mb-1">
                            Class:
                        </label>
                        <select
                            id="startclass"
                            name="startclass"
                            value={formData.startclass}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                        >
                            <option value="Maennlich">Male</option>
                            <option value="Weiblich">Female</option>
                            <option value="Maennlich_Ue40">Male 40+</option>
                            <option value="Weiblich_Ue40">Female 40+</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="secret" className="block text-sm font-medium mb-1">
                            Secret:
                        </label>
                        <input
                            id="secret"
                            name="secret"
                            type="password"
                            value={formData.secret}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={createLoading}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        {createLoading ? 'Registering...' : 'Register'}
                    </button>
                </form>
            </div>

            {/* Participants List */}
            <div className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Participants List</h2>

                    {/* Class Filter */}
                    <div className="flex items-center">
                        <label htmlFor="classFilter" className="mr-2">Filter by class:</label>
                        <select
                            id="classFilter"
                            value={selectedClass || ''}
                            onChange={handleClassFilterChange}
                            className="px-3 py-2 border border-gray-300 rounded"
                        >
                            <option value="">All Classes</option>
                            <option value="Maennlich">Male</option>
                            <option value="Weiblich">Female</option>
                            <option value="Maennlich_Ue40">Male 40+</option>
                            <option value="Weiblich_Ue40">Female 40+</option>
                        </select>

                        <button
                            onClick={refetchParticipants}
                            className="ml-2 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            ↻ Refresh
                        </button>
                    </div>
                </div>

                {participantsLoading ? (
                    <div className="text-center py-4">Loading participants...</div>
                ) : participantsError ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        Error: {participantsError}
                    </div>
                ) : participants.length === 0 ? (
                    <p className="text-gray-500 py-4">No participants found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Routes Completed</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {participants
                                    .filter(p => !selectedClass || p.startclass === selectedClass)
                                    .map((participant) => {
                                        // Count completed routes (zones > 0)
                                        const completedRoutes = Object.values(participant.results).filter(
                                            route => route.zone > 0
                                        ).length;

                                        return (
                                            <tr key={participant.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{participant.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{participant.startclass}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {new Date(participant.registrationDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {completedRoutes} / 8
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleUpdateResult(participant.id)}
                                                        disabled={updateLoading}
                                                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
                                                    >
                                                        Update Result
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}