import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Send, Bot, Sparkles, User, RefreshCw, Volume2 } from 'lucide-react';
import { askGeminiAssistant } from '../services/geminiService';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  contextSummary: string;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  contextSummary
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Xin chào Ban Giám đốc và Phòng HCNS! Tôi là Trợ lý AI Quản trị Nhân sự & Tiền lương của Công ty A. Tôi có thể hỗ trợ đối soát dữ liệu, phân tích biến động quỹ lương, cảnh báo rủi ro hợp đồng, giải đáp chính sách BHXH hoặc soạn thảo tờ trình. Hãy hỏi tôi bất cứ điều gì!',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Init Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'vi-VN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => (prev ? prev + ' ' : '') + transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  if (!isOpen) return null;

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói trực tiếp. Bạn có thể gõ câu hỏi vào ô chat!');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const answer = await askGeminiAssistant(apiKey, query, contextSummary);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: answer,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `Đã xảy ra lỗi khi trao đổi với AI: ${err?.message || 'Vui lòng kiểm tra API Key.'}`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    'Phân tích biến động quỹ lương Quý 3/2026?',
    'Nhân sự nào có giờ làm thêm OT cao nhất tháng 9?',
    'Có bao nhiêu nhân sự sắp hết hạn HĐ và thử việc?',
    'Tổng trích nộp BHXH 10.5% tháng vừa rồi là bao nhiêu?'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl h-[650px] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-forest-800 to-gold-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white">Trợ lý AI Nhân sự & Tiền lương</h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20">
                  Gemini 3 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tham mưu điều hành & Phân tích số liệu tự động</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick questions carousel */}
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px] font-medium">Gợi ý:</span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-gold-500 text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors hover:text-gold-600 dark:hover:text-gold-400 text-[11px]"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat message list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-forest-800 text-gold-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-forest-800 to-forest-700 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 rounded-tl-none whitespace-pre-line'
                }`}
              >
                <div>{m.text}</div>
                <div
                  className={`text-[10px] mt-2 font-mono ${
                    m.role === 'user' ? 'text-white/60 text-right' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-gold-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-slate-500 dark:text-slate-400 text-xs py-2">
              <div className="w-8 h-8 rounded-lg bg-forest-800 text-gold-400 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <span className="italic">AI đang phân tích đối soát số liệu...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Recording pulse banner */}
        {isRecording && (
          <div className="px-6 py-2 bg-rose-500/10 border-t border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-between text-xs animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
              <span className="font-semibold">Đang lắng nghe giọng nói của bạn... Hãy nói câu hỏi</span>
            </div>
            <button
              onClick={toggleRecording}
              className="text-[11px] underline font-bold"
            >
              Dừng lại
            </button>
          </div>
        )}

        {/* Input box */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleRecording}
              title="Nhập bằng giọng nói (Voice Input)"
              className={`p-2.5 rounded-xl transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white animate-bounce'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-gold-600 hover:bg-gold-50 dark:hover:bg-slate-700'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập câu hỏi hoặc yêu cầu phân tích nhân sự / tiền lương..."
              className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            />

            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-forest-900/20"
            >
              <Send className="w-4 h-4" />
              <span>Gửi</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
