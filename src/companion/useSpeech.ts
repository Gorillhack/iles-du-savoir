import { useCallback, useEffect, useState } from 'react';

/**
 * Voix du compagnon : synthèse vocale du navigateur, sans service externe.
 * Lecture uniquement sur action explicite ; aucune donnée transmise.
 */
export function useSpeech() {
  const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!synth) return;
    const pickVoice = () => {
      const all = synth.getVoices();
      // Voix locales en priorité : elles n'envoient rien à un serveur.
      const fr = all.filter((v) => v.lang?.toLowerCase().startsWith('fr'));
      setVoice(fr.find((v) => v.localService) ?? fr[0] ?? null);
    };
    pickVoice();
    synth.addEventListener?.('voiceschanged', pickVoice);
    return () => { synth.removeEventListener?.('voiceschanged', pickVoice); synth.cancel(); };
  }, [synth]);

  const stop = useCallback(() => { synth?.cancel(); setSpeaking(false); }, [synth]);

  const speak = useCallback((text: string) => {
    if (!synth || !voice) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(u);
  }, [synth, voice]);

  return { available: !!synth && !!voice, speaking, speak, stop };
}
