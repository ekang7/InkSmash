// create a timer component that counts down from the given amount of time and displays the time remaining as a progress bar

import React, { useState, useEffect } from 'react';

interface TimerProps {
  initialTime: number; // Time in seconds
}

const Timer: React.FC<TimerProps> = ({ initialTime }) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(initialTime);

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    if (timeRemaining > 0) {
      timerId = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerId);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    // Cleanup interval on component unmount
    return () => clearInterval(timerId);
  }, [timeRemaining]);

  // Calculate progress percentage
  const progressPercentage = (timeRemaining / initialTime) * 100;

  return (
    <div style={{ width: '100%'  }}>
      <div
        style={{
          position: 'relative',
          height: '30px',
          backgroundColor: '#e0e0e0',
          borderRadius: '15px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPercentage}%`,
            backgroundColor: '#76c7c0',
            transition: 'width 1s linear',
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
          }}
        >
          {timeRemaining}s
        </div>
      </div>
    </div>
  );
};

export default Timer;
