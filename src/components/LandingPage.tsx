/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useGame } from '../store/gameStore';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, User, LogIn, Sparkles, Monitor, Tablet, Smartphone, ChevronRight } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const EMOJIS = ['🔞', '🍆', '🍑', '💊', '🍷', '🚬', '💩', '🏩', '🔥', '👅', '😈'];

export type Platform = 'desktop' | 'tablet' | 'mobile';

export default function LandingPage({ onSetLocalPlayer }: { onSetLocalPlayer: (data: { id: string; name: string; avatar: string; platform: Platform }) => void }) {
  const { joinParty, state, setLanguage } = useGame();
  const { t, lang } = useTranslation();
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [step, setStep] = useState<'platform' | 'identity'>('platform');
  const [name, setName] = useState(() => localStorage.getItem('fc_name') || '');
  const [avatar, setAvatar] = useState(() => localStorage.getItem('fc_avatar') || EMOJIS[0]);
  const [partyId, setPartyId] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const getPlayerId = () => {
    let id = sessionStorage.getItem('fc_player_id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('fc_player_id', id);
    }
    return id;
  };

  const handleHost = async () => {
    if (!name || !platform) return;
    localStorage.setItem('fc_name', name);
    localStorage.setItem('fc_avatar', avatar);
    const newPartyId = Math.floor(1000 + Math.random() * 9000).toString();
    const playerId = getPlayerId();
    const playerData = { id: playerId, name, avatar, platform };
    
    onSetLocalPlayer(playerData);
    await joinParty(newPartyId, {
      ...playerData,
      score: 0,
      isHost: true,
      hand: [],
    });
  };

  const handleJoin = async () => {
    const cleanId = partyId.trim();
    if (!name || !cleanId || !platform) return;
    localStorage.setItem('fc_name', name);
    localStorage.setItem('fc_avatar', avatar);
    const playerId = getPlayerId();
    const playerData = { id: playerId, name, avatar, platform };
    
    onSetLocalPlayer(playerData);
    await joinParty(cleanId, {
      ...playerData,
      score: 0,
      isHost: false,
      hand: [],
    });
  };

  const selectPlatform = (p: Platform) => {
    setPlatform(p);
    setStep('identity');
  };

  return (
    <div className={`min-h-screen bg-slate-950 flex flex-col items-center justify-start lg:justify-center p-6 font-sans border-[12px] border-slate-900 overflow-y-auto ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setLanguage(lang === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border-2 border-slate-800 text-white font-black text-xs uppercase tracking-widest hover:border-lime-400 transition-colors"
        >
          <Globe className="w-4 h-4 text-lime-400" />
          {lang === 'ar' ? 'English' : 'العربية'}
        </button>
      </div>
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full bg-slate-900 rounded-[2.5rem] p-6 md:p-10 shadow-2xl border-4 border-slate-800 relative"
      >
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-lime-400/10 rounded-full blur-3xl" />
        
        <div className="text-center mb-10 relative z-10">
          <h1 className="text-4xl font-black text-white mb-2 leading-none tracking-tighter uppercase italic">
            {t('CARDS_AGAINST')}<br/>{t('HUMAN_RACE')}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="inline-block bg-lime-400 text-slate-900 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] -rotate-1">
              {t('ADULTS_ONLY')}
            </div>
            <div className="bg-red-600 text-white px-2 py-1 rounded font-black text-xs">18+</div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'platform' ? (
            <motion.div
              key="platform-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6 relative z-10"
            >
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block text-center">{t('SELECT_PLATFORM')}</label>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => selectPlatform('desktop')}
                  className="group flex items-center gap-4 bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 hover:border-lime-400 hover:bg-slate-700 transition-all text-left rtl:text-right"
                >
                  <div className="bg-slate-900 p-3 rounded-xl group-hover:bg-lime-400 group-hover:text-slate-900 transition-colors">
                    <Monitor className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-xl uppercase italic">{t('DESKTOP')}</h3>
                    <p className="text-slate-500 text-xs font-bold">{t('STANDARD_WEB')}</p>
                  </div>
                  <ChevronRight className={`ml-auto rtl:mr-auto rtl:ml-0 w-6 h-6 text-slate-600 rtl:rotate-180`} />
                </button>

                <button
                  onClick={() => selectPlatform('tablet')}
                  className="group flex items-center gap-4 bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 hover:border-blue-400 hover:bg-slate-700 transition-all text-left rtl:text-right"
                >
                  <div className="bg-slate-900 p-3 rounded-xl group-hover:bg-blue-400 group-hover:text-white transition-colors">
                    <Tablet className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-xl uppercase italic">{t('TABLET')}</h3>
                    <p className="text-slate-500 text-xs font-bold">{t('TOUCH_LAYOUT')}</p>
                  </div>
                  <ChevronRight className={`ml-auto rtl:mr-auto rtl:ml-0 w-6 h-6 text-slate-600 rtl:rotate-180`} />
                </button>

                <button
                  onClick={() => selectPlatform('mobile')}
                  className="group flex items-center gap-4 bg-slate-800 p-6 rounded-2xl border-2 border-slate-700 hover:border-red-400 hover:bg-slate-700 transition-all text-left rtl:text-right"
                >
                  <div className="bg-slate-900 p-3 rounded-xl group-hover:bg-red-400 group-hover:text-white transition-colors">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-xl uppercase italic">{t('MOBILE')}</h3>
                    <p className="text-slate-500 text-xs font-bold">{t('POCKET_CHAOS')}</p>
                  </div>
                  <ChevronRight className={`ml-auto rtl:mr-auto rtl:ml-0 w-6 h-6 text-slate-600 rtl:rotate-180`} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="identity-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 relative z-10"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block">{t('GUEST_IDENTITY')}</label>
                  <button onClick={() => setStep('platform')} className="text-[8px] font-black text-lime-400 underline uppercase tracking-widest">{t('CHANGE_DEVICE')}</button>
                </div>
                <div className="relative">
                  <User className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('GUEST_PLACEHOLDER') as string}
                    className="w-full pl-12 pr-4 rtl:pl-4 rtl:pr-12 py-4 bg-slate-800 border-2 border-slate-700 rounded-2xl focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none font-bold text-white placeholder:text-slate-600 tracking-wide"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block">{t('SELECT_BIODATA')}</label>
                <div className="flex flex-wrap gap-2 justify-center bg-slate-800/50 p-4 rounded-2xl border-2 border-slate-800">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setAvatar(e)}
                      className={`text-3xl p-2 rounded-xl transition-all ${
                        avatar === e 
                          ? 'bg-lime-400 scale-110 shadow-lg border-2 border-white' 
                          : 'hover:bg-slate-700 grayscale hover:grayscale-0'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4">
                {!isJoining ? (
                  <>
                    <button
                      onClick={handleHost}
                      disabled={!name}
                      className="group relative w-full bg-lime-400 text-slate-900 font-black py-5 rounded-2xl shadow-[0_8px_0_#4d7c0f] active:shadow-none active:translate-y-2 transition-all flex items-center justify-center gap-3 text-xl disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <Sparkles className="w-6 h-6" /> {t('HOST_NEW_PARTY')}
                    </button>
                    <button
                      onClick={() => setIsJoining(true)}
                      disabled={!name}
                      className="w-full py-4 rounded-2xl font-black text-xs tracking-widest uppercase text-slate-400 border-2 border-slate-800 hover:text-white hover:border-slate-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <LogIn className="w-5 h-5" /> {t('JOIN_EXISTING')}
                    </button>
                  </>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('PARTY_CODE')}</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={partyId}
                        onChange={(e) => setPartyId(e.target.value)}
                        placeholder="0000"
                        className="w-full px-4 py-4 bg-slate-800 border-2 border-slate-700 rounded-2xl focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none font-black text-center text-3xl tracking-[0.5em] text-lime-400 placeholder:text-slate-700"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsJoining(false)}
                        className="flex-1 bg-slate-800 text-slate-400 font-black py-4 rounded-2xl border-2 border-slate-700 hover:text-white uppercase text-xs tracking-widest"
                      >
                        {t('CANCEL')}
                      </button>
                      <button
                        onClick={handleJoin}
                        disabled={partyId.length !== 4}
                        className="flex-[2] bg-lime-400 text-slate-900 font-black py-4 rounded-2xl shadow-[0_4px_0_#4d7c0f] active:shadow-none active:translate-y-1 transition-all disabled:opacity-50 uppercase text-sm tracking-widest"
                      >
                        {t('CONFIRM')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <div className="mt-8 flex flex-col items-center gap-2 opacity-30">
        <div className="text-2xl">🔞🔞🔞</div>
        <p className="text-white text-[10px] font-black uppercase tracking-[0.4em]">
          {t('DEGEN_GAMES')}
        </p>
      </div>
    </div>
  );
}
