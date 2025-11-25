'use client';

import { useState, useRef, useEffect } from 'react';

interface TimePickerProps {
  value: string; // HH:mm 格式
  onChange: (value: string) => void;
  label: string;
}

export default function TimePicker({ value, onChange, label }: TimePickerProps) {
  const [hours, minutes] = value.split(':').map(Number);
  const [isOpen, setIsOpen] = useState(false);
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    if (isOpen) {
      // 滚动到当前选中的时间
      setTimeout(() => {
        const hourElement = hoursRef.current?.querySelector(`[data-hour="${hours}"]`);
        const minuteElement = minutesRef.current?.querySelector(`[data-minute="${minutes}"]`);
        hourElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        minuteElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [isOpen, hours, minutes]);

  const handleHourChange = (hour: number) => {
    const newValue = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    onChange(newValue);
  };

  const handleMinuteChange = (minute: number) => {
    const newValue = `${hours.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onChange(newValue);
  };

  const handleScroll = (type: 'hour' | 'minute') => {
    const container = type === 'hour' ? hoursRef.current : minutesRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const itemHeight = 48; // 每个选项的高度
    const selectedIndex = Math.round(scrollTop / itemHeight);
    
    if (type === 'hour') {
      const newHour = Math.max(0, Math.min(23, selectedIndex));
      if (newHour !== hours) {
        handleHourChange(newHour);
      }
    } else {
      const newMinute = Math.max(0, Math.min(59, selectedIndex));
      if (newMinute !== minutes) {
        handleMinuteChange(newMinute);
      }
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-left bg-white text-base"
      >
        {value}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl w-full max-w-xs">
            <div className="flex">
              {/* 小时选择器 */}
              <div className="flex-1 border-r border-gray-200">
                <div className="text-xs text-center py-2 text-gray-500 font-medium border-b border-gray-200">
                  小时
                </div>
                <div
                  ref={hoursRef}
                  className="h-48 overflow-y-auto scroll-smooth"
                  onScroll={() => handleScroll('hour')}
                  style={{
                    scrollSnapType: 'y mandatory',
                  }}
                >
                  {hourOptions.map((hour) => (
                    <div
                      key={hour}
                      data-hour={hour}
                      onClick={() => {
                        handleHourChange(hour);
                        setTimeout(() => {
                          const element = hoursRef.current?.querySelector(`[data-hour="${hour}"]`);
                          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 50);
                      }}
                      className={`
                        h-12 flex items-center justify-center cursor-pointer transition-colors
                        ${hours === hour
                          ? 'bg-primary-100 text-primary-700 font-semibold'
                          : 'hover:bg-gray-50'
                        }
                      `}
                      style={{ scrollSnapAlign: 'center' }}
                    >
                      {hour.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>

              {/* 分钟选择器 */}
              <div className="flex-1">
                <div className="text-xs text-center py-2 text-gray-500 font-medium border-b border-gray-200">
                  分钟
                </div>
                <div
                  ref={minutesRef}
                  className="h-48 overflow-y-auto scroll-smooth"
                  onScroll={() => handleScroll('minute')}
                  style={{
                    scrollSnapType: 'y mandatory',
                  }}
                >
                  {minuteOptions.map((minute) => (
                    <div
                      key={minute}
                      data-minute={minute}
                      onClick={() => {
                        handleMinuteChange(minute);
                        setTimeout(() => {
                          const element = minutesRef.current?.querySelector(`[data-minute="${minute}"]`);
                          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 50);
                      }}
                      className={`
                        h-12 flex items-center justify-center cursor-pointer transition-colors
                        ${minutes === minute
                          ? 'bg-primary-100 text-primary-700 font-semibold'
                          : 'hover:bg-gray-50'
                        }
                      `}
                      style={{ scrollSnapAlign: 'center' }}
                    >
                      {minute.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 p-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
              >
                确定
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

