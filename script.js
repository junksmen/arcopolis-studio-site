const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const ambientAudio = document.querySelector('#ambient-audio');
const audioControl = document.querySelector('#audio-control');
const glass = document.querySelector('.dead-tech-glass');
const glassRadiation = document.querySelector('#glass-radiation');
const pupilAnchor = document.querySelector('.pupil-anchor');

const alignGlassRadiation = () => {
  if (!glass || !glassRadiation || !pupilAnchor) return;
  const glassBox = glass.getBoundingClientRect();
  const pupilBox = pupilAnchor.getBoundingClientRect();
  const x = ((pupilBox.left + pupilBox.width / 2 - glassBox.left) / glassBox.width) * 1600;
  const y = ((pupilBox.top + pupilBox.height / 2 - glassBox.top) / glassBox.height) * 1000;
  glassRadiation.setAttribute('transform', `translate(${x} ${y})`);
};

alignGlassRadiation();
window.addEventListener('resize', alignGlassRadiation);

if (ambientAudio && audioControl) {
  ambientAudio.volume = 0.42;

  const setAudioState = (isPlaying) => {
    audioControl.setAttribute('aria-pressed', String(isPlaying));
    audioControl.textContent = isPlaying ? 'AUDIO // LIVE' : 'AUDIO // STANDBY';
    audioControl.setAttribute('aria-label', isPlaying ? 'Mute ambient transmission audio' : 'Enable ambient transmission audio');
  };

  const startAudio = () => ambientAudio.play().then(() => setAudioState(true)).catch(() => setAudioState(false));

  // Try immediately; browsers that allow it will start the loop on arrival.
  startAudio();

  audioControl.addEventListener('click', () => {
    if (ambientAudio.paused) {
      startAudio();
    } else {
      ambientAudio.pause();
      setAudioState(false);
    }
  });

  // If autoplay was blocked, the visitor's first interaction activates the loop.
  document.addEventListener('pointerdown', startAudio, { once: true });
}
