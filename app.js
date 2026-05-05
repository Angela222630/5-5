const MODEL_URL = 'models/model.json';
const METADATA_URL = 'models/metadata.json';
const labelMap = {
  shoes: '鞋子',
  plastic: '塑膠',
  clothes: '衣服'
};

const cameraPreview = document.getElementById('camera-preview');
const captureCanvas = document.getElementById('capture-canvas');
const startButton = document.getElementById('start-camera');
const captureButton = document.getElementById('capture-button');
const fileInput = document.getElementById('file-input');
const statusText = document.getElementById('status');
const resultText = document.getElementById('result-text');
const predictionList = document.getElementById('prediction-list');

let model = null;
let stream = null;

async function init() {
  try {
    statusText.textContent = '模型載入中…';
    model = await tmImage.load(MODEL_URL, METADATA_URL);
    statusText.textContent = '模型已載入，請啟動相機或上傳照片。';
  } catch (error) {
    console.error(error);
    statusText.textContent = '模型載入失敗，請檢查 models 資料夾與網路環境。';
  }
}

async function startCamera() {
  if (stream) {
    stopCamera();
    return;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });

    cameraPreview.srcObject = stream;
    cameraPreview.style.display = 'block';
    startButton.textContent = '停止相機';
    captureButton.disabled = false;
    statusText.textContent = '相機已啟動，請按「拍照辨識」。';
  } catch (error) {
    console.error(error);
    statusText.textContent = '無法取得相機權限，請改用上傳照片。';
  }
}

function stopCamera() {
  if (!stream) {
    return;
  }

  stream.getTracks().forEach(track => track.stop());
  stream = null;
  cameraPreview.srcObject = null;
  cameraPreview.style.display = 'none';
  startButton.textContent = '啟動相機';
  captureButton.disabled = true;
  statusText.textContent = '相機已停止，您也可以上傳照片。';
}

async function captureAndClassify() {
  if (!model) {
    statusText.textContent = '尚未載入模型，請稍候。';
    return;
  }

  const context = captureCanvas.getContext('2d');
  context.drawImage(cameraPreview, 0, 0, captureCanvas.width, captureCanvas.height);
  await classifyImage(captureCanvas);
}

async function classifyImage(imageSource) {
  if (!model) {
    return;
  }

  try {
    statusText.textContent = '辨識中…';
    const prediction = await model.predict(imageSource, false);
    if (!Array.isArray(prediction) || prediction.length === 0) {
      resultText.textContent = '無法取得辨識結果。';
      predictionList.innerHTML = '';
      statusText.textContent = '辨識失敗。';
      return;
    }

    const sorted = prediction.slice().sort((a, b) => b.probability - a.probability);
    const best = sorted[0];
    const labelText = labelMap[best.className] || best.className;
    resultText.textContent = `預測為：${labelText} (${(best.probability * 100).toFixed(1)}%)`;
    predictionList.innerHTML = sorted
      .map(item => {
        const name = labelMap[item.className] || item.className;
        return `<li><span>${name}</span><strong>${(item.probability * 100).toFixed(1)}%</strong></li>`;
      })
      .join('');
    statusText.textContent = '辨識完成。';
  } catch (error) {
    console.error(error);
    resultText.textContent = '辨識發生錯誤，請重新嘗試。';
    statusText.textContent = '辨識失敗。';
  }
}

fileInput.addEventListener('change', async event => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = async () => {
      const context = captureCanvas.getContext('2d');
      context.drawImage(image, 0, 0, captureCanvas.width, captureCanvas.height);
      await classifyImage(captureCanvas);
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});

startButton.addEventListener('click', startCamera);
captureButton.addEventListener('click', captureAndClassify);
window.addEventListener('beforeunload', stopCamera);

init();
