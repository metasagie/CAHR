/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../store/gameStore';
import { motion } from 'motion/react';
import { Hand, Send } from 'lucide-react';
import { IMAGE_MAP } from '../data/imageMap';
import { useTranslation } from '../hooks/useTranslation';

export default function PlayerHand({ localPlayerId }: { localPlayerId: string }) {
  const { state, deployCard } = useGame();
  const { t, lang } = useTranslation();
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const player = state.players.find(p => p.id === localPlayerId);

  if (!player || !state.blackCard) return null;

  const pickRequirement = state.blackCard.pick;

  const toggleCard = (card: string) => {
    if (selectedCards.includes(card)) {
      setSelectedCards(prev => prev.filter(c => c !== card));
    } else {
      if (selectedCards.length < pickRequirement) {
        setSelectedCards(prev => [...prev, card]);
      }
    }
  };

  const handleDeploy = () => {
    if (selectedCards.length === pickRequirement) {
      deployCard(localPlayerId, selectedCards);
    }
  };

  return (
    <footer className={`h-40 md:h-56 bg-slate-900 border-t-4 md:border-t-8 border-slate-900 px-4 md:px-8 flex items-end justify-center relative shrink-0 ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-lime-400 px-4 md:px-6 py-1 md:py-1.5 rounded-full font-black text-[10px] md:text-xs tracking-[0.2em] uppercase shadow-lg border-2 border-lime-500/20 flex gap-2 md:gap-4 whitespace-nowrap z-30">
        <span className="hidden xs:inline">{t('ARSENAL')}</span>
        {pickRequirement > 1 && (
          <span className="text-white">{t('PICK')} {selectedCards.length} / {pickRequirement}</span>
        )}
      </div>

      {selectedCards.length === pickRequirement && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={handleDeploy}
          className="absolute -top-12 md:-top-16 left-1/2 -translate-x-1/2 bg-lime-400 text-slate-900 px-6 py-2 md:px-8 md:py-3 rounded-full font-black uppercase shadow-2xl flex items-center gap-2 hover:scale-110 active:scale-95 transition-transform z-40 text-sm md:text-base border-2 border-white/20"
        >
          {t('CONFIRM_DEPLOYMENT')} <Send className={`w-3 h-3 md:w-4 md:h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
        </motion.button>
      )}
      
      <div className="flex gap-0.5 md:gap-1 max-w-full overflow-x-auto items-end pb-4 md:pb-8 translate-y-4 md:translate-y-8 px-2">
        {player.hand.map((card, idx) => {
          const selectionIndex = selectedCards.indexOf(card);
          const isSelected = selectionIndex !== -1;
          const image = IMAGE_MAP[card];
          
          return (
            <motion.button
              key={card}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: isSelected ? -20 : 0, opacity: 1 }}
              transition={{ delay: idx * 0.03, type: 'spring', damping: 15 }}
              whileHover={{ y: isSelected ? -30 : -20, zIndex: 10 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => pickRequirement === 1 ? deployCard(localPlayerId, [card]) : toggleCard(card)}
              className={`flex-shrink-0 w-24 md:w-36 h-32 md:h-48 rounded-lg md:rounded-xl p-2 md:p-4 shadow-xl flex flex-col justify-between text-left group transition-all border-2 md:border-4 overflow-hidden relative ${
                isSelected 
                  ? 'bg-lime-100 border-lime-500 ring-2 md:ring-4 ring-lime-400/50' 
                  : 'bg-white border-slate-300 hover:border-lime-400'
              }`}
            >
              <div className="flex flex-col h-full overflow-hidden w-full">
                <div className="flex justify-between items-start gap-1 flex-shrink-0">
                  <p className="text-slate-800 font-bold text-[9px] md:text-xs leading-tight line-clamp-2 md:line-clamp-4">
                    {card}
                  </p>
                  {isSelected && pickRequirement > 1 && (
                    <span className="bg-lime-500 text-slate-900 w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-black shrink-0">
                      {selectionIndex + 1}
                    </span>
                  )}
                </div>
                {image && (
                  <div className="flex-1 w-full min-h-0 relative mt-1 bg-slate-100 rounded overflow-hidden">
                    <img src={image} className="absolute inset-0 w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center opacity-10 flex-shrink-0 mt-1">
                <span className="text-[6px] md:text-[8px] font-black uppercase tracking-widest text-slate-900">18+</span>
                <span className="text-sm md:text-lg">🔞</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </footer>
  );
}
