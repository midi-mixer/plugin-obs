import{C as e,a as t}from"./vendor.158e7dc3.js";!function(e=".",t="__import__"){try{self[t]=new Function("u","return import(u)")}catch(n){const s=new URL(e,location),o=e=>{URL.revokeObjectURL(e.src),e.remove()};self[t]=e=>new Promise(((n,a)=>{const c=new URL(e,s);if(self[t].moduleMap[c])return n(self[t].moduleMap[c]);const r=new Blob([`import * as m from '${c}';`,`${t}.moduleMap['${c}']=m;`],{type:"text/javascript"}),m=Object.assign(document.createElement("script"),{type:"module",src:URL.createObjectURL(r),onerror(){a(new Error(`Failed to import: ${e}`)),o(m)},onload(){n(self[t].moduleMap[c]),o(m)}});document.head.appendChild(m)})),self[t].moduleMap={}}}("assets/");const n=new e;let s={},o={};const a=$MM.getSettings();let c="";const r=async()=>{var e;null==(e=(await n.send("GetSourcesList")).sources)||e.forEach((async e=>{const[o,a]=await Promise.all([n.send("GetVolume",{source:e.name}).then((e=>e.volume)),n.send("GetMute",{source:e.name}).then((e=>e.muted))]),c=new t.Assignment(e.name,{name:e.name,muted:a,volume:o});c.on("volumeChanged",(t=>{n.send("SetVolume",{source:e.name,volume:t})})),c.on("mutePressed",(()=>{n.send("SetMute",{source:e.name,mute:!c.muted})})),s[e.name]=c}))},m=async()=>{const e=await n.send("GetSceneList");c=e["current-scene"],e.scenes.forEach((e=>{const s=new t.ButtonType(e.name,{name:`OBS: Switch to "${e.name}" scene`,active:e.name===c});s.on("pressed",(()=>{n.send("SetCurrentScene",{"scene-name":e.name}),s.active=!0})),o[e.name]=s}))},u=async()=>{n.disconnect(),s={},o={};try{$MM.setSettingsStatus("status","Connecting..."),await(async()=>{var e,t;const s=await a;return n.connect({address:null!=(e=s.address)?e:"localhost:4444",password:null!=(t=s.password)?t:""})})(),n.on("SourceVolumeChanged",(e=>{const t=s[e.sourceName];t&&(t.volume=e.volume)})),n.on("SourceMuteStateChanged",(e=>{const t=s[e.sourceName];t&&(t.muted=e.muted)})),n.on("SwitchScenes",(e=>{c=e["scene-name"],Object.values(o).forEach((t=>{t.active=e["scene-name"]===t.id}))})),await Promise.all([r(),m()]),$MM.setSettingsStatus("status","Connected")}catch(e){console.warn("OBS error:",e),$MM.setSettingsStatus("status",e.description||e.message||e)}};$MM.onSettingsButtonPress("reconnect",u),u();
//# sourceMappingURL=index.fd690b7f.js.map