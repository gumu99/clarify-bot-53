import React, { useMemo } from 'react';

const studyEmojis = ['📚', '✏️', '📖', '🎓', '💡', '📝', '🔬', '📐', '🧠', '⭐', '✨', '📓', '🎯', '💻', '🔖'];

const BackgroundEffects: React.FC = () => {
  const floatingEmojis = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      emoji: studyEmojis[Math.floor(Math.random() * studyEmojis.length)],
      left: Math.random() * 100,
      delay: Math.random() * 25,
      duration: 20 + Math.random() * 25,
      size: 14 + Math.random() * 14,
    }));
  }, []);

  return (
    <>
      {/* Noise Overlay */}
      <div className="noise-overlay" />
      
      {/* Floating Study Emojis */}
      {floatingEmojis.map((item) => (
        <div
          key={item.id}
          className="fixed pointer-events-none animate-emoji-float"
          style={{
            left: `${item.left}%`,
            fontSize: `${item.size}px`,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
            opacity: 0.15,
            filter: 'grayscale(0%)',
          }}
        >
          {item.emoji}
        </div>
      ))}
    </>
  );
};

export default BackgroundEffects;
