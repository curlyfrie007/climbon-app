"use client"
import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, GripVertical, Calendar, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Main component
const EventCreationForm = () => {
  // State for the form
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [eventData, setEventData] = useState({
    name: '',
    description: '',
    infoText: '',
    type: 'Bouldering',
    startingClasses: '',
    sponsors: '',
    rounds: [
      {
        id: 1,
        name: 'Qualification',
        mode: 'Flash',
        routesCount: 5,
        date: '',
        startTime: '',
        endTime: '',
        infoText: ''
      }
    ]
  });

  // Function to add a new round
  const addRound = () => {
    const newRound = {
      id: eventData.rounds.length + 1,
      name: `Round ${eventData.rounds.length + 1}`,
      mode: 'Flash',
      routesCount: 5,
      date: '',
      startTime: '',
      endTime: '',
      infoText: ''
    };
    setEventData({
      ...eventData,
      rounds: [...eventData.rounds, newRound]
    });
  };

  // Function to remove a round
  const removeRound = (id: number) => {
    setEventData({
      ...eventData,
      rounds: eventData.rounds.filter(round => round.id !== id)
    });
  };

  // Function to update round data
  const updateRound = (id: number, field: string, value: string | number) => {
    setEventData({
      ...eventData,
      rounds: eventData.rounds.map(round => 
        round.id === id ? { ...round, [field]: value } : round
      )
    });
  };

  // Function to move a round up or down
  const moveRound = (index: number, direction: string) => {
    const newRounds = [...eventData.rounds];
    if (direction === 'up' && index > 0) {
      [newRounds[index], newRounds[index - 1]] = [newRounds[index - 1], newRounds[index]];
    } else if (direction === 'down' && index < newRounds.length - 1) {
      [newRounds[index], newRounds[index + 1]] = [newRounds[index + 1], newRounds[index]];
    }
    setEventData({
      ...eventData,
      rounds: newRounds
    });
  };

  // Function to handle form submission
  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    console.log('Event data submitted:', eventData);
    setOpen(false);
  };

  // Function to go to next section
  const goToNextSection = () => {
    setActiveSection(activeSection + 1);
  };

  // Get available modes based on event type
  const getAvailableModes = (type: string) => {
    switch (type) {
      case 'Bouldering':
        return ['Flash', 'Top/Zone', '1000 points divided by ascents', 'Circuit format'];
      case 'Lead Climbing':
        return ['Lead - height reached', 'Lead - time-based', 'Lead - IFSC scoring'];
      case 'Speed':
        return ['Speed - knockout', 'Speed - best time'];
      default:
        return ['Flash'];
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <button 
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Create New Event
      </button>

      {open && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Create New Event</h2>
                <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                {/* Section 1: Basic Information */}
                <div className="border rounded-lg overflow-hidden">
                  <button
                    className={`w-full p-4 text-left font-medium flex justify-between items-center ${activeSection === 0 ? 'bg-blue-50' : 'bg-gray-50'}`}
                    onClick={() => setActiveSection(activeSection === 0 ? -1 : 0)}
                  >
                    <span>1. Basic Information</span>
                    {activeSection === 0 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  
                  {activeSection === 0 && (
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Event Name*
                        </label>
                        <input
                          type="text"
                          value={eventData.name}
                          onChange={(e) => setEventData({...eventData, name: e.target.value})}
                          className="w-full p-2 border rounded-md"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={eventData.description}
                          onChange={(e) => setEventData({...eventData, description: e.target.value})}
                          className="w-full p-2 border rounded-md"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Info Text After Registration
                        </label>
                        <textarea
                          value={eventData.infoText}
                          onChange={(e) => setEventData({...eventData, infoText: e.target.value})}
                          className="w-full p-2 border rounded-md"
                          rows={3}
                          placeholder="This text will be shown to participants after they register"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Event Type*
                        </label>
                        <select
                          value={eventData.type}
                          onChange={(e) => setEventData({...eventData, type: e.target.value})}
                          className="w-full p-2 border rounded-md"
                          required
                        >
                          <option value="Bouldering">Bouldering</option>
                          <option value="Lead Climbing">Lead Climbing</option>
                          <option value="Speed">Speed</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Starting Classes
                        </label>
                        <input
                          type="text"
                          value={eventData.startingClasses}
                          onChange={(e) => setEventData({...eventData, startingClasses: e.target.value})}
                          className="w-full p-2 border rounded-md"
                          placeholder="e.g. Male, Female, Youth, Masters"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sponsors
                        </label>
                        <input
                          type="text"
                          value={eventData.sponsors}
                          onChange={(e) => setEventData({...eventData, sponsors: e.target.value})}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <button
                          onClick={goToNextSection}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Section 2: Rounds Configuration */}
                <div className="border rounded-lg overflow-hidden">
                  <button
                    className={`w-full p-4 text-left font-medium flex justify-between items-center ${activeSection === 1 ? 'bg-blue-50' : 'bg-gray-50'}`}
                    onClick={() => setActiveSection(activeSection === 1 ? -1 : 1)}
                  >
                    <span>2. Rounds Configuration</span>
                    {activeSection === 1 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  
                  {activeSection === 1 && (
                    <div className="p-4 space-y-6">
                      <div className="space-y-4">
                        {eventData.rounds.map((round, index) => (
                          <div key={round.id} className="border rounded-lg p-4 relative">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <div className="mr-2 cursor-move">
                                  <GripVertical size={20} className="text-gray-400" />
                                </div>
                                <h3 className="font-medium">
                                  <input
                                    type="text"
                                    value={round.name}
                                    onChange={(e) => updateRound(round.id, 'name', e.target.value)}
                                    className="border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                  />
                                </h3>
                              </div>
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => moveRound(index, 'up')}
                                  disabled={index === 0}
                                  className={`p-1 rounded-full ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                  <ChevronUp size={16} />
                                </button>
                                <button 
                                  onClick={() => moveRound(index, 'down')}
                                  disabled={index === eventData.rounds.length - 1}
                                  className={`p-1 rounded-full ${index === eventData.rounds.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                  <ChevronDown size={16} />
                                </button>
                                {eventData.rounds.length > 1 && (
                                  <button 
                                    onClick={() => removeRound(round.id)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Mode
                                </label>
                                <select
                                  value={round.mode}
                                  onChange={(e) => updateRound(round.id, 'mode', e.target.value)}
                                  className="w-full p-2 border rounded-md"
                                >
                                  {getAvailableModes(eventData.type).map(mode => (
                                    <option key={mode} value={mode}>{mode}</option>
                                  ))}
                                </select>
                              </div>
                              
                              {eventData.type !== 'Speed' && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Number of {eventData.type === 'Bouldering' ? 'Boulders' : 'Routes'}
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={round.routesCount}
                                    onChange={(e) => updateRound(round.id, 'routesCount', parseInt(e.target.value))}
                                    className="w-full p-2 border rounded-md"
                                  />
                                </div>
                              )}
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  <div className="flex items-center">
                                    <Calendar size={16} className="mr-1" />
                                    Date
                                  </div>
                                </label>
                                <input
                                  type="date"
                                  value={round.date}
                                  onChange={(e) => updateRound(round.id, 'date', e.target.value)}
                                  className="w-full p-2 border rounded-md"
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center">
                                      <Clock size={16} className="mr-1" />
                                      Start Time
                                    </div>
                                  </label>
                                  <input
                                    type="time"
                                    value={round.startTime}
                                    onChange={(e) => updateRound(round.id, 'startTime', e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center">
                                      <Clock size={16} className="mr-1" />
                                      End Time
                                    </div>
                                  </label>
                                  <input
                                    type="time"
                                    value={round.endTime}
                                    onChange={(e) => updateRound(round.id, 'endTime', e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                  />
                                </div>
                              </div>
                              
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Round Info Text (Optional)
                                </label>
                                <textarea
                                  value={round.infoText}
                                  onChange={(e) => updateRound(round.id, 'infoText', e.target.value)}
                                  className="w-full p-2 border rounded-md"
                                  rows={2}
                                  placeholder="Additional information about this round"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-center">
                        <button
                          onClick={addRound}
                          className="flex items-center px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50"
                        >
                          <Plus size={16} className="mr-1" /> Add Round
                        </button>
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <button
                          onClick={goToNextSection}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Section 3: Summary */}
                <div className="border rounded-lg overflow-hidden">
                  <button
                    className={`w-full p-4 text-left font-medium flex justify-between items-center ${activeSection === 2 ? 'bg-blue-50' : 'bg-gray-50'}`}
                    onClick={() => setActiveSection(activeSection === 2 ? -1 : 2)}
                  >
                    <span>3. Summary</span>
                    {activeSection === 2 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  
                  {activeSection === 2 && (
                    <div className="p-4 space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">Event Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-medium">{eventData.name || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Type</p>
                            <p className="font-medium">{eventData.type}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Starting Classes</p>
                            <p className="font-medium">{eventData.startingClasses || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Sponsors</p>
                            <p className="font-medium">{eventData.sponsors || 'Not specified'}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-500">Description</p>
                            <p>{eventData.description || 'Not specified'}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-500">Info Text After Registration</p>
                            <p>{eventData.infoText || 'Not specified'}</p>
                          </div>
                        </div>
                        
                        <h3 className="font-medium text-lg">Rounds Configuration</h3>
                        <div className="space-y-3">
                          {eventData.rounds.map((round, index) => (
                            <div key={round.id} className="p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-medium text-blue-600 mb-2">{round.name}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">Mode</p>
                                  <p>{round.mode}</p>
                                </div>
                                {eventData.type !== 'Speed' && (
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Number of {eventData.type === 'Bouldering' ? 'Boulders' : 'Routes'}
                                    </p>
                                    <p>{round.routesCount}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm text-gray-500">Date</p>
                                  <p>{round.date || 'Not specified'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Time</p>
                                  <p>
                                    {round.startTime ? `${round.startTime}${round.endTime ? ` - ${round.endTime}` : ''}` : 'Not specified'}
                                  </p>
                                </div>
                                {round.infoText && (
                                  <div className="md:col-span-2">
                                    <p className="text-sm text-gray-500">Info Text</p>
                                    <p>{round.infoText}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {(!eventData.name) && (
                          <Alert className="bg-yellow-50 border-yellow-200">
                            <AlertDescription>
                              Please fill in all required fields marked with * before submitting.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        <div className="flex justify-end pt-4">
                          <button
                            onClick={handleSubmit}
                            disabled={!eventData.name}
                            className={`px-6 py-2 rounded-md ${!eventData.name ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white`}
                          >
                            Submit Event
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCreationForm;