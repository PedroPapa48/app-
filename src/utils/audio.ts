// Web Audio API synthesizer for cognitive study sounds and notifications

class AudioEngine {
  private ctx: AudioContext | null = null;
  private currentSource: AudioNode | null = null;
  private isPlaying = false;
  private currentTrack: string | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a gentle Tibetan bowl / chime chime sound on timer finish
  playCompletionChime() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, now); // 528Hz Solfeggio / clear chime
      osc.frequency.exponentialRampToValueAtTime(1056, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(528, now + 1.2);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 2.5);

      // Harmonizer
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(792, now);
      gain2.gain.setValueAtTime(0.15, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now);
      osc2.stop(now + 2.0);
    } catch (e) {
      console.error('Audio play error:', e);
    }
  }

  // Play synthetic continuous soundscape (Brown Noise, 40Hz Gamma, Rain)
  startSoundscape(type: 'brown_noise' | 'binaural_40hz' | 'rain') {
    try {
      this.stopSoundscape();
      this.initContext();
      if (!this.ctx) return;

      if (type === 'brown_noise') {
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Gain adjustment
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.15, this.ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        whiteNoise.start();
        this.currentSource = whiteNoise;
      } else if (type === 'binaural_40hz') {
        // 40Hz Gamma Wave entrainment (200Hz left ear, 240Hz right ear)
        const merger = this.ctx.createChannelMerger(2);

        const oscL = this.ctx.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.value = 200;

        const oscR = this.ctx.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.value = 240;

        const gainL = this.ctx.createGain();
        gainL.gain.value = 0.1;
        const gainR = this.ctx.createGain();
        gainR.gain.value = 0.1;

        oscL.connect(gainL);
        oscR.connect(gainR);

        gainL.connect(merger, 0, 0);
        gainR.connect(merger, 0, 1);

        const masterGain = this.ctx.createGain();
        masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        merger.connect(masterGain);
        masterGain.connect(this.ctx.destination);

        oscL.start();
        oscR.start();

        this.currentSource = masterGain;
      } else if (type === 'rain') {
        // Soft rain simulation with pink noise + bandpass
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          data[i] *= 0.08;
          b6 = white * 0.115926;
        }

        const rainSource = this.ctx.createBufferSource();
        rainSource.buffer = buffer;
        rainSource.loop = true;

        const rainFilter = this.ctx.createBiquadFilter();
        rainFilter.type = 'lowpass';
        rainFilter.frequency.value = 1200;

        const rainGain = this.ctx.createGain();
        rainGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

        rainSource.connect(rainFilter);
        rainFilter.connect(rainGain);
        rainGain.connect(this.ctx.destination);

        rainSource.start();
        this.currentSource = rainSource;
      }

      this.isPlaying = true;
      this.currentTrack = type;
    } catch (e) {
      console.error('Error starting soundscape:', e);
    }
  }

  stopSoundscape() {
    try {
      if (this.currentSource) {
        if ('stop' in this.currentSource && typeof (this.currentSource as AudioScheduledSourceNode).stop === 'function') {
          (this.currentSource as AudioScheduledSourceNode).stop();
        }
        this.currentSource.disconnect();
        this.currentSource = null;
      }
      this.isPlaying = false;
      this.currentTrack = null;
    } catch (e) {
      console.error('Error stopping soundscape:', e);
    }
  }

  getPlayingTrack() {
    return this.isPlaying ? this.currentTrack : null;
  }
}

export const audioEngine = new AudioEngine();
