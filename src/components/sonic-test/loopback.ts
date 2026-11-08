/**
 * In-browser "virtual cable": the transmitter plays into a MediaStream
 * destination and the receiver listens to that stream. Exercises the real
 * Web Audio path (AudioWorklet capture, decoder) without speaker or mic.
 * One cable per AudioContext.
 */
const cables = new WeakMap<AudioContext, MediaStreamAudioDestinationNode>();

export const loopbackFor = (
  context: AudioContext,
): MediaStreamAudioDestinationNode => {
  let cable = cables.get(context);
  if (!cable) {
    cable = context.createMediaStreamDestination();
    cables.set(context, cable);
  }
  return cable;
};
