
import { useEffect, useState } from 'react';
import '../styles/Countdown.css';

const EVENT_DATE = new Date('2026-12-23T09:00:00+05:30');

const getTimeLeft = () => {
  const difference = Math.max(0, EVENT_DATE.getTime() - Date.now());

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60)
  };
};

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const units = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HOURS', value: timeLeft.hours },
    { label: 'MINUTES', value: timeLeft.minutes },
    { label: 'SECONDS', value: timeLeft.seconds }
  ];

  return (
    <div className="countdown-panel">
      <div className="countdown-grid" />

      <div className="countdown-content">

        <div className="countdown-top">
          <span className="countdown-indicator" />
          THE COUNTDOWN IS ON
          <span className="countdown-24">24H</span>
        </div>

        <h2>
          Time to <span>innovate.</span>
        </h2>

        <p className="countdown-subtitle">
          The clock is ticking. Are you ready for the challenge?
        </p>

        {timeLeft.days === 0 &&
         timeLeft.hours === 0 &&
         timeLeft.minutes === 0 &&
         timeLeft.seconds === 0 ? (
          <div className="event-live">
            <span className="live-pulse" />
            EVENT STARTED
          </div>
        ) : (
          <div className="countdown-timer">
            {units.map(({ label, value }) => (
              <div className="countdown-unit" key={label}>
                <div className="countdown-number">
                  {String(value).padStart(2, '0')}
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}


      </div>
    </div>
  );
}
