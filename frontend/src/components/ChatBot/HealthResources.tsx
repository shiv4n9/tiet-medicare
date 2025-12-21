import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Book,
  Video,
  FileText,
  ExternalLink,
  Heart,
  Brain,
  Activity,
  Utensils,
  Moon,
  Users,
  Shield,
  Stethoscope,
  Pill,
  Calendar,
  Clock
} from 'lucide-react';

interface HealthResource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'article' | 'video' | 'guide' | 'tool' | 'external';
  icon: React.ComponentType<any>;
  color: string;
  content?: string;
  url?: string;
  duration?: string;
}

interface HealthResourcesProps {
  onClose: () => void;
  onSendMessage: (message: string) => void;
}

const HealthResources: React.FC<HealthResourcesProps> = ({ onClose, onSendMessage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedResource, setSelectedResource] = useState<HealthResource | null>(null);

  const categories = [
    { id: 'all', name: 'All Resources', icon: Book },
    { id: 'mental-health', name: 'Mental Health', icon: Brain },
    { id: 'physical-health', name: 'Physical Health', icon: Heart },
    { id: 'nutrition', name: 'Nutrition', icon: Utensils },
    { id: 'fitness', name: 'Fitness', icon: Activity },
    { id: 'sleep', name: 'Sleep', icon: Moon },
    { id: 'relationships', name: 'Relationships', icon: Users },
    { id: 'safety', name: 'Safety', icon: Shield },
    { id: 'preventive', name: 'Preventive Care', icon: Stethoscope }
  ];

  const resources: HealthResource[] = [
    // Mental Health Resources
    {
      id: 'anxiety-guide',
      title: 'Understanding and Managing Anxiety',
      description: 'Comprehensive guide to recognizing anxiety symptoms and coping strategies',
      category: 'mental-health',
      type: 'guide',
      icon: Brain,
      color: 'text-blue-600',
      duration: '15 min read',
      content: `# Understanding and Managing Anxiety

## What is Anxiety?
Anxiety is a normal stress response, but when it becomes excessive or persistent, it can interfere with daily life.

## Common Symptoms:
- Excessive worry or fear
- Restlessness or feeling on edge
- Difficulty concentrating
- Physical symptoms (rapid heartbeat, sweating, trembling)
- Sleep disturbances
- Avoidance of certain situations

## Coping Strategies:

### 1. Breathing Techniques
- 4-7-8 breathing: Inhale for 4, hold for 7, exhale for 8
- Box breathing: 4 counts in, hold 4, out 4, hold 4

### 2. Grounding Techniques
- 5-4-3-2-1 method: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste
- Progressive muscle relaxation

### 3. Lifestyle Changes
- Regular exercise (30 minutes daily)
- Limit caffeine and alcohol
- Maintain consistent sleep schedule
- Practice mindfulness or meditation

### 4. When to Seek Help
- Anxiety interferes with daily activities
- Physical symptoms are severe
- You're avoiding important situations
- Thoughts of self-harm occur

## Campus Resources:
- TICC Counseling: G-Block 104-105
- Dr. Sonam Dullat: sonam.dullat@thapar.edu
- Ms. Sukhpreet Kaur: sukhpreet.kaur@thapar.edu
- TIET Toll-Free: 1800 202 4100
- Peer Support Groups: Weekly meetings
- Stress Management Workshops: Monthly sessions`
    },
    {
      id: 'depression-support',
      title: 'Depression: Signs, Support, and Recovery',
      description: 'Information about depression symptoms and pathways to recovery',
      category: 'mental-health',
      type: 'article',
      icon: Heart,
      color: 'text-red-600',
      duration: '12 min read',
      content: `# Depression: Signs, Support, and Recovery

## Understanding Depression
Depression is more than feeling sad - it's a serious mental health condition that affects how you think, feel, and handle daily activities.

## Warning Signs:
- Persistent sad, anxious, or empty mood
- Loss of interest in activities once enjoyed
- Significant weight loss or gain
- Sleep disturbances (insomnia or oversleeping)
- Fatigue or loss of energy
- Feelings of worthlessness or guilt
- Difficulty concentrating or making decisions
- Thoughts of death or suicide

## Types of Depression:
- Major Depressive Disorder
- Persistent Depressive Disorder
- Seasonal Affective Disorder
- Bipolar Disorder

## Treatment Options:
### Professional Help
- Psychotherapy (CBT, DBT, IPT)
- Medication (antidepressants)
- Combination therapy

### Self-Care Strategies
- Regular exercise routine
- Healthy sleep habits
- Nutritious diet
- Social connections
- Mindfulness practices
- Journaling

## Recovery Tips:
1. Set small, achievable goals
2. Stay connected with supportive people
3. Avoid alcohol and drugs
4. Challenge negative thoughts
5. Practice self-compassion

## Crisis Resources:
- TIET Toll-Free: 1800 202 4100
- TIET Ambulance: +91 8288008122
- iCall (TISS): 9152987821
- Vandrevala Foundation: 1860-2662-345
- TICC: G-Block 104-105

Remember: Depression is treatable, and recovery is possible.`
    },
    {
      id: 'stress-management',
      title: 'Effective Stress Management Techniques',
      description: 'Practical strategies for managing academic and life stress',
      category: 'mental-health',
      type: 'tool',
      icon: Activity,
      color: 'text-orange-600',
      duration: '10 min read',
      content: `# Effective Stress Management Techniques

## Understanding Stress
Stress is your body's response to challenges or demands. While some stress is normal and can be motivating, chronic stress can harm your health.

## Types of Stress:
- **Acute Stress**: Short-term, immediate response
- **Chronic Stress**: Long-term, ongoing pressure
- **Academic Stress**: Related to studies and performance

## Quick Stress Relief (2-5 minutes):
1. **Deep Breathing**: 4-7-8 technique
2. **Progressive Muscle Relaxation**: Tense and release muscle groups
3. **Mindful Observation**: Focus on your surroundings
4. **Positive Self-Talk**: Replace negative thoughts
5. **Quick Walk**: Get moving for instant relief

## Long-term Stress Management:

### Time Management
- Use planners or digital calendars
- Break large tasks into smaller steps
- Set realistic deadlines
- Learn to say "no" to overcommitment

### Lifestyle Changes
- Regular exercise (reduces cortisol)
- Adequate sleep (7-9 hours)
- Healthy nutrition
- Limit caffeine and sugar
- Stay hydrated

### Relaxation Techniques
- Meditation (start with 5 minutes daily)
- Yoga or stretching
- Listening to calming music
- Reading for pleasure
- Hobbies and creative activities

### Social Support
- Talk to friends and family
- Join study groups
- Participate in campus activities
- Consider counseling services

## Academic Stress Specific Tips:
- Create a study schedule
- Use active learning techniques
- Form study groups
- Utilize campus resources (tutoring, library)
- Practice test-taking strategies
- Maintain work-life balance

## When Stress Becomes Overwhelming:
- Physical symptoms persist
- Sleep is significantly affected
- Academic performance declines
- Relationships suffer
- You feel hopeless or anxious constantly

## Campus Resources:
- TICC Counseling: G-Block 104-105
- Dr. Sonam Dullat: sonam.dullat@thapar.edu
- Ms. Sukhpreet Kaur: sukhpreet.kaur@thapar.edu
- Academic Success Center
- Stress Management Workshops
- Peer Tutoring Programs
- Recreation Center`
    },
    // Physical Health Resources
    {
      id: 'nutrition-basics',
      title: 'Nutrition Fundamentals for Students',
      description: 'Essential nutrition information for maintaining energy and health',
      category: 'nutrition',
      type: 'guide',
      icon: Utensils,
      color: 'text-green-600',
      duration: '8 min read',
      content: `# Nutrition Fundamentals for Students

## Why Nutrition Matters
Proper nutrition fuels your brain, supports immune function, and maintains energy levels for academic success.

## Essential Nutrients:

### Macronutrients
- **Carbohydrates**: Primary energy source (45-65% of calories)
  - Choose complex carbs: whole grains, fruits, vegetables
  - Limit simple sugars and processed foods

- **Proteins**: Building blocks for muscles and brain (10-35% of calories)
  - Sources: lean meats, fish, eggs, beans, nuts, dairy
  - Aim for protein at each meal

- **Fats**: Essential for brain function (20-35% of calories)
  - Healthy fats: avocados, nuts, olive oil, fatty fish
  - Limit saturated and trans fats

### Micronutrients
- **Vitamins**: Support various body functions
- **Minerals**: Essential for bone health, immune function
- **Water**: Crucial for all body processes (8-10 glasses daily)

## Student-Friendly Meal Planning:

### Breakfast Ideas
- Oatmeal with berries and nuts
- Greek yogurt with granola
- Whole grain toast with avocado
- Smoothie with fruits and protein powder

### Lunch Options
- Quinoa bowl with vegetables and protein
- Whole grain sandwich with lean protein
- Salad with mixed greens, protein, and healthy fats
- Soup with whole grain bread

### Dinner Suggestions
- Grilled fish/chicken with roasted vegetables
- Stir-fry with brown rice
- Bean and vegetable curry
- Whole grain pasta with vegetables

### Healthy Snacks
- Apple with almond butter
- Greek yogurt with berries
- Hummus with vegetables
- Trail mix (nuts, seeds, dried fruit)

## Eating on a Budget:
- Buy seasonal produce
- Purchase in bulk (grains, legumes)
- Cook at home more often
- Use frozen fruits and vegetables
- Plan meals and make shopping lists

## Dorm Room Nutrition:
- Keep healthy snacks available
- Use a mini-fridge for fresh foods
- Invest in basic cooking equipment
- Utilize campus dining options wisely

## Hydration Tips:
- Carry a water bottle
- Drink water before, during, and after meals
- Limit sugary drinks and excessive caffeine
- Monitor urine color (pale yellow is ideal)

## Special Considerations:
- **Exam Period**: Focus on brain foods (omega-3s, antioxidants)
- **Athletic Students**: Increase protein and calorie needs
- **Vegetarian/Vegan**: Ensure adequate B12, iron, and protein
- **Food Allergies**: Read labels carefully, have emergency plan

## Warning Signs of Poor Nutrition:
- Constant fatigue
- Frequent illness
- Difficulty concentrating
- Mood swings
- Hair loss or brittle nails

## Campus Resources:
- TIET Health Centre: 1800 202 4100
- Dining Services Nutritionist
- Health Center Nutrition Counseling
- Cooking Classes
- Campus Garden Programs`
    },
    {
      id: 'exercise-guide',
      title: 'Fitness for Busy Students',
      description: 'Time-efficient exercise routines that fit student schedules',
      category: 'fitness',
      type: 'guide',
      icon: Activity,
      color: 'text-purple-600',
      duration: '10 min read',
      content: `# Fitness for Busy Students

## Benefits of Regular Exercise
- Improved academic performance
- Better mood and reduced stress
- Enhanced sleep quality
- Stronger immune system
- Increased energy levels
- Better time management skills

## Exercise Recommendations:
- **Aerobic Activity**: 150 minutes moderate or 75 minutes vigorous per week
- **Strength Training**: 2+ days per week
- **Flexibility**: Daily stretching or yoga

## Quick Workouts (15-30 minutes):

### Dorm Room Workout (No Equipment)
1. **Warm-up** (3 minutes): Jumping jacks, arm circles
2. **Circuit** (repeat 3x):
   - Push-ups (10-15 reps)
   - Squats (15-20 reps)
   - Plank (30-60 seconds)
   - Lunges (10 per leg)
   - Mountain climbers (20 reps)
3. **Cool-down** (3 minutes): Stretching

### Study Break Exercises (5-10 minutes):
- Desk stretches
- Wall push-ups
- Calf raises while reading
- Seated leg extensions
- Neck and shoulder rolls

### Campus Gym Routine (30 minutes):
1. **Warm-up** (5 minutes): Treadmill or bike
2. **Strength Training** (20 minutes):
   - Compound movements (squats, deadlifts, bench press)
   - 3 sets of 8-12 reps
3. **Cool-down** (5 minutes): Stretching

## Outdoor Activities:
- Walking or jogging around campus
- Intramural sports
- Hiking local trails
- Cycling
- Outdoor fitness classes

## Time Management Tips:
- Schedule workouts like classes
- Use active transportation (walk/bike to class)
- Take stairs instead of elevators
- Exercise with friends for accountability
- Use fitness apps for guided workouts

## Staying Motivated:
- Set realistic, specific goals
- Track progress (apps, journals)
- Find activities you enjoy
- Reward achievements
- Join fitness groups or classes

## Exercise and Academic Performance:
- **Before Studying**: Light exercise improves focus
- **Study Breaks**: Movement prevents mental fatigue
- **Before Exams**: Moderate exercise reduces anxiety
- **After Long Study Sessions**: Stretching prevents stiffness

## Common Barriers and Solutions:

### "No Time"
- Use micro-workouts (5-10 minutes)
- Combine activities (walk while listening to lectures)
- Wake up 20 minutes earlier

### "No Energy"
- Start with light activities
- Exercise actually increases energy
- Ensure adequate sleep and nutrition

### "No Equipment"
- Bodyweight exercises are effective
- Use campus recreation facilities
- Invest in basic equipment (resistance bands)

### "Don't Know How"
- Take fitness classes
- Use workout apps
- Ask gym staff for help
- Exercise with experienced friends

## Safety Considerations:
- Start slowly and progress gradually
- Stay hydrated
- Listen to your body
- Warm up and cool down
- Use proper form to prevent injury

## Campus Resources:
- TIET Sports Complex
- Campus Gym
- Fitness Classes
- Personal Training Services
- Intramural Sports
- Outdoor Adventure Programs
- Bike Rental Programs`
    },
    {
      id: 'sleep-hygiene',
      title: 'Sleep Hygiene for Academic Success',
      description: 'Strategies for better sleep quality and consistent sleep schedules',
      category: 'sleep',
      type: 'guide',
      icon: Moon,
      color: 'text-indigo-600',
      duration: '7 min read',
      content: `# Sleep Hygiene for Academic Success

## Why Sleep Matters for Students
- Memory consolidation and learning
- Improved concentration and focus
- Better emotional regulation
- Stronger immune system
- Enhanced problem-solving abilities

## Sleep Requirements:
- **Young Adults (18-25)**: 7-9 hours per night
- **Quality over Quantity**: Deep, uninterrupted sleep is crucial

## Sleep Hygiene Principles:

### 1. Consistent Sleep Schedule
- Go to bed and wake up at the same time daily
- Maintain schedule even on weekends
- Avoid "catching up" on sleep with long naps

### 2. Create a Sleep-Conducive Environment
- **Temperature**: Cool (60-67°F/15-19°C)
- **Darkness**: Use blackout curtains or eye mask
- **Quiet**: Earplugs or white noise machine
- **Comfortable**: Quality mattress and pillows

### 3. Pre-Sleep Routine (30-60 minutes before bed)
- Dim lights gradually
- Avoid screens or use blue light filters
- Relaxing activities: reading, gentle stretching, meditation
- Avoid stimulating content (intense movies, stressful news)

### 4. Daytime Habits
- **Morning Light**: Get sunlight within 30 minutes of waking
- **Exercise**: Regular physical activity (not close to bedtime)
- **Caffeine**: Avoid after 2 PM
- **Naps**: Limit to 20-30 minutes before 3 PM

## Common Sleep Disruptors for Students:

### Academic Stress
- **Solution**: Practice stress management techniques
- Use relaxation exercises before bed
- Keep a worry journal to "park" concerns

### Irregular Schedule
- **Solution**: Prioritize consistent sleep times
- Plan study schedule around sleep needs
- Avoid all-nighters when possible

### Social Activities
- **Solution**: Balance social life with sleep needs
- Choose earlier social activities when possible
- Limit alcohol consumption (disrupts sleep quality)

### Technology Use
- **Solution**: Digital sunset 1 hour before bed
- Use blue light filters on devices
- Keep phones out of the bedroom

## Dorm Room Sleep Optimization:

### Roommate Considerations
- Discuss sleep schedules and preferences
- Use sleep masks and earplugs
- Establish quiet hours
- Consider room dividers for privacy

### Noise Management
- White noise apps or machines
- Earplugs designed for sleeping
- Communicate with neighbors about noise

### Light Control
- Blackout curtains or eye masks
- Cover LED lights on electronics
- Use dim, warm lighting in evening

## Sleep and Academic Performance:

### Before Exams
- Maintain regular sleep schedule
- Avoid cramming late into the night
- Get adequate sleep before test day

### During Busy Periods
- Prioritize sleep over less important activities
- Use power naps strategically (20 minutes max)
- Focus on sleep efficiency rather than duration

## Troubleshooting Sleep Problems:

### Difficulty Falling Asleep
- Progressive muscle relaxation
- 4-7-8 breathing technique
- Visualization exercises
- Avoid clock-watching

### Frequent Waking
- Identify and address causes (noise, temperature, stress)
- Practice returning to sleep techniques
- Avoid checking phone if you wake up

### Early Morning Waking
- Ensure room stays dark
- Avoid caffeine late in day
- Manage stress and anxiety

## When to Seek Help:
- Persistent insomnia (>3 weeks)
- Excessive daytime sleepiness
- Loud snoring or breathing interruptions
- Restless legs or periodic limb movements
- Sleep significantly impacts academic performance

## Natural Sleep Aids:
- **Herbal teas**: Chamomile, valerian root, passionflower
- **Magnesium**: Supplement or Epsom salt bath
- **Melatonin**: Consult healthcare provider first
- **Aromatherapy**: Lavender essential oil

## Campus Resources:
- TIET Health Centre: 1800 202 4100
- TICC Counseling (for sleep-related anxiety): G-Block 104-105
- Stress Management Workshops
- Quiet Study Spaces
- 24-hour Library (for schedule flexibility)`
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleResourceClick = (resource: HealthResource) => {
    if (resource.type === 'external' && resource.url) {
      window.open(resource.url, '_blank');
    } else {
      setSelectedResource(resource);
    }
  };

  const shareResource = (resource: HealthResource) => {
    const message = `📚 Health Resource: ${resource.title}\n\n${resource.description}\n\nWould you like me to provide more information about this topic or help you find additional resources?`;
    onSendMessage(message);
  };

  if (selectedResource) {
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <Button 
            onClick={() => setSelectedResource(null)}
            className="bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            ← Back to Resources
          </Button>
          <Button 
            onClick={() => shareResource(selectedResource)}
            className="bg-blue-100 text-blue-700 hover:bg-blue-200"
          >
            Share to Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center mb-2">
                <selectedResource.icon className={`w-6 h-6 mr-2 ${selectedResource.color}`} />
                <CardTitle className="text-lg">{selectedResource.title}</CardTitle>
              </div>
              <p className="text-gray-600">{selectedResource.description}</p>
              {selectedResource.duration && (
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <Clock className="w-4 h-4 mr-1" />
                  {selectedResource.duration}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {selectedResource.content}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button 
          onClick={onClose}
          className="mt-4 bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Close Resources
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-3">Health Resources Library</h3>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-sm flex items-center transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-3 h-3 mr-1" />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredResources.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Book className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No resources found matching your criteria.</p>
            <p className="text-sm">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          filteredResources.map((resource) => {
            const Icon = resource.icon;
            const TypeIcon = resource.type === 'video' ? Video : 
                           resource.type === 'guide' ? Book :
                           resource.type === 'tool' ? Activity :
                           resource.type === 'external' ? ExternalLink : FileText;
            
            return (
              <motion.div
                key={resource.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <Icon className={`w-6 h-6 mr-3 mt-1 ${resource.color}`} />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">{resource.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center">
                              <TypeIcon className="w-3 h-3 mr-1" />
                              {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                            </div>
                            {resource.duration && (
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {resource.duration}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            shareResource(resource);
                          }}
                          className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs px-2 py-1"
                        >
                          Share
                        </Button>
                        <Button
                          onClick={() => handleResourceClick(resource)}
                          className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs px-2 py-1"
                        >
                          {resource.type === 'external' ? 'Visit' : 'Read'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      <Button 
        onClick={onClose}
        className="mt-4 bg-gray-200 text-gray-700 hover:bg-gray-300"
      >
        Close Resources
      </Button>
    </div>
  );
};

export default HealthResources;