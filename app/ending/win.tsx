import { useState, useEffect } from 'react';
import { useAnimation } from '@/hooks/useAnimation';
import { Confetti } from '@/components/ui/confetti';
import { Podium } from '@/components/ui/podium';

export default function Win() {
  const { animate, stop } = useAnimation();
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    animate('.win-podium', {
      opacity: [0, 1],
      transform: ['translateY(100px)', 'translateY(0)'],
      duration: 1,
      easing: 'easeInOut',
    });
    setTimeout(() => setConfetti(true), 1000);
    return () => stop('.win-podium');
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="win-podium">
        <Podium />
      </div>
      {confetti && <Confetti />}
    </div>
  );
}
