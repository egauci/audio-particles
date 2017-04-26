
navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);


const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let source;

const analyser = audioCtx.createAnalyser();
analyser.minDecibels = -150; // -90;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstant = 0.85;

let running = false;

let callBack;
let dataArray;
const bins = 8;

const processArray = () => {
  const ret = [];
  const binSize = dataArray.length / bins;
  for (let i = 0; i < bins; i += 1) {
    const offSet = i * binSize;
    const sub = dataArray.slice(offSet, offSet + binSize);
    ret[i] = Math.floor(sub.reduce((s, v) => s + v, 0) / sub.length);
  }
  return ret;
};

function analyze() {
  if (running) {
    requestAnimationFrame(analyze);
  } else {
    console.log('Stopped');
    return;
  }
  // analyser.getByteTimeDomainData(dataArray);
  analyser.getByteFrequencyData(dataArray);
  callBack(processArray());
}

export const controlCapture = newval => {
  running = newval;
  if (running) {
    analyze();
  }
};

const visualize = () => {
  analyser.fftSize = 32;
  const bufferLength = analyser.frequencyBinCount;
  console.log('buffer length: ', bufferLength);
  dataArray = new Uint8Array(bufferLength);
  analyze();
};

export default cb => {
  callBack = cb;
  if (navigator.getUserMedia) {
    navigator.getUserMedia({audio: true},
      // Success callback
      stream => {
        source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        visualize();
      },
      // Error callback
      err => {
        console.error('The following gUM error occured: ' + err);
      }
    );
  } else {
    console.error('getUserMedia not supported on your browser!');
  }
};
