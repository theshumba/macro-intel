import { useState, useEffect, useCallback } from 'react';

let showToastFn = null;

export function toast(message, duration = 2000) {
  if (showToastFn) showToastFn(message, duration);
}

function Toast() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  const show = useCallback((msg, duration) => {
    setMessage(msg);
    setVisible(true);
    setTimeout(() => setVisible(false), duration);
  }, []);

  useEffect(() => {
    showToastFn = show;
    return () => { showToastFn = null; };
  }, [show]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-lg bg-emerald-500/90 text-white text-sm font-medium shadow-lg backdrop-blur-sm animate-fade-in">
      {message}
    </div>
  );
}

export default Toast;
