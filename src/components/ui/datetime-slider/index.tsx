import React, { useState, useEffect } from 'react';
import './styles.css';

interface DateTimeSliderProps {
  onTimeChange: (timestamp: Date) => void;
  className?: string;
}

export const DateTimeSlider: React.FC<DateTimeSliderProps> = ({ onTimeChange, className }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  
  // Calculate 24 hours ago from current time
  const twentyFourHoursAgo = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);
  
  // Convert timestamp to slider value (0-100)
  const timeToSliderValue = (time: Date) => {
    const range = currentTime.getTime() - twentyFourHoursAgo.getTime();
    const offset = time.getTime() - twentyFourHoursAgo.getTime();
    return (offset / range) * 100;
  };
  
  // Convert slider value to timestamp
  const sliderValueToTime = (value: number) => {
    const range = currentTime.getTime() - twentyFourHoursAgo.getTime();
    const offset = (value / 100) * range;
    return new Date(twentyFourHoursAgo.getTime() + offset);
  };
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const newTime = sliderValueToTime(value);
    setSelectedTime(newTime);
    onTimeChange(newTime);
  };
  
  const formatTime = (time: Date) => {
    return time.toLocaleString('en-SG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const getRelativeTimeLabel = (time: Date) => {
    const diffInHours = (currentTime.getTime() - time.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes === 0 ? 'Now' : `${diffInMinutes}m ago`;
    } else {
      const hours = Math.floor(diffInHours);
      return `${hours}h ago`;
    }
  };
  
  // Update current time every minute to keep the slider current
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Reset to current time when component mounts
  useEffect(() => {
    onTimeChange(currentTime);
    setSelectedTime(currentTime);
  }, []);
  
  const sliderValue = timeToSliderValue(selectedTime);
  
  return (
    <div className={`datetime-slider ${className || ''}`}>
      <div className="datetime-slider-header">
        <div className="datetime-slider-title">
          Historical Data
        </div>
        <div className="datetime-slider-time">
          {formatTime(selectedTime)}
        </div>
        <div className="datetime-slider-relative">
          {getRelativeTimeLabel(selectedTime)}
        </div>
      </div>
      
      <div className="datetime-slider-container">
        <div className="datetime-slider-label">
          {formatTime(twentyFourHoursAgo)}
        </div>
        
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={sliderValue}
          onChange={handleSliderChange}
          className="datetime-slider-input"
        />
        
        <div className="datetime-slider-label">
          {formatTime(currentTime)}
        </div>
      </div>
      
      <div className="datetime-slider-marks">
        {[0, 6, 12, 18, 24].map(hours => {
          const markTime = new Date(currentTime.getTime() - hours * 60 * 60 * 1000);
          const markValue = timeToSliderValue(markTime);
          
          return (
            <div
              key={hours}
              className="datetime-slider-mark"
              style={{ left: `${markValue}%` }}
            >
              <div className="datetime-slider-mark-line"></div>
              <div className="datetime-slider-mark-label">
                {hours === 0 ? 'Now' : `${hours}h`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};