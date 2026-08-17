/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useGame } from '../store/gameStore';
import { motion } from 'motion/react';
import { Users, Crown, Play, Image as ImageIcon, Type } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function Lobby({ localPlayerId }: { localPlayerId: string }) {
  const { state, startGame, setDeck } = useGame();
  const { t, lang } = useTranslation();
  
  const isHost = state.hostId === localPlayerId;
  const canStart = state.players.length >= 2;

  return (
    <div className={`min-h-screen bg-slate-950 flex flex-col items-center p-4 md:p-16 font-sans border-[8px] md:border-[12px] border-slate-900 overflow-y-auto ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl w-full">
        <header className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-8 md:mb-12 border-b-2 md:border-b-4 border-slate-800 pb-6 gap-4">
          <div className="text-center sm:text-left rtl:sm:text-right">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none uppercase italic">{t('WAR_ROOM')}</h2>
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
              <span className="text-slate-500 font-black uppercase text-[8px] md:text-[10px] tracking-widest leading-none">{t('ACCESS_PROTOCOL')}</span>
              <span className="bg-slate-800 text-lime-400 px-3 md:px-4 py-1 rounded-full font-black text-lg md:text-xl tracking-[0.3em] shadow-lg border border-slate-700">{state.partyId}</span>
            </div>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end rtl:sm:items-start gap-2 sm:gap-1">
             <div className="flex items-center gap-2 text-white bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
               <Users className="w-4 h-4 md:w-5 md:h-5 text-lime-400" />
               <span className="font-black text-xl md:text-2xl">{state.players.length}</span>
             </div>
             <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-500">{t('UNITS_READY')}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-12 md:mb-16">
          {state.players.map((p, idx) => (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              key={p.id}
              className={`bg-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-6 flex items-center gap-4 md:gap-5 border-2 md:border-4 transition-all ${
                p.id === localPlayerId ? 'border-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.1)] bg-slate-800/50' : 'border-slate-800'
              }`}
            >
              <div className="text-3xl md:text-5xl bg-slate-800 w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center border-2 border-slate-700 shadow-inner shrink-0 relative">
                {p.avatar}
                {p.isHost && <Crown className={`absolute -top-2 ${lang === 'ar' ? '-left-2' : '-right-2'} w-5 h-5 md:w-6 md:h-6 text-lime-400 fill-lime-400 drop-shadow-lg`} />}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <p className="font-black text-white text-base md:text-lg uppercase truncate italic">{p.name}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="bg-slate-800 h-1 md:h-1.5 flex-1 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      className="h-full bg-lime-400"
                    />
                  </div>
                  <span className="text-[6px] md:text-[8px] font-black text-lime-400 uppercase tracking-widest">{t('LINKED')}</span>
                </div>
              </div>
            </motion.div>
          ))}
          
          {state.players.length < 8 && (
            <div className="rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col items-center justify-center gap-2 bg-slate-900/40 border-2 md:border-4 border-dashed border-slate-800">
              <span className="text-xl md:text-2xl opacity-20">🔞</span>
              <p className="text-slate-700 font-black uppercase tracking-widest text-[8px] md:text-[10px]">{t('AWAITING_DEGENERATES')}</p>
            </div>
          )}
        </div>

        {isHost ? (
          <div className="flex flex-col items-center gap-6">
            <div className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-white font-black uppercase italic tracking-widest">{t('SELECT_DECK')}</h3>
                <p className="text-slate-500 text-[10px] uppercase font-bold">{t('CHOOSE_POISON')}</p>
              </div>
              <div className="flex bg-slate-950 p-1 rounded-full w-full sm:w-auto">
                <button
                  onClick={() => setDeck('original')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-full font-black uppercase text-xs transition-all ${
                    state.deck === 'original' ? 'bg-lime-400 text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  <Type className="w-4 h-4" /> {t('ORIGINAL')}
                </button>
                <button
                  onClick={() => setDeck('images')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-full font-black uppercase text-xs transition-all ${
                    state.deck === 'images' ? 'bg-lime-400 text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" /> {t('IMAGES')}
                </button>
              </div>
            </div>

            <button
              onClick={startGame}
              disabled={!canStart}
              className="group relative w-full bg-lime-400 text-slate-900 font-black py-5 md:py-6 rounded-2xl md:rounded-3xl shadow-[0_8px_0_#4d7c0f] hover:scale-[1.02] active:scale-[0.98] active:shadow-none active:translate-y-2 transition-all flex items-center justify-center gap-4 text-2xl md:text-3xl disabled:opacity-50 disabled:grayscale"
            >
              <Play className="w-8 h-8 md:w-10 md:h-10 fill-slate-900" /> {t('START_CHAOS')}
            </button>
            {!canStart && (
              <div className="bg-slate-900/50 px-6 py-2 rounded-full border border-dashed border-slate-700">
                <p className="text-slate-500 font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em]">{t('REQUIRED_UNITS')}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 border-2 md:border-4 border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-lime-400 animate-[shimmer_2s_infinite]" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="text-4xl md:text-5xl mb-4 md:mb-6 inline-block"
            >
              💊
            </motion.div>
            <h3 className="text-white font-black text-xl md:text-2xl uppercase tracking-tighter mb-2">{t('SYNCING_DATA')}</h3>
            <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">{t('AWAITING_HOST')}</p>
            <div className="mt-4 inline-block bg-slate-950 px-4 py-2 rounded-full border border-slate-800">
               <p className="text-lime-400 font-black uppercase text-[10px] tracking-[0.2em]">{t('DECK_SELECTED')}: {state.deck === 'images' ? t('IMAGES') : t('ORIGINAL')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
