import React, { useState } from 'react';
import { useStore } from '../../store';
import { interpretTarot } from '../../services/geminiService';
import { Button } from '../ui/Button';

const TAROT_CARDS = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor", 
  "The Lovers", "The Chariot", "Strength", "The Hermit", "Wheel of Fortune", 
  "Justice", "The Hanged Man", "Death", "Temperance", "The Devil", "The Tower", 
  "The Star", "The Moon", "The Sun", "Judgement", "The World"
];

export const Divination: React.FC = () => {
  const { settings } = useStore();
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<{ card: string, reading: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const drawCard = async () => {
    if (!question) return;
    setLoading(true);
    const randomCard = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
    
    try {
      const reading = await interpretTarot(randomCard, question);
      setResult({ card: randomCard, reading });
    } catch (e) {
      setResult({ card: randomCard, reading: "Psychic interference. Try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-wade-bg-app flex flex-col items-center p-6 overflow-y-auto">
      <h2 className="font-hand text-3xl text-wade-accent mb-2">Madame Wade's Tent</h2>
      <p className="text-wade-text-muted mb-8 text-center max-w-md">Ask the cards, babe. They never lie. Unless I shuffled them.</p>

      <div className="w-full max-w-md bg-wade-bg-card p-6 rounded-3xl shadow-lg border-2 border-wade-accent mb-8">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full border-b-2 border-wade-border py-2 mb-6 focus:outline-none focus:border-wade-accent text-center text-lg"
        />
        <div className="flex justify-center">
          <Button onClick={drawCard} disabled={loading || !question} size="lg">
            {loading ? "Shuffling..." : "🔮 Draw Card"}
          </Button>
        </div>
      </div>

      {result && (
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="bg-wade-text-muted text-white p-1 rounded-t-xl text-center text-xs tracking-widest uppercase">
            The Fate
          </div>
          <div className="bg-wade-bg-card p-6 rounded-b-xl shadow-md text-center border border-wade-text-muted">
            <h3 className="text-2xl font-bold text-wade-accent mb-4 font-serif">{result.card}</h3>
            <div className="w-32 h-48 bg-wade-border mx-auto mb-4 rounded-lg flex items-center justify-center border-2 border-dashed border-wade-accent">
               <span className="text-4xl">🃏</span>
            </div>
            <p className="italic text-wade-text-main leading-relaxed">"{result.reading}"</p>
          </div>
        </div>
      )}
    </div>
  );
};