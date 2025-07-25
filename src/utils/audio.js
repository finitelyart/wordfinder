let audioCtx;

function getAudioContext() {
  if (audioCtx === undefined) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API is not supported in this browser.");
      audioCtx = null;
    }
  }
  return audioCtx;
}

export function initAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    // Resume audio context on user gesture
    ctx.resume();
  }
}

export function playSound(type) {
  const audioCtx = getAudioContext();
  if (!audioCtx) return;

  // If context is still suspended, user hasn't interacted yet.
  if (audioCtx.state === 'suspended') return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  const now = audioCtx.currentTime;

  if (type === 'found') {
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, now); // A4
    oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    oscillator.start(now);
    oscillator.stop(now + 0.2);
  } else if (type === 'win') {
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(523.25, now); // C5
    oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, now + 0.2); // G5
    oscillator.frequency.setValueAtTime(1046.50, now + 0.3); // C6
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    oscillator.start(now);
    oscillator.stop(now + 0.5);
  }
}