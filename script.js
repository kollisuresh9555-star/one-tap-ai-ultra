

"use strict";

/* =========================
   APP
========================= */

const APP = {

    name: "One Tap AI Ultra 2050",

    version: "2050",

    theme: "dark",

    mode: "chat",

    style: "3d",

    duration: 10,

    maxPrompt: 5000

};

/* =========================
   API CONFIG
========================= */

const API = {

    chat: {

        provider: "OpenRouter",

        url: "https://openrouter.ai/api/v1/chat/completions",

        model: "openai/gpt-4o-mini"

    },

    image: {

        provider: "Fal AI",

        url: "https://fal.run"

    },

    video: { 

        provider: "Fal AI / Runway",

        url: "https://fal.run"

    },

    music: {

        provider: "Suno",

        url: ""

    },

    voice: {

        provider: "ElevenLabs",

        url: "https://api.elevenlabs.io/v1"

    }

};

/* =========================
   STORAGE
========================= */

const Store = {

    save(key, value) {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

    },

    load(key, fallback = null) {

        try {

            const value =
                localStorage.getItem(key);

            return value
                ? JSON.parse(value)
                : fallback;

        }

        catch {

            return fallback;

        }

    }

};

/* =========================
   DOM
========================= */

const $ = id =>
document.getElementById(id);

const splashScreen = $("splashScreen");

const prompt = $("prompt");

const counter = $("counter");

const generateBtn = $("generateBtn");

const progressBar = $("progressBar");

const previewArea = $("previewArea");

const historyList = $("historyList");

const themeBtn = $("themeBtn");

const themeSwitch = $("themeSwitch");

const settingsBtn = $("settingsBtn");

const settingsPanel = $("settingsPanel");

const overlay = $("overlay");

const closeSettings = $("closeSettings");

const duration = $("duration");

/* =========================
   API INPUTS
========================= */

const chatApi = $("chatApi");

const imageApi = $("imageApi");

const videoApi = $("videoApi");

const musicApi = $("musicApi");

const voiceApi = $("voiceApi");

const saveApiBtn = $("saveApiBtn");
const toast = $("toast");

function showToast(message){

    if(!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(()=>{

        toast.classList.remove("show");

    },2500);

}
/* =========================
   SPLASH
========================= */

window.addEventListener("load", () => {

    setTimeout(() => {

        splashScreen.style.opacity = "0";

        splashScreen.style.pointerEvents = "none";

        setTimeout(() => {

            splashScreen.remove();

        }, 500);

    }, 2200);

});

/* =========================
   LOAD SETTINGS
========================= */

function loadSettings() {

    APP.theme =
        Store.load("theme", "dark");

    document.body.className =
        APP.theme;

    if (themeSwitch) {

        themeSwitch.checked =
            APP.theme === "light";

    }

    chatApi.value =
        Store.load("chat_api", "");

    imageApi.value =
        Store.load("image_api", "");

    videoApi.value =
        Store.load("video_api", "");

    musicApi.value =
        Store.load("music_api", "");

    voiceApi.value =
        Store.load("voice_api", "");

}

loadSettings();/* ==========================================
   ONE TAP AI ULTRA 2050
   SCRIPT.JS - PART 2
========================================== */

/* =========================
   THEME
========================= */

function setTheme(theme){

    APP.theme = theme;

    document.body.className = theme;

    Store.save("theme", theme);

    if(themeSwitch){

        themeSwitch.checked =
        theme === "light";

    }

    const icon =
    themeBtn.querySelector("i");

    if(icon){

        icon.className =
        theme === "light"
        ? "fa-solid fa-sun"
        : "fa-solid fa-moon";

    }

}

themeBtn?.addEventListener("click",()=>{

    setTheme(

        APP.theme==="dark"
        ? "light"
        : "dark"

    );

});

themeSwitch?.addEventListener("change",(e)=>{

    setTheme(

        e.target.checked
        ? "light"
        : "dark"

    );

});

/* =========================
   SETTINGS PANEL
========================= */

function openSettings(){

    settingsPanel.classList.add("show");

    overlay.style.display="block";

    document.body.style.overflow="hidden";

}

function hideSettings(){

    settingsPanel.classList.remove("show");

    overlay.style.display="none";

    document.body.style.overflow="";

}

settingsBtn?.addEventListener(

"click",

openSettings

);

closeSettings?.addEventListener(

"click",

hideSettings

);

overlay?.addEventListener(

"click",

hideSettings

);

/* =========================
   SAVE API KEYS
========================= */

saveApiBtn?.addEventListener(

"click",

()=>{

Store.save(

"chat_api",

chatApi.value.trim()

);

Store.save(

"image_api",

imageApi.value.trim()

);

Store.save(

"video_api",

videoApi.value.trim()

);

Store.save(

"music_api",

musicApi.value.trim()

);

Store.save(

"voice_api",

voiceApi.value.trim()

);

alert("✅ API Keys Saved");

}

);

/* =========================
   PROMPT COUNTER
========================= */
/* =========================
   VOICE INPUT
========================= */

const voiceBtn = $("voiceBtn");

let recognition = null;

if ("webkitSpeechRecognition" in window) {

    recognition = new webkitSpeechRecognition();

    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults = false;

    voiceBtn?.addEventListener("click", () => {

        recognition.start();

        voiceBtn.classList.add("voiceListening");

    });

    recognition.onresult = (event) => {

        const speech = event.results[0][0].transcript;

        prompt.value += speech;

        updateCounter();

    };

    recognition.onend = () => {

        voiceBtn.classList.remove("voiceListening");

    };

} else {

    voiceBtn?.addEventListener("click", () => {

        alert("Voice input is not supported on this browser.");

    });

}
function updateCounter(){

const len =
prompt.value.length;

counter.textContent =
`${len} / ${APP.maxPrompt}`;

}

prompt?.addEventListener(

"input",

updateCounter

);

updateCounter();

/* =========================
   DURATION
========================= */

duration?.addEventListener(

"change",

(e)=>{

APP.duration =
Number(e.target.value);

}

);
/* =========================
   IMAGE UPLOAD
========================= */

const imageInput = $("imageInput");

const uploadBtn = $("uploadBtn");

const imagePreview = $("imagePreview");

uploadBtn?.addEventListener("click", () => {

    imageInput.click();

});

imageInput?.addEventListener("change", e => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(event){

        imagePreview.innerHTML = `

        <img src="${event.target.result}">

        `;

    };

    reader.readAsDataURL(file);

});
/* =========================
   AI STYLE
========================= */

document
.querySelectorAll(".styleBtn")
.forEach(btn=>{

btn.addEventListener(

"click",

()=>{

document
.querySelectorAll(".styleBtn")
.forEach(x=>
x.classList.remove("active")
);

btn.classList.add("active");

APP.style =
btn.dataset.style;

}

);

});

/* =========================
   AI MODE
========================= */

document
.querySelectorAll(".modeBtn")
.forEach(btn=>{

btn.addEventListener(

"click",

()=>{

document
.querySelectorAll(".modeBtn")
.forEach(x=>
x.classList.remove("active")
);

btn.classList.add("active");

APP.mode =
btn.dataset.mode;

}

);

});

/* =========================
   HISTORY
========================= */

let historyData =
Store.load("history",[]);

function addHistory(item){

historyData.unshift(item);

if(historyData.length>100){

historyData.length=100;

}

Store.save(

"history",

historyData

);

}

function renderHistory(){

if(!historyList) return;

if(historyData.length===0){

historyList.innerHTML=`

<div class="emptyHistory">

No History Available

</div>

`;

return;

}

historyList.innerHTML="";

historyData.forEach(item=>{

const div=
document.createElement("div");

div.className=
"historyItem";

div.innerHTML=`

<b>${item.mode}</b>

<br><br>

${item.prompt}

<br><br>

<small>${item.time}</small>

`;

historyList.appendChild(div);

});

}

renderHistory();/* ==========================================
   ONE TAP AI ULTRA 2050
   SCRIPT.JS - PART 3
========================================== */

/* =========================
   HELPERS
========================= */

function apiKey(type){

    return Store.load(type + "_api","");

}

function setProgress(value){

    if(progressBar){

        progressBar.style.width=value+"%";

    }

}

function showOutput(html){
/* =========================
   AI THINKING
========================= */

const thinkingBox = $("thinkingBox");

function showThinking(){

    if(thinkingBox){

        thinkingBox.style.display = "block";

    }

    if(previewArea){

        previewArea.style.display = "none";

    }

}

function hideThinking(){

    if(thinkingBox){

        thinkingBox.style.display = "none";

    }

    if(previewArea){

        previewArea.style.display = "flex";

    }

}
    previewArea.innerHTML=html;

}

function escapeHTML(text){

    return String(text)

    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");

}

/* =========================
   GENERATE
========================= */
/* =========================
   INSTALL APP
========================= */

let installPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {

    e.preventDefault();

    installPrompt = e;

    $("installBtn").style.display = "block";

});

$("installBtn")?.addEventListener("click", async () => {

    if (!installPrompt) {

        alert("Install option is not available.");

        return;

    }

    installPrompt.prompt();

    await installPrompt.userChoice;

    installPrompt = null;

    $("installBtn").style.display = "none";

});
generateBtn?.addEventListener(

"click",

generate

);

async function generate(){

const text=prompt.value.trim();

if(!text){

alert("Please enter a prompt.");

return;

}

generateBtn.disabled=true;

generateBtn.innerHTML=`
<i class="fa-solid fa-spinner fa-spin"></i>
Generating...
`;

setProgress(10);

try{

let result;

switch(APP.mode){

case "chat":

result=
await generateChat(text);

break;

case "image":

result=
await generateImage(text);

break;

case "video":

result=
await generateVideo(text);

break;

case "music":

result=
await generateMusic(text);

break;

case "voice":

result=
await generateVoice(text);

break;

}

addHistory({

mode:APP.mode,

prompt:text,

time:new Date().toLocaleString()

});

renderHistory();

setProgress(100);

}

catch(err){

console.error(err);

alert(err.message);

setProgress(0);

}

generateBtn.disabled=false;

generateBtn.innerHTML=`
<i class="fa-solid fa-bolt"></i>
GENERATE
`;

}

/* =========================
   OPENROUTER CHAT
========================= * 
async function generateChat(promptText) {

    if (!promptText || !promptText.trim()) {
        throw new Error("Please enter a prompt");
    }

    const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            prompt: promptText.trim()
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Chat API request failed"
        );
    }

    if (!data.answer) {
        throw new Error("No answer received");
    }

    const answer = data.answer;

    showOutput(`
        <div class="chatResult">
            <pre>${escapeHTML(answer)}</pre>
        </div>
    `);

    return answer;
}
/==================
   IMAGE
========================= */

async function generateImage(text) {

    const response = await fetch("/api/image", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            prompt: text,
            image_size: "square_hd"
        })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.error || "Image generation failed."
        );
    }

    if (!data.image) {
        throw new Error(
            "No image URL received from Fal AI."
        );
    }

    const imageUrl = data.image;

    const previewArea =
        document.getElementById("previewArea");

    if (previewArea) {
        previewArea.innerHTML = `
            <img
                src="${imageUrl}"
                alt="AI Generated Image"
                style="
                    width:100%;
                    max-width:100%;
                    border-radius:20px;
                    display:block;
                "
            />
        `;
    }

    const downloadBtn =
        document.getElementById("downloadBtn");

    if (downloadBtn) {

        downloadBtn.style.display = "block";

        downloadBtn.onclick = () => {

            const link =
                document.createElement("a");

            link.href = imageUrl;
            link.target = "_blank";
            link.rel = "noopener";

            link.click();
        };
    }

    return imageUrl;
}

/* =========================
   VIDEO
========================= */
async function generateVideo(promptText) {
  if (!promptText || !promptText.trim()) {
    throw new Error("Please enter a video prompt");
  }

  const response = await fetch("/api/video", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt: promptText.trim()
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
      data?.error ||
      "Video generation failed"
    );
  }

  if (!data.request_id) {
    throw new Error("Video request ID was not received");
  }

  showOutput(`
    <div class="videoResult">
      <p>🎬 Video generation started...</p>
      <p>Please wait...</p>
    </div>
  `);

  const requestId = data.request_id;

  for (let attempt = 0; attempt < 60; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 3000));

    const statusResponse = await fetch("/api/video-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        request_id: requestId
      })
    });

    const statusData = await statusResponse.json();

    if (!statusResponse.ok) {
      throw new Error(
        statusData?.error?.message ||
        statusData?.error ||
        "Video status check failed"
      );
    }

    const status = statusData?.status?.status;

    if (status === "COMPLETED") {
      const result = statusData.result;

      const videoUrl =
        result?.video?.url ||
        result?.video_url ||
        result?.url;

      if (!videoUrl) {
        throw new Error("Video completed but URL was not found");
      }

      showOutput(`
        <div class="videoResult">
          <p>✅ Video generated successfully!</p>

          <video
            src="${videoUrl}"
            controls
            playsinline
            style="width:100%;max-width:720px;border-radius:12px;"
          ></video>

          <br>

          <a
            href="${videoUrl}"
            target="_blank"
            rel="noopener"
          >
            ⬇️ Open / Download Video
          </a>
        </div>
      `);

      return result;
    }

    if (status === "FAILED") {
      throw new Error("Video generation failed");
    }

    showOutput(`
      <div class="videoResult">
        <p>🎬 Generating video...</p>
        <p>Status: ${status || "IN_PROGRESS"}</p>
      </div>
    `);
  }

  throw new Error("Video generation timed out. Please try again.");
}

/* =========================
   MUSIC
========================= */

async function generateMusic(){

throw new Error(

"Suno integration will be added in next part."

);

}

/* =========================
   VOICE
========================= */

async function generateVoice(){

throw new Error(

"ElevenLabs integration will be added in next part."

);

}
