/**
 * Web Audio API based Sound Synthesizer & Speech Notification
 * No external mp3 files required - works offline and across browsers.
 */

class AudioAlertManager {
  private audioCtx: AudioContext | null = null;

  private initAudio() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Play a crisp, pleasant 3-tone PC Bang Order Bell sound
   */
  public playOrderChime(volume: number = 0.8) {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const masterGain = this.audioCtx.createGain();
      masterGain.gain.setValueAtTime(volume, now);
      masterGain.connect(this.audioCtx.destination);

      // Chime note sequence (E5, G#5, B5, E6 - Major Arpeggio chime)
      const notes = [
        { freq: 659.25, time: 0.0, duration: 0.2 },
        { freq: 830.61, time: 0.15, duration: 0.2 },
        { freq: 987.77, time: 0.3, duration: 0.2 },
        { freq: 1318.51, time: 0.45, duration: 0.6 },
      ];

      notes.forEach(({ freq, time, duration }) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const noteGain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);

        // Envelope
        noteGain.gain.setValueAtTime(0, now + time);
        noteGain.gain.linearRampToValueAtTime(0.6, now + time + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + time + duration);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + time);
        osc.stop(now + time + duration);
      });
    } catch (e) {
      console.error('Failed to play audio alert:', e);
    }
  }

  /**
   * Text-To-Speech Korean voice notification
   */
  public speakKoreanNotification(text: string) {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Cancel ongoing speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        utterance.rate = 1.0;
        utterance.pitch = 1.1;

        // Find Korean voice if available
        const voices = window.speechSynthesis.getVoices();
        const koVoice = voices.find((v) => v.lang.includes('ko') || v.lang.includes('KO'));
        if (koVoice) {
          utterance.voice = koVoice;
        }

        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error('Speech synthesis error:', e);
    }
  }

  /**
   * Request and show Browser Native Notification
   */
  public async sendBrowserNotification(title: string, options?: NotificationOptions) {
    try {
      if (!('Notification' in window)) return;

      if (Notification.permission === 'granted') {
        new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options,
        });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, options);
        }
      }
    } catch (e) {
      console.error('Notification error:', e);
    }
  }
}

export const audioAlert = new AudioAlertManager();
