let theme="theme1"
let selectedTextColor="#ffffff"
const STORAGE_KEY="church_slide_draft_v1"
let suppressSave=false

// --- Telegram Bot Configuration (Loaded from env.js) ---
const TG_BOT_TOKEN = window.ENV_TG_BOT_TOKEN || ""; 
const TG_CHAT_ID = window.ENV_TG_CHAT_ID || "";

const paletteColors=[
"#ffffff","#f5f5f5","#e5e7eb","#9ca3af","#111827",
"#000000","#ef4444","#f97316","#f59e0b","#eab308",
"#84cc16","#22c55e","#10b981","#14b8a6","#06b6d4",
"#0ea5e9","#3b82f6","#6366f1","#8b5cf6","#a855f7",
"#d946ef","#ec4899","#f43f5e","#7c2d12","#1f2937"
]

function setTheme(t, buttonEl){
theme=t

syncThemeCardUI(buttonEl)

refreshPreviewIfNeeded()
saveState()
}

function syncThemeCardUI(buttonEl){
let cards=document.querySelectorAll(".theme-card")
cards.forEach(card=>card.classList.remove("active"))
if(buttonEl){
buttonEl.classList.add("active")
return
}
let selected=document.querySelector(`.theme-card[data-theme="${theme}"]`)
if(selected){
selected.classList.add("active")
}
}

function getSlidesFromText(showAlert=true){

let text=document.getElementById("lyrics").value

if(!text.trim()){
if(showAlert){
alert("Pehle text/lyrics dalo.")
}
return []
}

return text
.split(/\n\s*\n+/)
.map(s=>s.trim())
.filter(Boolean)
}

function hexToRgba(hex, alpha){
let clean=hex.replace("#","")
let r=parseInt(clean.substring(0,2),16)
let g=parseInt(clean.substring(2,4),16)
let b=parseInt(clean.substring(4,6),16)
return `rgba(${r},${g},${b},${alpha})`
}

function getTextStyle(){
let opacity=parseFloat(document.getElementById("textOpacity").value)
let fontSize=parseInt(document.getElementById("fontSize").value,10)
let offsetX=parseInt(document.getElementById("offsetX").value,10)
let offsetY=parseInt(document.getElementById("offsetY").value,10)
let textAlign=document.getElementById("textAlign").value
return {
color:hexToRgba(selectedTextColor, opacity),
fontSize,
offsetX,
offsetY,
textAlign
}
}

function markActiveSwatch(color){
let swatches=document.querySelectorAll(".color-swatch")
swatches.forEach(swatch=>{
let isActive=swatch.dataset.color.toLowerCase()===color.toLowerCase()
swatch.classList.toggle("active",isActive)
})
}

function setTextColor(color){
selectedTextColor=color
document.getElementById("textColor").value=color
markActiveSwatch(color)
refreshPreviewIfNeeded()
saveState()
}

function initColorPalette(){
let palette=document.getElementById("colorPalette")
palette.innerHTML=""

paletteColors.forEach(color=>{
let btn=document.createElement("button")
btn.type="button"
btn.className="color-swatch"
btn.dataset.color=color
btn.style.backgroundColor=color
btn.title=color
btn.setAttribute("aria-label",`Select color ${color}`)
btn.onclick=()=>setTextColor(color)
palette.appendChild(btn)
})

markActiveSwatch(selectedTextColor)
}

function clamp(value, min, max){
return Math.min(max, Math.max(min, value))
}

function applyOffsetToPreview(offsetX, offsetY){
let texts=document.querySelectorAll(".slide-text")
texts.forEach(text=>{
text.style.transform=`translate(${offsetX}px, ${offsetY}px)`
})
}

function setOffsets(offsetX, offsetY){
let xInput=document.getElementById("offsetX")
let yInput=document.getElementById("offsetY")

let nextX=clamp(offsetX, parseInt(xInput.min,10), parseInt(xInput.max,10))
let nextY=clamp(offsetY, parseInt(yInput.min,10), parseInt(yInput.max,10))

xInput.value=nextX
yInput.value=nextY
updateOffsetXValue()
updateOffsetYValue()
applyOffsetToPreview(nextX, nextY)
saveState()
}

function getCurrentState(){
return {
pdfName:document.getElementById("pdfName").value,
theme,
lyrics:document.getElementById("lyrics").value,
textColor:selectedTextColor,
textOpacity:document.getElementById("textOpacity").value,
fontSize:document.getElementById("fontSize").value,
offsetX:document.getElementById("offsetX").value,
offsetY:document.getElementById("offsetY").value,
textAlign:document.getElementById("textAlign").value,
autoFitText:document.getElementById("autoFitText").checked
}
}

function saveState(){
if(suppressSave) return
localStorage.setItem(STORAGE_KEY, JSON.stringify(getCurrentState()))
}

function clearSavedState(){
localStorage.removeItem(STORAGE_KEY)
}

function loadState(){
let raw=localStorage.getItem(STORAGE_KEY)
if(!raw) return

try{
let saved=JSON.parse(raw)
suppressSave=true

if(saved.pdfName!==undefined) document.getElementById("pdfName").value=saved.pdfName
if(saved.lyrics!==undefined) document.getElementById("lyrics").value=saved.lyrics
if(saved.theme) theme=saved.theme
syncThemeCardUI()

if(saved.textOpacity!==undefined) document.getElementById("textOpacity").value=saved.textOpacity
if(saved.fontSize!==undefined) document.getElementById("fontSize").value=saved.fontSize
if(saved.offsetX!==undefined) document.getElementById("offsetX").value=saved.offsetX
if(saved.offsetY!==undefined) document.getElementById("offsetY").value=saved.offsetY
if(saved.textAlign!==undefined) document.getElementById("textAlign").value=saved.textAlign
if(saved.autoFitText!==undefined) document.getElementById("autoFitText").checked=Boolean(saved.autoFitText)

if(saved.textColor){
selectedTextColor=saved.textColor
document.getElementById("textColor").value=saved.textColor
}
markActiveSwatch(selectedTextColor)

updateOpacityValue()
updateFontSizeValue()
updateOffsetXValue()
updateOffsetYValue()

let slides=getSlidesFromText(false)
if(slides.length){
renderSlides(slides)
}
}catch(error){
clearSavedState()
}finally{
suppressSave=false
}
}

function enableTextDrag(textDiv){
let startX=0
let startY=0
let initialOffsetX=0
let initialOffsetY=0
let dragging=false

textDiv.addEventListener("pointerdown",(event)=>{
event.preventDefault()
dragging=true
textDiv.setPointerCapture(event.pointerId)
textDiv.classList.add("dragging")

startX=event.clientX
startY=event.clientY
initialOffsetX=parseInt(document.getElementById("offsetX").value,10)
initialOffsetY=parseInt(document.getElementById("offsetY").value,10)
})

textDiv.addEventListener("pointermove",(event)=>{
if(!dragging) return
let dx=event.clientX-startX
let dy=event.clientY-startY
setOffsets(initialOffsetX+dx, initialOffsetY+dy)
})

function stopDrag(event){
if(!dragging) return
dragging=false
textDiv.classList.remove("dragging")
if(event && textDiv.hasPointerCapture(event.pointerId)){
textDiv.releasePointerCapture(event.pointerId)
}
}

textDiv.addEventListener("pointerup",stopDrag)
textDiv.addEventListener("pointercancel",stopDrag)
}

function renderSlides(slides){

let preview=document.getElementById("preview")

preview.innerHTML=""

slides.forEach(s=>{

let div=document.createElement("div")
let textDiv=document.createElement("div")
let textStyle=getTextStyle()

div.className="slide"
textDiv.className="slide-text"

div.style.backgroundImage=`url(themes/${theme}.png)`

textDiv.style.color=textStyle.color
textDiv.style.fontSize=`${textStyle.fontSize}px`
textDiv.style.transform=`translate(${textStyle.offsetX}px, ${textStyle.offsetY}px)`
textDiv.style.textAlign=textStyle.textAlign
textDiv.innerText=s
enableTextDrag(textDiv)

div.appendChild(textDiv)
autoFitTextIfNeeded(textDiv, textStyle.fontSize)

preview.appendChild(div)

})
}

function autoFitTextIfNeeded(textDiv, baseFontSize){
if(!document.getElementById("autoFitText").checked) return
let fontSize=baseFontSize
let slide=textDiv.parentElement
while(fontSize>18 && (textDiv.scrollWidth>slide.clientWidth || textDiv.scrollHeight>slide.clientHeight)){
fontSize-=1
textDiv.style.fontSize=`${fontSize}px`
}
}

function addSlideBreak(){
let textarea=document.getElementById("lyrics")
let start=textarea.selectionStart
let end=textarea.selectionEnd
let value=textarea.value

let insertText="\n\n[Nayi Slide yahan likhein]"
let updated=value.slice(0,start)+insertText+value.slice(end)
textarea.value=updated

let caretStart=start+2
let caretEnd=start+insertText.length
textarea.focus()
textarea.setSelectionRange(caretStart,caretEnd)

refreshPreviewIfNeeded()
saveState()
}

function resetDraft(){
let confirmed=window.confirm("Draft reset karna hai? Ye current saved data hata dega.")
if(!confirmed) return

clearSavedState()
suppressSave=true

document.getElementById("pdfName").value=""
document.getElementById("lyrics").value=""
document.getElementById("textOpacity").value="1"
document.getElementById("fontSize").value="48"
document.getElementById("offsetX").value="0"
document.getElementById("offsetY").value="0"
document.getElementById("textAlign").value="center"
document.getElementById("autoFitText").checked=true

theme="theme1"
selectedTextColor="#ffffff"
document.getElementById("textColor").value=selectedTextColor
syncThemeCardUI()
markActiveSwatch(selectedTextColor)

updateOpacityValue()
updateFontSizeValue()
updateOffsetXValue()
updateOffsetYValue()

document.getElementById("preview").innerHTML=""
suppressSave=false
}

function previewSlides(){
let slides=getSlidesFromText()
if(!slides.length) return
renderSlides(slides)
saveState()
}

function refreshPreviewIfNeeded(){
saveState()
let hasPreview=document.querySelectorAll(".slide").length>0
if(!hasPreview) return
let slides=getSlidesFromText(false)
if(!slides.length){
document.getElementById("preview").innerHTML=""
return
}
renderSlides(slides)
}

function updateOpacityValue(){
let value=parseFloat(document.getElementById("textOpacity").value).toFixed(2)
document.getElementById("opacityValue").innerText=value
}

function updateFontSizeValue(){
let value=parseInt(document.getElementById("fontSize").value,10)
document.getElementById("fontSizeValue").innerText=`${value}px`
}

function updateOffsetXValue(){
let value=parseInt(document.getElementById("offsetX").value,10)
document.getElementById("offsetXValue").innerText=`${value}px`
}

function updateOffsetYValue(){
let value=parseInt(document.getElementById("offsetY").value,10)
document.getElementById("offsetYValue").innerText=`${value}px`
}

async function downloadPDF(){

const { jsPDF } = window.jspdf

let slidesData=getSlidesFromText()
if(!slidesData.length) return

let slides=document.querySelectorAll(".slide")
if(!slides.length){
renderSlides(slidesData)
slides=document.querySelectorAll(".slide")
}

let pdf=new jsPDF({
orientation:"landscape",
unit:"px",
format:[960,540]
})

for(let i=0;i<slides.length;i++){

let canvas=await html2canvas(slides[i])

let img=canvas.toDataURL("image/png")

if(i>0) pdf.addPage()

pdf.addImage(img,"PNG",0,0,960,540)

}

let rawName=document.getElementById("pdfName").value.trim()
let safeName=rawName
.replace(/[\\/:*?"<>|]/g,"")
.replace(/\s+/g,"_")

if(!safeName) safeName="church_slides"

pdf.save(`${safeName}.pdf`)

// Telegram Notification Bhejne ka logic
if (TG_BOT_TOKEN && TG_BOT_TOKEN !== "YOUR_BOT_TOKEN_HERE") {
    let textMsg = `New Presentation Downloaded!\nFile Name: ${safeName}.pdf`;
    let tgUrl = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`;
    fetch(tgUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TG_CHAT_ID, text: textMsg })
    }).catch(e => console.error("Telegram Error:", e));
}
}

updateOpacityValue()
updateFontSizeValue()
updateOffsetXValue()
updateOffsetYValue()
initColorPalette()
loadState()
