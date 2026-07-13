import { useState, useEffect } from 'react';
import { db, UserProfile } from './db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import FoodDiary from './components/FoodDiary';
import FoodSearch from './components/FoodSearch';
import WeightTracker from './components/WeightTracker';
import ExerciseLog from './components/ExerciseLog';
import BarcodeScanner from './components/BarcodeScanner';
import Recipes from './components/Recipes';
import Settings from './components/Settings';
import AICoach from './components/AICoach';
import WaterTracker from './components/WaterTracker';
import BodyMeasurements from './components/BodyMeasurements';
import WeeklyReport from './components/WeeklyReport';
import WorkoutTrainer from './components/WorkoutTrainer';
import VoiceCloneSetup from './components/VoiceCloneSetup';

type Page =
  | 'dashboard'
  | 'diary'
  | 'search'
  | 'weight'
  | 'exercise'
  | 'scanner'
  | 'recipes'
  | 'ai'
  | 'water'
  | 'body'
  | 'report'
  | 'workout'
  | 'voice'
  | 'settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [showSetup, setShowSetup] = useState(false);

  const profile = useLiveQuery(() => db.userProfile.get(1));

  useEffect(() => {
    if (profile === undefined) return; // loading
    if (!profile) setShowSetup(true);
    else setShowSetup(false);
  }, [profile]);

  const handleSetupComplete = () => {
    setShowSetup(false);
  };

  const renderPage = () => {
    if (showSetup) {
      return <Settings onComplete={handleSetupComplete} isSetup />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'diary':
        return <FoodDiary onNavigate={setCurrentPage} />;
      case 'search':
        return <FoodSearch />;
      case 'weight':
        return <WeightTracker onNavigate={setCurrentPage} />;
      case 'exercise':
        return <ExerciseLog onNavigate={setCurrentPage} />;
      case 'scanner':
        return <BarcodeScanner />;
      case 'recipes':
        return <Recipes onNavigate={setCurrentPage} />;
      case 'ai':
        return <AICoach />;
      case 'water':
        return <WaterTracker />;
      case 'body':
        return <BodyMeasurements />;
      case 'report':
        return <WeeklyReport onNavigate={setCurrentPage} />;
      case 'workout':
        return <WorkoutTrainer onNavigate={setCurrentPage} />;
      case 'voice':
        return <VoiceCloneSetup />;
      case 'settings':
        return <Settings onComplete={handleSetupComplete} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout
      currentPage={showSetup ? 'settings' : currentPage}
      onNavigate={setCurrentPage}
    >
      {renderPage()}
    </Layout>
  );
}
