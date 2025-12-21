import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Smile, 
  Meh, 
  Frown, 
  Calendar,
  TrendingUp,
  Heart,
  Brain,
  Sun,
  Cloud,
  CloudRain
} from 'lucide-react';

interface MoodEntry {
  date: string;
  mood: number; // 1-5 scale
  energy: number;
  stress: number;
  notes?: string;
  triggers?: string[];
}

interface MoodTrackerProps {
  onClose: () => void;
  onSendMessage: (message: string) => void;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ onClose, onSendMessage }) => {
  const [currentMood, setCurrentMood] = useState<number>(3);
  const [currentEnergy, setCurrentEnergy] = useState<number>(3);
  const [currentStress, setCurrentStress] = useState<number>(3);
  const [notes, setNotes] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const moodEmojis = [
    { value: 1, emoji: '😢', label: 'Very Low', color: 'text-red-500', icon: CloudRain },
    { value: 2, emoji: '😔', label: 'Low', color: 'text-orange-500', icon: Cloud },
    { value: 3, emoji: '😐', label: 'Neutral', color: 'text-yellow-500', icon: Meh },
    { value: 4, emoji: '🙂', label: 'Good', color: 'text-green-500', icon: Smile },
    { value: 5, emoji: '😊', label: 'Excellent', color: 'text-blue-500', icon: Sun }
  ];

  const commonTriggers = [
    'Academic stress', 'Social anxiety', 'Financial worry', 'Family issues',
    'Health concerns', 'Sleep problems', 'Work pressure', 'Relationship issues',
    'Weather', 'Exercise', 'Diet', 'Social media'
  ];

  useEffect(() => {
    // Load mood history from localStorage
    const saved = localStorage.getItem('moodHistory');
    if (saved) {
      setMoodHistory(JSON.parse(saved));
    }
  }, []);

  const saveMoodEntry = () => {
    const today = new Date().toISOString().split('T')[0];
    const newEntry: MoodEntry = {
      date: today,
      mood: currentMood,
      energy: currentEnergy,
      stress: currentStress,
      notes: notes.trim() || undefined,
      triggers: selectedTriggers.length > 0 ? selectedTriggers : undefined
    };

    const updatedHistory = [
      ...moodHistory.filter(entry => entry.date !== today),
      newEntry
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setMoodHistory(updatedHistory);
    localStorage.setItem('moodHistory', JSON.stringify(updatedHistory));

    // Generate insights message
    const insights = generateMoodInsights(newEntry, updatedHistory);
    onSendMessage(`Mood logged for today! ${insights}`);
    onClose();
  };

  const generateMoodInsights = (entry: MoodEntry, history: MoodEntry[]): string => {
    const recentEntries = history.slice(0, 7); // Last 7 days
    const avgMood = recentEntries.reduce((sum, e) => sum + e.mood, 0) / recentEntries.length;
    
    let insight = '';
    
    if (entry.mood >= 4) {
      insight = "Great to see you're feeling positive! ";
    } else if (entry.mood <= 2) {
      insight = "I notice you're having a tough day. ";
    }

    if (recentEntries.length >= 3) {
      if (avgMood > 3.5) {
        insight += "Your mood trend looks positive this week. Keep up the good habits!";
      } else if (avgMood < 2.5) {
        insight += "Your mood has been low recently. Consider visiting TICC at G-Block 104-105 for support.";
      } else {
        insight += "Your mood has been fairly stable. Focus on self-care activities.";
      }
    }

    if (entry.stress >= 4) {
      insight += " Your stress level is high - try some breathing exercises or visit TICC counseling.";
    }

    return insight;
  };

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const getWeeklyAverage = () => {
    const lastWeek = moodHistory.slice(0, 7);
    if (lastWeek.length === 0) return null;
    
    const avgMood = lastWeek.reduce((sum, entry) => sum + entry.mood, 0) / lastWeek.length;
    return Math.round(avgMood * 10) / 10;
  };

  if (showHistory) {
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Mood History</h3>
          <Button 
            onClick={() => setShowHistory(false)}
            className="bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Back to Tracker
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {moodHistory.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">No mood entries yet. Start tracking today!</p>
          ) : (
            <>
              {getWeeklyAverage() && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-medium">Weekly Average</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">
                        {getWeeklyAverage()}/5
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {moodHistory.map((entry, index) => {
                const moodData = moodEmojis.find(m => m.value === entry.mood);
                return (
                  <Card key={entry.date} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">
                          {new Date(entry.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">{moodData?.emoji}</span>
                          <span className={`font-medium ${moodData?.color}`}>
                            {moodData?.label}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                        <div className="text-center">
                          <Heart className="w-4 h-4 mx-auto text-red-500 mb-1" />
                          <div>Energy: {entry.energy}/5</div>
                        </div>
                        <div className="text-center">
                          <Brain className="w-4 h-4 mx-auto text-purple-500 mb-1" />
                          <div>Stress: {entry.stress}/5</div>
                        </div>
                        <div className="text-center">
                          <Smile className="w-4 h-4 mx-auto text-green-500 mb-1" />
                          <div>Mood: {entry.mood}/5</div>
                        </div>
                      </div>

                      {entry.triggers && entry.triggers.length > 0 && (
                        <div className="mb-2">
                          <div className="text-xs text-gray-500 mb-1">Triggers:</div>
                          <div className="flex flex-wrap gap-1">
                            {entry.triggers.map(trigger => (
                              <span key={trigger} className="px-2 py-1 bg-gray-100 text-xs rounded">
                                {trigger}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {entry.notes && (
                        <div className="text-sm text-gray-600 italic">
                          "{entry.notes}"
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </>
          )}
        </div>

        <Button onClick={onClose} className="mt-4 bg-gray-200 text-gray-700 hover:bg-gray-300">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-lg font-semibold">Daily Mood Check-in</h3>
        <Button 
          onClick={() => setShowHistory(true)}
          className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs px-2 py-1"
        >
          <Calendar className="w-3 h-3 mr-1" />
          History
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pb-2">
        {/* Mood Selection */}
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm flex items-center">
              <Smile className="w-4 h-4 mr-2 text-green-500" />
              How are you feeling today?
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="grid grid-cols-5 gap-1">
              {moodEmojis.map((mood) => (
                <motion.button
                  key={mood.value}
                  onClick={() => setCurrentMood(mood.value)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    currentMood === mood.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-xl mb-0.5">{mood.emoji}</div>
                  <div className="text-[10px] text-gray-600">{mood.label}</div>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Energy & Stress in one row */}
        <div className="grid grid-cols-2 gap-2">
          {/* Energy Level */}
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs flex items-center">
                <Heart className="w-3 h-3 mr-1 text-red-500" />
                Energy
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setCurrentEnergy(level)}
                    className={`flex-1 h-6 rounded ${
                      currentEnergy >= level ? 'bg-red-400' : 'bg-gray-200'
                    } transition-colors`}
                  />
                ))}
              </div>
              <div className="text-center mt-1 text-xs text-gray-600">{currentEnergy}/5</div>
            </CardContent>
          </Card>

          {/* Stress Level */}
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs flex items-center">
                <Brain className="w-3 h-3 mr-1 text-purple-500" />
                Stress
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setCurrentStress(level)}
                    className={`flex-1 h-6 rounded ${
                      currentStress >= level ? 'bg-purple-400' : 'bg-gray-200'
                    } transition-colors`}
                  />
                ))}
              </div>
              <div className="text-center mt-1 text-xs text-gray-600">{currentStress}/5</div>
            </CardContent>
          </Card>
        </div>

        {/* Triggers */}
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm">What influenced your mood?</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="grid grid-cols-3 gap-1">
              {commonTriggers.map((trigger) => (
                <button
                  key={trigger}
                  onClick={() => toggleTrigger(trigger)}
                  className={`p-1.5 text-xs rounded border transition-all ${
                    selectedTriggers.includes(trigger)
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {trigger}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm">Additional notes (optional)</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How was your day? Any thoughts..."
              className="w-full p-2 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
              rows={2}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 pt-3 flex-shrink-0 border-t border-gray-100">
        <Button 
          onClick={onClose}
          className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Cancel
        </Button>
        <Button 
          onClick={saveMoodEntry}
          className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
        >
          Save Entry
        </Button>
      </div>
    </div>
  );
};

export default MoodTracker;