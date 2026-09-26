export const createAmbientDrone = (ctx: AudioContext): OscillatorNode => {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 55; // Low A
  const gain = ctx.createGain();
  gain.gain.value = 0.05;
  osc.connect(gain).connect(ctx.destination);
  return osc;
};

export const createWindNoise = (ctx: AudioContext): AudioBufferSourceNode => {
  // Generate white noise buffer
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  // Band-pass filter for wind-like sound
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 400;
  filter.Q.value = 0.5;

  const gain = ctx.createGain();
  gain.gain.value = 0.02;

  source.connect(filter).connect(gain).connect(ctx.destination);
  return source;
};

export const createThunderCrack = (ctx: AudioContext): void => {
  const bufferSize = ctx.sampleRate * 1.5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    // Decaying noise burst
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.3));
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.value = 0.15;
  source.connect(gain).connect(ctx.destination);
  source.start();
};
