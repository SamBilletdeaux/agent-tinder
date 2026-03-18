import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { UserProfile } from './engine/types';
import type { MatchResult } from './engine/matching';
import PersonaSelect from './components/PersonaSelect';
import SwipeDeck from './components/SwipeDeck';
import MyToolkit from './components/MyToolkit';

type Screen = 'select' | 'deck' | 'toolkit';

export default function App() {
  const [screen, setScreen] = useState<Screen>('select');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [toolkit, setToolkit] = useState<MatchResult[]>([]);

  const handleSelectPersona = useCallback((p: UserProfile) => {
    setProfile(p);
    setToolkit([]);
    setScreen('deck');
  }, []);

  const handleFinish = useCallback((t: MatchResult[]) => {
    setToolkit(t);
    setScreen('toolkit');
  }, []);

  const handleSwitchPersona = useCallback(() => {
    setScreen('select');
    setProfile(null);
    setToolkit([]);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {screen === 'select' && (
        <motion.div
          key="select"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PersonaSelect onSelect={handleSelectPersona} />
        </motion.div>
      )}
      {screen === 'deck' && profile && (
        <motion.div
          key={`deck-${profile.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SwipeDeck
            profile={profile}
            onFinish={handleFinish}
            onSwitchPersona={handleSwitchPersona}
          />
        </motion.div>
      )}
      {screen === 'toolkit' && profile && (
        <motion.div
          key="toolkit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MyToolkit
            profile={profile}
            toolkit={toolkit}
            onSwitchPersona={handleSwitchPersona}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
