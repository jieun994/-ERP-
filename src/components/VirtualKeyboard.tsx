import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Delete, X, ShieldCheck } from 'lucide-react';
import { Button } from './ui';

interface VirtualKeyboardProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title?: string;
  length?: number;
  type?: 'number' | 'text'; // Start with numeric as requested by image
}

export default function VirtualKeyboard({
  isOpen,
  onClose,
  onConfirm,
  title = '보안 키패드 입력',
  length = 6
}: VirtualKeyboardProps) {
  const [input, setInput] = useState<string>('');
  const [keys, setKeys] = useState<number[]>([]);

  const shuffleKeys = useCallback(() => {
    const nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    setKeys(nums);
  }, []);

  useEffect(() => {
    if (isOpen) {
      shuffleKeys();
      setInput('');
    }
  }, [isOpen, shuffleKeys]);

  const handleKeyPress = (num: number) => {
    if (input.length < length) {
      setInput(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setInput(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setInput('');
  };

  const handleSubmit = () => {
    if (input.length === length) {
      onConfirm(input);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-[400px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-6 flex items-center justify-between bg-white relative">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#008d7510] rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#008d75]" />
                </div>
                <h3 className="text-[18px] font-bold text-[#191F28]">{title}</h3>
              </div>
              <button
                onClick={onClose}
                id="vk-close-btn"
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="px-8 pb-10 flex-1 flex flex-col items-center">
              {/* Input Display Area */}
              <div className="flex gap-3 mb-12">
                {Array.from({ length }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-10 h-14 border-b-4 flex items-center justify-center transition-all duration-200 ${
                      input.length > i 
                        ? 'border-[#008d75] text-[#008d75]' 
                        : 'border-gray-200 text-gray-300'
                    }`}
                  >
                    {input.length > i ? (
                      <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-[24px] font-bold"
                      >
                        ●
                      </motion.div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-200" />
                    )}
                  </div>
                ))}
              </div>

              {/* Keypad Grid */}
              <div className="grid grid-cols-3 gap-4 w-full">
                {keys.slice(0, 9).map((num) => (
                  <motion.button
                    key={num}
                    whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleKeyPress(num)}
                    className="h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-[24px] font-bold text-[#191F28] shadow-sm active:bg-gray-100"
                  >
                    {num}
                  </motion.button>
                ))}
                
                <button
                  onClick={handleClear}
                  className="h-16 flex items-center justify-center text-[15px] font-bold text-[#8B95A1] hover:text-[#191F28] transition-colors"
                >
                  전체삭제
                </button>

                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleKeyPress(keys[9])}
                  className="h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-[24px] font-bold text-[#191F28] shadow-sm active:bg-gray-100"
                >
                  {keys[9]}
                </motion.button>

                <button
                  onClick={handleDelete}
                  className="h-16 flex items-center justify-center text-gray-400 hover:text-[#191F28] transition-colors"
                >
                  <Delete className="w-7 h-7" />
                </button>
              </div>

              {/* Confirm Button */}
              <Button
                variant={input.length === length ? 'primary' : 'ghost'}
                disabled={input.length < length}
                onClick={handleSubmit}
                fullWidth
                className="mt-10 h-16 rounded-2xl text-[18px] font-bold shadow-md active:scale-[0.98]"
              >
                확인
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
