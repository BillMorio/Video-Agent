import axios from 'axios';

const FFMPEG_SERVER = "http://127.0.0.1:3333";

const sceneUrls = [
  "http://127.0.0.1:3333/outputs/speed-1770838256339.mp4",
  "http://127.0.0.1:3333/outputs/speed-1770838256339.mp4",
  "http://127.0.0.1:3333/outputs/speed-1770838256339.mp4"
];

async function testStitch() {
  console.log("Triggering verification stitch...");
  try {
    const response = await axios.post(`${FFMPEG_SERVER}/api/project/stitch`, {
      sceneUrls,
      useLightLeak: true,
      duration: 1.5
    }, {
      timeout: 600000 // 10 minutes
    });
    console.log("Success!", response.data);
  } catch (error) {
    if (error.response) {
      console.error("Server Error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("Network Error (No response):", error.message);
    } else {
      console.error("Error:", error.message);
    }
  }
}

testStitch();
