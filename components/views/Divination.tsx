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
    <div className="h-full bg-[#f9f6f7] flex flex-col items-center p-6 overflow-y-auto">
      <h2 className="font-hand text-3xl text-[#d58f99] mb-2">Madame Wade's Tent</h2>
      <p className="text-[#917c71] mb-8 text-center max-w-md">Ask the cards, babe. They never lie. Unless I shuffled them.</p>

      <div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-lg border-2 border-[#d58f99] mb-8">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full border-b-2 border-[#eae2e8] py-2 mb-6 focus:outline-none focus:border-[#d58f99] text-center text-lg"
        />
        <div className="flex justify-center">
          <Button onClick={drawCard} disabled={loading || !question} size="lg">
            {loading ? "Shuffling..." : "🔮 Draw Card"}
          </Button>
        </div>
      </div>

      {result && (
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="bg-[#917c71] text-white p-1 rounded-t-xl text-center text-xs tracking-widest uppercase">
            The Fate
          </div>
          <div className="bg-white p-6 rounded-b-xl shadow-md text-center border border-[#917c71]">
            <h3 className="text-2xl font-bold text-[#d58f99] mb-4 font-serif">{result.card}</h3>
            <div className="w-32 h-48 bg-[#eae2e8] mx-auto mb-4 rounded-lg flex items-center justify-center border-2 border-dashed border-[#d58f99]">
               <span className="text-4xl">🃏</span>
            </div>
            <p className="italic text-[#5a4a42] leading-relaxed">"{result.reading}"</p>
          </div>
        </div>
      )}
    </div>
  );
};