import startAudioCap, {controlCapture} from './audio';
import updatePna from './particle';

let ctr = 0;

const valsCallBack = vals => {
  updatePna(vals);
  // if (ctr++ % 50 === 0) {
  //   console.log(vals);
  // }
};

setTimeout(() => controlCapture(true), 500);
startAudioCap(valsCallBack);
