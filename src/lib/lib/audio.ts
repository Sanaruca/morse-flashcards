class MorseAudio {
	ctx: AudioContext | null = null;
	osc: OscillatorNode | null = null;
	gain: GainNode | null = null;

	ensure() {
		if (!this.ctx) {
			const C = window.AudioContext || (window as any).webkitAudioContext;
			this.ctx = new C();
		}
		if (this.ctx.state === 'suspended') {
			this.ctx.resume();
		}
	}

	startTone() {
		this.ensure();
		const now = this.ctx!.currentTime;
		this.osc = this.ctx!.createOscillator();
		this.osc.type = 'sine';
		this.osc.frequency.value = 680;
		this.gain = this.ctx!.createGain();
		this.gain.gain.setValueAtTime(0, now);
		this.gain.gain.linearRampToValueAtTime(0.35, now + 0.004);
		this.osc.connect(this.gain);
		this.gain.connect(this.ctx!.destination);
		this.osc.start(now);
	}

	stopTone() {
		if (this.gain && this.ctx) {
			const now = this.ctx.currentTime;
			this.gain.gain.setValueAtTime(this.gain.gain.value || 0.35, now);
			this.gain.gain.linearRampToValueAtTime(0, now + 0.008);
		}
		if (this.osc) {
			const stopTime = this.ctx!.currentTime + 0.012;
			this.osc.stop(stopTime);
			this.osc = null;
			this.gain = null;
		}
	}

	tone(freq: number, duration: number, startTime: number) {
		this.ensure();
		const osc = this.ctx!.createOscillator();
		const g = this.ctx!.createGain();
		osc.type = 'sine';
		osc.frequency.value = freq;
		const t = startTime;
		g.gain.setValueAtTime(0, t);
		g.gain.linearRampToValueAtTime(0.25, t + 0.004);
		g.gain.linearRampToValueAtTime(0.25, t + duration - 0.006);
		g.gain.linearRampToValueAtTime(0, t + duration);
		osc.connect(g);
		g.connect(this.ctx!.destination);
		osc.start(t);
		osc.stop(t + duration + 0.01);
	}

	playSuccess() {
		this.ensure();
		const now = this.ctx!.currentTime;
		this.tone(523, 0.12, now);
		this.tone(659, 0.12, now + 0.1);
		this.tone(784, 0.18, now + 0.2);
	}

	playError() {
		this.ensure();
		const now = this.ctx!.currentTime;
		this.tone(392, 0.18, now);
		this.tone(330, 0.25, now + 0.14);
	}

	playAchievement() {
		this.ensure();
		const now = this.ctx!.currentTime;
		this.tone(523, 0.1, now);
		this.tone(659, 0.1, now + 0.1);
		this.tone(784, 0.1, now + 0.2);
		this.tone(1047, 0.3, now + 0.3);
	}
}

export const audio = new MorseAudio();
