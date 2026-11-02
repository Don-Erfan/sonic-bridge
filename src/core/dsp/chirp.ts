/** Linear frequency sweep with Tukey-tapered edges, normalized to unit peak amplitude. */
export function linearChirp(
  startFrequency: number,
  endFrequency: number,
  length: number,
  sampleRate: number,
  taper = 0.1,
): Float32Array {
  const out = new Float32Array(length);
  const duration = length / sampleRate;
  const k = (endFrequency - startFrequency) / duration;
  const ramp = Math.max(1, Math.floor(length * taper * 0.5));
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const phase = 2 * Math.PI * (startFrequency * t + (k * t * t) / 2);
    let gain = 1;
    if (i < ramp) gain = 0.5 - 0.5 * Math.cos((Math.PI * i) / ramp);
    else if (i >= length - ramp) gain = 0.5 - 0.5 * Math.cos((Math.PI * (length - 1 - i)) / ramp);
    out[i] = gain * Math.sin(phase);
  }
  return out;
}
