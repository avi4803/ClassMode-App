import { useState, useEffect } from 'react';

export const usePasswordStrength = (password) => {
  const [strength, setStrength] = useState(0); // 0 to 4
  const [label, setLabel] = useState('Weak');
  const [color, setColor] = useState('#ef4444'); // Red default

  useEffect(() => {
    let score = 0;
    if (!password) {
      setStrength(0);
      return;
    }

    // 1. Length Check
    if (password.length > 7) score += 1;
    // 2. Number Check
    if (/\d/.test(password)) score += 1;
    // 3. Special Char Check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    // 4. Case Check
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;

    setStrength(score);

    // Map score to UI
    switch (score) {
      case 0:
      case 1:
        setLabel('Weak');
        setColor('#ef4444'); // Red
        break;
      case 2:
        setLabel('Fair');
        setColor('#eab308'); // Yellow
        break;
      case 3:
        setLabel('Good');
        setColor('#3b82f6'); // Blue
        break;
      case 4:
        setLabel('Strong');
        setColor('#22c55e'); // Green
        break;
    }
  }, [password]);

  return { strength, label, color };
};