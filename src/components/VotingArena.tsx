/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useGame } from '../store/gameStore';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, CheckCircle2 } from 'lucide-react';
import { IMAGE_MAP } from '../data/imageMap';
import { useTranslation } from '../hooks/useTranslation';

export default function VotingArena({ localPlayerId }: { localPlayerId: string }) {
  const { state, voteCard } = useGame();
  const { t, lang } = useTranslation();
  
  const hasVoted = state.votes.some(v => v.voterId === localPlayerId);
  const winner = state.roundWinnerId ? state.players.find(p => p.id === state.roundWinnerId) : null;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 pb-24 md:pb-20 ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {state.submissions.map((sub, idx) => {
        const player = state.players.find(p => p.id === sub.playerId);
        const votesForThis = state.votes.filter(v => v.targetPlayerId === sub.playerId).length;
        const isWinner = state.roundWinnerId === sub.playerId;
        const isOwn = sub.playerId === localPlayerId;

        return (
          <motion.div
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            key={sub.playerId}
            className="relative flex flex-col"
          >
            {/* Card Container */}
            <div className={`relative min-h-[140px] md:min-h-[160px] p-4 md:p-6 rounded-2xl border-2 transition-all flex flex-col gap-3 md:gap-4 bg-white shadow-lg ${
              isWinner 
                ? 'border-lime-500 ring-4 md:ring-8 ring-lime-400 rotate-1 md:rotate-2' 
                : 'border-slate-200 rotate-[-0.5deg] md:rotate-[-1deg] hover:rotate-0 hover:border-slate-400'
            }`}>
              {sub.cards.map((card, cidx) => {
                const image = IMAGE_MAP[card];
                return (
                  <div key={cidx} className="flex gap-2 md:gap-3 items-start flex-col sm:flex-row">
                    <div className="flex gap-2 items-start shrink-0">
                      {sub.cards.length > 1 && (
                        <span className="bg-slate-900 text-white w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-black shrink-0 mt-1">
                          {cidx + 1}
                        </span>
                      )}
                      <p className="text-base md:text-lg font-bold text-slate-800 leading-snug break-words max-w-[200px]">
                        {card}
                      </p>
                    </div>
                    {image && (
                      <div className="flex-1 w-full max-w-[150px] min-h-[100px] relative rounded md:rounded-lg overflow-hidden bg-slate-100 self-center">
                        <img src={image} alt="Submission image" className="absolute inset-0 w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Action/Indicator Overlay */}
              <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 md:top-4 md:right-4 rtl:md:left-4 rtl:md:right-auto">
                {state.status === 'VOTING' && !hasVoted && !isOwn && (
                  <button
                    onClick={() => voteCard(localPlayerId, sub.playerId)}
                    className="bg-blue-600 text-white text-[8px] md:text-[10px] font-black px-2 md:px-3 py-1 rounded-full uppercase tracking-widest shadow-md hover:bg-blue-700 transition-colors"
                  >
                    {t('VOTE')}
                  </button>
                )}
                {isWinner && state.status === 'RESULTS' && (
                  <div className="bg-lime-500 text-slate-900 text-[8px] md:text-[10px] font-black px-2 md:px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-sm">
                    <Trophy className="w-3 h-3" /> {t('WINNER')}
                  </div>
                )}
              </div>
            </div>

            {/* Submitter Info (Hidden until Reveal) */}
            <AnimatePresence>
              {(state.status === 'VOTING' || state.status === 'RESULTS') && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center justify-between px-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg md:text-xl">{player?.avatar}</span>
                    <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-500">{player?.name}</span>
                  </div>
                  {state.status === 'RESULTS' && (
                    <div className="flex items-center gap-1 text-lime-400 font-black">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-xs">{votesForThis}</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
