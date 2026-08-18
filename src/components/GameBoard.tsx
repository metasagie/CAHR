/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useGame } from '../store/gameStore';
import { motion, AnimatePresence } from 'motion/react';
import PlayerHand from './PlayerHand';
import VotingArena from './VotingArena';
import { useBots } from '../hooks/useBots';
import { Trophy, Users, ChevronRight } from 'lucide-react';
import { IMAGE_MAP } from '../data/imageMap';
import { useTranslation } from '../hooks/useTranslation';

export default function GameBoard({ localPlayerId }: { localPlayerId: string }) {
  const { state, nextRound } = useGame();
  const { t, lang } = useTranslation();
  const localPlayer = state.players.find(p => p.id === localPlayerId);
  const isHost = state.hostId === localPlayerId;
  const platform = (localPlayer as any)?.platform || 'desktop';

  useBots(localPlayerId); 

  const hasSubmitted = state.submissions.some(s => s.playerId === localPlayerId);
  const submissionsCount = state.submissions.length;
  const totalPlayers = state.players.length;
  
  const blackCardImage = state.blackCard ? IMAGE_MAP[state.blackCard.text] : null;

  return (
    <div className={`min-h-[100dvh] lg:h-[100dvh] bg-slate-950 font-sans flex flex-col overflow-y-auto lg:overflow-hidden text-slate-100 border-[8px] md:border-[12px] border-slate-900 relative ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header / Scoreboard */}
      <header className="h-16 md:h-20 bg-slate-900 flex items-center justify-between px-4 md:px-8 shadow-xl shrink-0 z-50">
        <div className="flex items-center gap-2 md:gap-4">
          <h1 className="text-white font-black text-sm md:text-2xl tracking-tighter leading-none uppercase italic">
            {t('CARDS_AGAINST')}<br />
            <span className="text-lime-400 text-[8px] md:text-sm tracking-widest uppercase">{t('HUMAN_RACE')}</span>
          </h1>
          <div className="bg-red-500 text-white text-[6px] md:text-[8px] font-black px-1.5 py-0.5 rounded uppercase rotate-[-5deg] hidden sm:block">{t('ADULTS_ONLY')}</div>
        </div>
        
        {/* Scores - Desktop/Tablet Scroll */}
        <div className="flex gap-2 md:gap-3 overflow-x-auto max-w-[40%] md:max-w-xl">
          {state.players.sort((a,b) => b.score - a.score).map((p) => (
            <div key={p.id} className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full border-2 flex items-center gap-1 md:gap-2 shrink-0 ${
              p.id === localPlayerId 
                ? 'bg-slate-700 border-lime-400 text-lime-400' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              <span className="text-sm md:text-xl">{p.avatar}</span>
              <span className="font-bold text-[10px] md:text-sm truncate max-w-[50px] md:max-w-[100px]">{p.score}</span>
            </div>
          ))}
        </div>

        <div className="bg-lime-400 text-slate-900 px-2 md:px-4 py-1 md:py-2 rounded font-black uppercase text-[10px] md:text-sm tracking-widest shadow-[2px_2px_0px_#4d7c0f] md:shadow-[4px_4px_0px_#4d7c0f] flex items-center gap-2 md:gap-4">
          <span className="hidden sm:inline">Room: {state.partyId}</span>
          <span className="bg-slate-900 text-lime-400 px-2 py-0.5 rounded text-[8px] md:text-[10px]">R{state.round}/8</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-4 md:p-8 gap-4 md:gap-8 items-stretch lg:overflow-hidden relative">
        <AnimatePresence mode="wait">
          {state.round >= 8 && state.status === 'RESULTS' ? (
            <motion.div
              key="game-over"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 text-center text-white overflow-y-auto"
            >
              <Trophy className="w-16 h-16 md:w-24 md:h-24 text-lime-400 mb-4 md:mb-8" />
              <h2 className="text-3xl md:text-5xl font-black mb-1 md:mb-2 italic uppercase">Game Over!</h2>
              <p className="text-lime-400 text-xs md:text-sm font-bold uppercase tracking-widest mb-6 md:mb-12">The Degenerate Champion is...</p>
              
              <div className="flex flex-col gap-4 md:gap-6 w-full max-w-md">
                {[...state.players].sort((a,b) => b.score - a.score).map((p, i) => (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                    key={p.id}
                    className={`flex items-center justify-between p-4 md:p-6 rounded-2xl border-2 md:border-4 ${
                      i === 0 ? 'bg-lime-400 text-slate-900 border-white' : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <span className="text-2xl md:text-4xl">{p.avatar}</span>
                      <div className="text-left rtl:text-right">
                        <span className="font-black text-sm md:text-xl truncate max-w-[120px]">{p.name}</span>
                      </div>
                    </div>
                    <div className="text-xl md:text-3xl font-black">{p.score}</div>
                  </motion.div>
                ))}
              </div>

              {isHost && (
                <button
                  onClick={() => window.location.reload()}
                  className="mt-8 md:mt-12 bg-white text-slate-900 px-6 py-3 md:px-8 md:py-4 rounded-full font-black uppercase text-lg md:text-xl hover:scale-105 transition-transform"
                >
                  {t('START_CHAOS')}
                </button>
              )}
            </motion.div>
          ) : (
              <motion.div
                key="active-game"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-8 items-stretch lg:overflow-hidden"
              >
              {(state.status === 'SUBMISSION' || state.status === 'VOTING' || state.status === 'RESULTS') && (
                <section className="w-full lg:w-1/3 flex flex-col gap-2 md:gap-4 shrink-0">
                  <span className="text-lime-400/60 font-black uppercase text-[10px] md:text-xs tracking-widest">{t('JUDGEMENT_PROTOCOL')}</span>
                  
                  <div className="relative flex-1 min-h-[140px] md:min-h-[220px] lg:max-h-[500px]">
                    <div className="absolute top-1 left-1 w-full h-full bg-slate-900/10 rounded-2xl md:rounded-3xl -rotate-1" />
                    
                    <motion.div
                      key={state.blackCard?.text}
                      initial={{ scale: 0.9, opacity: 0, rotateY: 90 }}
                      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                      className="relative h-full w-full bg-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl border-2 md:border-4 border-slate-800 flex flex-col justify-between overflow-y-auto no-scrollbar"
                    >
                      <div className="flex flex-col gap-3 md:gap-4 overflow-hidden h-full">
                        <p className="text-white text-base md:text-xl lg:text-2xl xl:text-3xl font-bold leading-relaxed flex-shrink-0 text-left rtl:text-right break-words whitespace-normal">
                          {state.blackCard?.text.split('______').map((part, i, arr) => (
                            <span key={i}>
                              {part}
                              {i < arr.length - 1 && (
                                <span className="inline-block border-b-2 md:border-b-4 border-lime-400 px-4 md:px-8 mx-1 mb-1" />
                              )}
                            </span>
                          ))}
                        </p>
                        {blackCardImage && (
                          <div className="flex-1 w-full min-h-[100px] md:min-h-[140px] flex items-center justify-center relative rounded-lg md:rounded-xl overflow-hidden mt-2 bg-slate-950">
                             <img src={blackCardImage} alt="Prompt card image" className="absolute inset-0 w-full h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-end mt-2 md:mt-4 shrink-0">
                        <div className="text-[8px] md:text-[10px] text-lime-400/50 font-bold uppercase tracking-[0.2em] flex flex-col gap-0.5 md:gap-1">
                          {state.blackCard?.pick && state.blackCard.pick > 1 && (
                            <span className="text-lime-400">{t('PICK')} {state.blackCard.pick}</span>
                          )}
                          <span>{t('CARDS_AGAINST')} {t('HUMAN_RACE')}</span>
                        </div>
                        <div className="text-white/10 text-xl md:text-4xl">🔞</div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="mt-1 md:mt-4 bg-slate-900 text-lime-400 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl shadow-lg flex items-center gap-2 md:gap-3">
                    <div className="bg-lime-400 w-2 h-2 md:w-3 md:h-3 rounded-full animate-pulse" />
                    <span className="font-black uppercase text-[10px] md:text-xs tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">
                      {state.status === 'SUBMISSION' ? `WAITING (${submissionsCount}/${totalPlayers})` : 
                       state.status === 'VOTING' ? 'CAST VOTES!' : t('WINNER')}
                    </span>
                  </div>
                </section>
              )}

              <section className="flex-1 min-h-0 flex flex-col gap-4 lg:overflow-y-auto">
                <AnimatePresence mode="wait">
                  {state.status === 'SUBMISSION' && (
                    <motion.div 
                      key="submission"
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -50, opacity: 0 }}
                      className="flex-1 flex flex-col"
                    >
                      {!hasSubmitted ? (
                        <div className="flex-1 flex items-center justify-center p-6 md:p-12 text-center border-2 md:border-4 border-dashed border-slate-800 rounded-3xl bg-slate-900/40">
                          <div className="space-y-4">
                            <div className="text-4xl md:text-6xl">👇</div>
                            <h3 className="text-lg md:text-2xl font-black text-white uppercase italic">{t('CARD_TO_DEPLOY')}</h3>
                            <p className="text-slate-500 font-bold uppercase text-[8px] md:text-xs">{t('SELECT')} {state.blackCard?.pick} {t('CARDS')}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center border-2 md:border-slate-800 bg-slate-900/60 rounded-3xl">
                          <motion.div
                            animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-4xl md:text-6xl mb-4 md:mb-6"
                          >
                            🍑
                          </motion.div>
                          <h3 className="text-lg md:text-2xl font-black text-lime-400 uppercase italic">Payload Sent!</h3>
                          <p className="text-slate-500 font-bold uppercase text-[8px] md:text-xs mt-2">{t('WAITING_FOR_UNITS')}</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {(state.status === 'VOTING' || state.status === 'RESULTS') && (
                    <motion.div
                      key="arena"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-2 md:mb-4">
                        <span className="text-slate-500 font-black uppercase text-[10px] md:text-xs tracking-widest italic">
                          {state.status === 'RESULTS' ? t('RESULTS') : t('VOTE_FOR_FAVORITE')}
                        </span>
                      </div>
                      <VotingArena localPlayerId={localPlayerId} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {state.status === 'RESULTS' && isHost && state.round < 8 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="fixed lg:absolute bottom-6 md:bottom-8 right-6 md:right-8 z-[60]"
                >
                  <button
                    onClick={nextRound}
                    className="bg-lime-400 text-slate-900 font-black px-6 md:px-8 py-3 md:py-4 rounded-full shadow-2xl flex items-center gap-2 text-base md:text-xl hover:scale-105 transition-transform"
                  >
                    {t('NEXT_ROUND')} <ChevronRight className="w-5 h-5 md:w-6 md:h-6 shrink-0 rtl:rotate-180" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Area for Hand */}
      {state.status === 'SUBMISSION' && !hasSubmitted && (
        <PlayerHand localPlayerId={localPlayerId} />
      )}
    </div>
  );
}
