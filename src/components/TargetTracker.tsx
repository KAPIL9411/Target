import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Target, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InstallPrompt from './InstallPrompt';

interface Target {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

const TargetTracker = () => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [newTarget, setNewTarget] = useState('');
  const { toast } = useToast();

  // Load targets from localStorage on mount
  useEffect(() => {
    const savedTargets = localStorage.getItem('dailyTargets');
    if (savedTargets) {
      try {
        const parsed = JSON.parse(savedTargets);
        setTargets(parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt)
        })));
      } catch (error) {
        console.error('Error loading targets:', error);
        toast({
          title: "Error",
          description: "Could not load your saved targets.",
          variant: "destructive"
        });
      }
    }
  }, [toast]);

  // Save targets to localStorage whenever targets change
  useEffect(() => {
    try {
      localStorage.setItem('dailyTargets', JSON.stringify(targets));
    } catch (error) {
      console.error('Error saving targets:', error);
      toast({
        title: "Error",
        description: "Could not save your targets.",
        variant: "destructive"
      });
    }
  }, [targets, toast]);

  const addTarget = () => {
    if (!newTarget.trim()) {
      toast({
        title: "Empty Target",
        description: "Please enter a target before adding.",
        variant: "destructive"
      });
      return;
    }

    const target: Target = {
      id: Date.now().toString(),
      text: newTarget.trim(),
      completed: false,
      createdAt: new Date()
    };

    setTargets(prev => [target, ...prev]); // Add to the top
    setNewTarget('');
    
    toast({
      title: "Target Added!",
      description: `"${target.text}" has been added to your list.`,
    });
  };

  const toggleTarget = (id: string) => {
    setTargets(prev => 
      prev.map(target => 
        target.id === id 
          ? { ...target, completed: !target.completed }
          : target
      )
    );
  };

  const deleteTarget = (id: string) => {
    const targetText = targets.find(t => t.id === id)?.text;
    setTargets(prev => prev.filter(target => target.id !== id));
    
    toast({
      title: "Target Removed",
      description: `"${targetText}" has been deleted.`,
      variant: "destructive"
    });
  };

  const clearCompleted = () => {
    const completedCount = targets.filter(t => t.completed).length;
    if (completedCount === 0) {
      toast({
        title: "Nothing to Clear",
        description: "You have no completed targets to clear.",
      });
      return;
    }
    setTargets(prev => prev.filter(target => !target.completed));
    toast({
      title: "Completed Targets Cleared",
      description: `Removed ${completedCount} completed targets.`,
    });
  };

  const { completedCount, totalCount, completionPercentage } = useMemo(() => {
    const completed = targets.filter(target => target.completed).length;
    const total = targets.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completedCount: completed, totalCount: total, completionPercentage: percentage };
  }, [targets]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTarget();
    }
  };

  return (
    <>
      <InstallPrompt />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black p-4 sm:p-6 lg:p-8 font-sans">
        <div className="max-w-2xl mx-auto animate-fade-in">
          {/* Header */}
          <header className="text-center mb-8">
            <div className="inline-block p-3 bg-blue-500 rounded-full shadow-lg mb-4">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 dark:text-white tracking-tight">
              Targetify
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg mt-2">
              Set, track, and conquer your daily goals.
            </p>
          </header>

          {/* Add New Target */}
          <Card className="mb-6 shadow-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 backdrop-blur-sm animate-scale-in">
            <CardContent className="p-4">
              <div className="flex gap-3 items-center">
                <Input
                  placeholder="What's your next target?"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-transparent focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded-md py-3 px-4 text-lg"
                />
                <Button 
                  onClick={addTarget}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md shadow-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
                  disabled={!newTarget.trim()}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Targets List and Progress */}
          {targets.length > 0 ? (
            <div className="space-y-4 animate-fade-in">
              {/* Progress Card */}
              <Card className="shadow-md border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Today's Progress</h3>
                    <span className="text-2xl font-bold text-blue-500">
                      {completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <p className="text-right text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {completedCount} of {totalCount} completed
                  </p>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={clearCompleted} disabled={completedCount === 0}>
                  <XCircle className="h-4 w-4 mr-2"/>
                  Clear Completed
                </Button>
              </div>

              {/* List */}
              <div className="space-y-3">
                {targets.map((target) => (
                  <Card 
                    key={target.id} 
                    className={`border-l-4 transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-sm ${ 
                      target.completed 
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/80'
                    }`}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <Checkbox
                        checked={target.completed}
                        onCheckedChange={() => toggleTarget(target.id)}
                        className="h-6 w-6 rounded-full data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 transition-all"
                      />
                      <span 
                        className={`flex-1 text-lg font-medium ${ 
                          target.completed 
                            ? 'line-through text-gray-400 dark:text-gray-500' 
                            : 'text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {target.text}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTarget(target.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full h-9 w-9"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="text-center py-12 px-6 shadow-md border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm animate-scale-in">
              <Target className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">No Targets Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Add your first target above to get started!
              </p>
            </Card>
          )}

          {/* Footer */}
          <footer className="text-center mt-12 text-gray-400 dark:text-gray-500">
            <p className="text-sm">
              Keep pushing forward. One target at a time.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default TargetTracker;