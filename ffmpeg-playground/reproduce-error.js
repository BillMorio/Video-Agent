import axios from 'axios';

const FFMPEG_SERVER = "http://127.0.0.1:3333";

const sceneUrls = [
  "https://uywpbubzkaotglmauagr.supabase.co/storage/v1/object/public/projects/merged-1738947119159.mp4",
  "https://uywpbubzkaotglmauagr.supabase.co/storage/v1/object/public/projects/merged-1738947119159.mp4",
  "https://uywpbubzkaotglmauagr.supabase.co/storage/v1/object/public/projects/merged-1738947119159.mp4"
];

async function testStitch() {
  console.log("Triggering reproduction stitch...");
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
