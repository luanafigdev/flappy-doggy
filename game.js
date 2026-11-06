const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = {
  x: 40,
  y: 150,
  width: 45,
  height: 45,
  vy: 0,
  frameIndex: 0,
  tick: 0,
  state: "idle"
};

let gravidade = 0.6;
let impulso = -9.5;

const obstaculos = [];
const petiscos = [];
let distanciaObstaculo = 320; 
let velocidadeObstaculo = 3.2;

let pontuacao = 0;
let totalPetiscos = 0;
let recorde = localStorage.getItem("flappyDoggyHighScore") ? parseInt(localStorage.getItem("flappyDoggyHighScore")) : 0;

let tempoGlobal = 0;
let gameStarted = false;
let gameOver = false;
let menuAtivo = true;

const botao = { x: canvas.width/2-90, y: canvas.height/2+60, width: 180, height: 48 };

const nuvens = [
  {x: 50, y:60, width:60, height:35, speed:0.2},
  {x: 200, y:110, width:80, height:45, speed:0.4},
  {x: 120, y:180, width:55, height:30, speed:0.15},
  {x: 280, y:50, width:70, height:40, speed:0.3}
];

const particulas = [];

function tocarSom(nomeArquivo) {
  try {
    let som = new Audio(nomeArquivo);
    som.play().catch(() => {});
  } catch(e) {}
}

function criarParticulas(x, y, tipo){
  let qtd = tipo === "ouro_fase" ? 3 : 8;
  for(let i=0; i<qtd; i++){
    particulas.push({
      x: x,
      y: y,
      vx: (Math.random()-0.5)*3,
      vy: (Math.random()-0.5)*3 - (tipo === "coracao" || tipo === "bolha" || tipo === "cerejeira" ? 0.8 : 0),
      alpha: 1,
      size: Math.random()*5+1.5,
      tipo: tipo
    });
  }
}

function atualizarParticulas(){
  for(let i=particulas.length-1; i>=0; i--){
    const p = particulas[i];
    p.x += p.vx; p.y += p.vy;
    p.alpha -= 0.025;
    if(p.alpha<=0) particulas.splice(i,1);
  }
}

function desenharParticulas(){
  ctx.save();
  particulas.forEach(p=>{
    if(p.tipo==="poeira") ctx.fillStyle=`rgba(244,164,96,${p.alpha})`;
    else if(p.tipo==="folha") ctx.fillStyle=`rgba(50,205,50,${p.alpha})`;
    else if(p.tipo==="coracao") ctx.fillStyle=`rgba(255,20,147,${p.alpha})`;
    else if(p.tipo==="neon") ctx.fillStyle=`rgba(0,255,255,${p.alpha})`;
    else if(p.tipo==="cristal") ctx.fillStyle=`rgba(186,85,211,${p.alpha})`;
    else if(p.tipo==="lava") ctx.fillStyle=`rgba(255,69,0,${p.alpha})`;
    else if(p.tipo==="bolha") ctx.fillStyle=`rgba(173,216,230,${p.alpha})`;
    else if(p.tipo==="cerejeira") ctx.fillStyle=`rgba(255,192,203,${p.alpha})`;
    else ctx.fillStyle=`rgba(255,215,0,${p.alpha})`;
    
    ctx.beginPath();
    if(p.tipo === "coracao") {
      ctx.font = `${p.size * 2}px Arial`; ctx.globalAlpha = p.alpha;
      ctx.fillText("❤️", p.x, p.y);
    } else if(p.tipo === "bolha") {
      ctx.strokeStyle = `rgba(255,255,255,${p.alpha})`; ctx.lineWidth = 1;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.stroke();
    } else {
      ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
    }
  });
  ctx.restore();
}

const cenarios = {
  fase1:  { nome: "1. Floresta Ensolarada 🌲", ceuCima: "#4a90e2", ceuBaixo: "#b8d5ec", chaoCima: "#5c4033", chaoBaixo: "#3d2b1f", chaoGrama: "#2e7d32", corObstaculoTopo: "#4caf50", corObstaculoBase: "#1b5e20", glow: "transparent", detalhe: "tronco" },
  fase2:  { nome: "2. Deserto do Pôr do Sol 🌵", ceuCima: "#f36a22", ceuBaixo: "#ffb74d", chaoCima: "#e2a76f", chaoBaixo: "#b87c4c", chaoGrama: "#df8c3d", corObstaculoTopo: "#8d6e63", corObstaculoBase: "#4e342e", glow: "transparent", detalhe: "cacto" },
  fase3:  { nome: "3. Noite Romântica em Paris 💖", ceuCima: "#2c1654", ceuBaixo: "#ec407a", chaoCima: "#21103b", chaoBaixo: "#140a24", chaoGrama: "#7b1fa2", corObstaculoTopo: "#ab47bc", corObstaculoBase: "#4a148c", glow: "#ff80ab", detalhe: "romantico" },
  fase4:  { nome: "4. Distrito Neon Cyberpunk 🏙️", ceuCima: "#05010d", ceuBaixo: "#1a0033", chaoCima: "#0d001a", chaoBaixo: "#05000a", chaoGrama: "#00e5ff", corObstaculoTopo: "#f50057", corObstaculoBase: "#311b92", glow: "#00e5ff", detalhe: "neon" },
  fase5:  { nome: "5. Caverna dos Cristais 💎", ceuCima: "#11001c", ceuBaixo: "#3c096c", chaoCima: "#240046", chaoBaixo: "#10002b", chaoGrama: "#7b2cbf", corObstaculoTopo: "#e0aaff", corObstaculoBase: "#5a189a", glow: "#c77dff", detalhe: "cristal" },
  fase6:  { nome: "6. Vulcão Infernal 🌋", ceuCima: "#1a0500", ceuBaixo: "#3a0f05", chaoCima: "#210500", chaoBaixo: "#0f0200", chaoGrama: "#ff3c00", corObstaculoTopo: "#ff6600", corObstaculoBase: "#3a0f05", glow: "#ff3c00", detalhe: "lava" },
  fase7:  { nome: "7. Atlântida Subaquática 🌊", ceuCima: "#03045e", ceuBaixo: "#0077b6", chaoCima: "#0096c7", chaoBaixo: "#03045e", chaoGrama: "#00b4d8", corObstaculoTopo: "#00f5d4", corObstaculoBase: "#00b4d8", glow: "#00f5d4", detalhe: "bolhas" },
  fase8:  { nome: "8. Templo Sagrado Zen ⛩️", ceuCima: "#ffe5ec", ceuBaixo: "#ffb3c6", chaoCima: "#641e16", chaoBaixo: "#4a1412", chaoGrama: "#fb6f92", corObstaculoTopo: "#d90429", corObstaculoBase: "#ef233c", glow: "transparent", detalhe: "zen" },
  fase9:  { nome: "9. Fronteira Espacial 🚀", ceuCima: "#020208", ceuBaixo: "#0d1b2a", chaoCima: "#1b263b", chaoBaixo: "#0d1b2a", chaoGrama: "#e0e1dd", corObstaculoTopo: "#37474f", corObstaculoBase: "#212121", glow: "#90caf9", detalhe: "espacial" },
  fase10: { nome: "10. El Dorado: Puro Ouro 👑", ceuCima: "#9a7800", ceuBaixo: "#ffd700", chaoCima: "#b8860b", chaoBaixo: "#553c00", chaoGrama: "#fff", corObstaculoTopo: "#fff", corObstaculoBase: "#b8860b", glow: "#fff", detalhe: "ouro" }
};

function obterCenarioAtual() {
  if (pontuacao < 5) return cenarios.fase1;
  if (pontuacao < 12) return cenarios.fase2;
  if (pontuacao < 20) return cenarios.fase3;
  if (pontuacao < 30) return cenarios.fase4;
  if (pontuacao < 42) return cenarios.fase5;
  if (pontuacao < 55) return cenarios.fase6;
  if (pontuacao < 70) return cenarios.fase7;
  if (pontuacao < 85) return cenarios.fase8;
  if (pontuacao < 100) return cenarios.fase9;
  return cenarios.fase10;
}

const chao = { x1: 0, x2: canvas.width, y: canvas.height - 30, speed: 2.2, height: 30 };

const idleFrames=[], runFrames=[], jumpFrames=[];
for(let i=1;i<=10;i++){ let img=new Image(); img.src=`idle_${i}.png`; idleFrames.push(img); }
for(let i=1;i<=8;i++){ let img=new Image(); let img2=new Image(); img.src=`run_${i}.png`; img2.src=`jump_${i}.png`; runFrames.push(img); jumpFrames.push(img2); }

function acaoPular(){
  if(menuAtivo){ menuAtivo=false; gameStarted=true; player.state="run"; }
  else if(!gameOver){ 
    player.vy=impulso; 
    tocarSom('pulo.mp3');
    player.state="jump"; 
    let cenarioAtual = obterCenarioAtual() || cenarios.fase1;
    let d = cenarioAtual.detalhe || "tronco";
    let tipoP = d==="romantico"?"coracao": d==="neon"?"neon": d==="cristal"?"cristal": d==="lava"?"lava": d==="bolhas"?"bolha": d==="zen"?"cerejeira": d==="ouro"?"ouro":"poeira";
    criarParticulas(player.x + player.width/2, player.y + player.height - 5, tipoP);
  }
}

function reiniciarJogo() {
  obstaculos.length = 0; petiscos.length = 0; particulas.length = 0;
  pontuacao = 0; totalPetiscos = 0; velocidadeObstaculo = 3.2;
  player.y = 150; player.vy = 0; player.state = "run"; 
  gameOver = false; gameStarted = true; menuAtivo = false;    
}

document.addEventListener("keydown", e=>{
  if(e.code==="Space"){ 
    e.preventDefault();
    if(gameOver) reiniciarJogo(); 
    else acaoPular();
  }
  if(e.code==="ArrowUp"){ 
    e.preventDefault(); 
    acaoPular(); 
  }
});

canvas.addEventListener("touchstart", e=>{
  e.preventDefault(); 
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const clickX = ((touch.clientX - rect.left) / rect.width) * canvas.width;
  const clickY = ((touch.clientY - rect.top) / rect.height) * canvas.height;
  if(gameOver){
    if(clickX>=botao.x && clickX<=botao.x+botao.width && clickY>=botao.y && clickY<=botao.y+botao.height){
      reiniciarJogo(); return;
    }
  }
  acaoPular();
}, {passive: false});

function criarObstaculo(){
  let altura = Math.floor(Math.random()*200)+50;
  let buraco = 170;
  let parId = Date.now();
  obstaculos.push({x:canvas.width, y:0, width:55, height:altura, pontuado:false, parId:parId, tipo:"topo"});
  obstaculos.push({x:canvas.width, y:altura+buraco, width:55, height:canvas.height-altura-buraco, pontuado:false, parId:parId, tipo:"base"});
  if(Math.random() < 0.6) { 
    petiscos.push({
      x: canvas.width + 15,
      y: altura + (buraco / 2) - 8,
      width: 24, height: 16,
      baseY: altura + (buraco / 2) - 8,
      offsetFlutuar: Math.random() * 10,
      coletado: false
    });
  }
}

function drawPlayer(){
  ctx.save();
  ctx.shadowColor="rgba(255,255,255,0.3)"; ctx.shadowBlur=8;
  let frame;
  switch(player.state){
    case "idle": frame=idleFrames[player.frameIndex % idleFrames.length]; break;
    case "run": frame=runFrames[player.frameIndex % runFrames.length]; break;
    case "jump": frame=jumpFrames[player.frameIndex % jumpFrames.length]; break;
  }
  player.tick++; if(player.tick>=5){ player.tick=0; player.frameIndex++; }
  if(frame && frame.complete && frame.naturalWidth !== 0) {
    ctx.drawImage(frame, player.x, player.y, player.width, player.height);
  } else {
    ctx.fillStyle = "#FF9800";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = "#FFF"; ctx.font = "12px Arial";
    ctx.fillText("🐶", player.x+15, player.y+25);
  }
  ctx.restore();
}

function desenharFundo(){
  let cenario = obterCenarioAtual();
  let grad = ctx.createLinearGradient(0,0,0,canvas.height);
  grad.addColorStop(0, cenario.ceuCima); grad.addColorStop(1, cenario.ceuBaixo);
  ctx.fillStyle=grad; ctx.fillRect(0,0,canvas.width,canvas.height);
  drawChao(cenario);
}

function drawNuvens(){
  let cenario = obterCenarioAtual();
  nuvens.forEach((nuvem, i)=>{
    ctx.save();
    if(cenario.detalhe === "espacial" || cenario.detalhe === "ouro") {
      let brilho = Math.abs(Math.sin((tempoGlobal / 12) + i));
      ctx.fillStyle = `rgba(255,255,255,${brilho})`;
      ctx.beginPath(); ctx.arc(nuvem.x, nuvem.y, cenario.detalhe==="ouro"? 4 : 2, 0, Math.PI*2); ctx.fill();
    } else if(cenario.detalhe === "romantico") {
      ctx.fillStyle = "rgba(255,182,193,0.5)"; ctx.font = "18px Arial";
      ctx.fillText("❤️", nuvem.x, nuvem.y);
    } else if(cenario.detalhe === "zen") {
      ctx.fillStyle = "rgba(255,192,203,0.6)"; ctx.font = "14px Arial";
      ctx.fillText("🌸", nuvem.x, nuvem.y);
    } else if(cenario.detalhe === "lava") {
      ctx.fillStyle = "rgba(255,69,0,0.15)"; ctx.beginPath();
      ctx.arc(nuvem.x, nuvem.y, 15, 0, Math.PI*2); ctx.fill();
    } else if(cenario.detalhe === "bolhas") {
      ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.beginPath();
      ctx.arc(nuvem.x, nuvem.y, 6, 0, Math.PI*2); ctx.stroke();
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.beginPath();
      ctx.ellipse(nuvem.x, nuvem.y, nuvem.width/2, nuvem.height/2, 0, 0, Math.PI*2); 
      ctx.fill();
    }
    ctx.restore();
    nuvem.x -= nuvem.speed;
    if(nuvem.x + nuvem.width < 0) nuvem.x = canvas.width + nuvem.width;
  });
}

function drawChao(cenario){
  if(!gameOver && gameStarted) {
    chao.x1 -= chao.speed; chao.x2 -= chao.speed;
    if(chao.x1 + canvas.width <= 0) chao.x1 = chao.x2 + canvas.width;
    if(chao.x2 + canvas.width <= 0) chao.x2 = chao.x1 + canvas.width;
  }
  let gradC = ctx.createLinearGradient(0,chao.y,0,canvas.height);
  gradC.addColorStop(0, cenario.chaoCima); gradC.addColorStop(1, cenario.chaoBaixo);
  ctx.fillStyle = gradC; 
  ctx.fillRect(chao.x1, chao.y, canvas.width + 2, chao.height);
  ctx.fillRect(chao.x2, chao.y, canvas.width + 2, chao.height);
  ctx.fillStyle = cenario.chaoGrama;
  ctx.fillRect(chao.x1, chao.y, canvas.width + 2, 4);
  ctx.fillRect(chao.x2, chao.y, canvas.width + 2, 4);
}

function drawPetiscos() {
  for(let i = petiscos.length - 1; i >= 0; i--) {
    let petisco = petiscos[i];
    if(!petisco.coletado && !gameOver) {
      petisco.x -= velocidadeObstaculo;
      petisco.y = petisco.baseY + Math.sin((tempoGlobal / 8) + petisco.offsetFlutuar) * 5;
      ctx.save();
      ctx.fillStyle = "#FFFFFF"; ctx.shadowColor = "#FFD700"; ctx.shadowBlur = 10;
      ctx.fillRect(petisco.x + 5, petisco.y + 4, petisco.width - 10, 8);
      ctx.beginPath();
      ctx.arc(petisco.x + 5, petisco.y + 4, 4, 0, Math.PI * 2);
      ctx.arc(petisco.x + 5, petisco.y + 12, 4, 0, Math.PI * 2);
      ctx.arc(petisco.x + petisco.width - 5, petisco.y + 4, 4, 0, Math.PI * 2);
      ctx.arc(petisco.x + petisco.width - 5, petisco.y + 12, 4, 0, Math.PI * 2);
      ctx.fill(); ctx.restore();
      if(player.x < petisco.x + petisco.width && player.x + player.width > petisco.x && player.y < petisco.y + petisco.height && player.y + player.height > petisco.y) {
        petisco.coletado = true; totalPetiscos++;
        tocarSom('moeda.mp3');
        criarParticulas(petisco.x + 10, petisco.y + 10, "ouro");
      }
    }
    if(petisco.x + petisco.width < 0) petiscos.splice(i, 1);
  }
}

function draw(){
  tempoGlobal++;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  let cenarioAtivo = obterCenarioAtual();
  if(menuAtivo){
    desenharFundo(); drawNuvens();
    ctx.save(); ctx.fillStyle="white"; ctx.textAlign="center";
    ctx.font="bold 32px Arial"; ctx.fillText("Flappy Doggy", canvas.width/2, 140);
    ctx.font="bold 15px Arial"; ctx.fillStyle="#FFD700"; ctx.fillText("🏆 Recorde: " + recorde, canvas.width/2, 190);
    ctx.fillStyle="white"; ctx.font="16px Arial"; 
    ctx.fillText("PC: [Seta Cima] Pular | [Espaço] Reiniciar", canvas.width/2, 260);
    ctx.fillText("Celular: Toque na tela para pular", canvas.width/2, 290);
    ctx.restore();
    drawPlayer(); return;
  }
  desenharFundo(); drawNuvens();
  if(!gameOver){
    player.vy+=gravidade; player.y+=player.vy;
    if(player.y+player.height>chao.y){ player.y=chao.y-player.height; player.vy=0; }
    if(player.y<0){ player.y=0; player.vy=0; }
    if(tempoGlobal % 15 === 0) {
      if(cenarioAtivo.detalhe === "lava") criarParticulas(Math.random()*canvas.width, chao.y, "lava");
      if(cenarioAtivo.detalhe === "zen") criarParticulas(Math.random()*canvas.width, 0, "cerejeira");
      if(cenarioAtivo.detalhe === "ouro") criarParticulas(Math.random()*canvas.width, Math.random()*canvas.height, "ouro_fase");
    }
  }
  drawPetiscos();
  if(!gameOver){
    for(let i = obstaculos.length - 1; i >= 0; i--) {
      let obs = obstaculos[i];
      obs.x-=velocidadeObstaculo; 
      ctx.save();
      if (cenarioAtivo.glow !== "transparent") {
        ctx.shadowColor = cenarioAtivo.glow; ctx.shadowBlur = 12;
      }
      let gradObs = ctx.createLinearGradient(obs.x, 0, obs.x + obs.width, 0);
      gradObs.addColorStop(0, cenarioAtivo.corObstaculoTopo);
      gradObs.addColorStop(1, cenarioAtivo.corObstaculoBase);
      ctx.fillStyle = gradObs;
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.restore();
      if(player.x<obs.x+obs.width && player.x+player.width>obs.x && player.y<obs.y+obs.height && player.y+player.height>obs.y){
        gameOver=true; 
        tocarSom('colisao.mp3');
        if(pontuacao > recorde) { recorde = pontuacao; localStorage.setItem("flappyDoggyHighScore", recorde); }
      }
      if(!obs.pontuado && obs.x+obs.width<player.x){
        if(!obstaculos.some(o=>o.parId===obs.parId && o.pontuado)){
          pontuacao++; 
          obstaculos.forEach(o=>{if(o.parId===obs.parId)o.pontuado=true;});
          if(pontuacao%6===0) velocidadeObstaculo+=0.3;
        }
      }
      if(obs.x + obs.width < 0) obstaculos.splice(i, 1);
    }
  }
  drawPlayer();
  ctx.save();
  ctx.fillStyle="white"; ctx.font="bold 18px Arial"; ctx.textAlign="start"; 
  ctx.fillText("✨ Pontos: "+pontuacao, 12, 30);
  ctx.fillStyle="#FFD700"; ctx.fillText("🍖 Ossos: "+totalPetiscos, 12, 55);
  ctx.restore();
  if(!gameOver){ if(obstaculos.length===0 || obstaculos[obstaculos.length - 1].x < canvas.width - distanciaObstaculo) criarObstaculo(); }
  if(gameOver){
    ctx.save();
    ctx.fillStyle="rgba(0,0,0,0.85)"; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="white"; ctx.textAlign="center";
    ctx.font="bold 36px Arial"; ctx.fillText("Fim de Jogo!", canvas.width/2, canvas.height/2-60);
    ctx.fillStyle="#FF4081"; 
    ctx.fillRect(botao.x, botao.y, botao.width, botao.height);
    ctx.fillStyle="white"; ctx.font="bold 16px Arial"; 
    ctx.fillText("JOGAR NOVAMENTE?", canvas.width/2, botao.y + 32);
    ctx.restore();
  }
  atualizarParticulas();
  desenharParticulas();
}

function gameLoop(){ draw(); requestAnimationFrame(gameLoop); }
gameLoop();