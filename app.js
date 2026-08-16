(() => {
  const APP_KEY = 'scorekrew:v1';
  const games = {
    flip7: { name: 'Flip 7', emoji: '🃏', className: 'card-flip7', target: 200, mode: 'high', subtitle: 'Premier à 200+', rules: 'Saisis les points de la manche. Un joueur qui saute marque 0. Un Flip 7 ajoute 15 points.' },
    skyjo: { name: 'Skyjo', emoji: '🌤️', className: 'card-skyjo', target: 100, mode: 'low', subtitle: 'Le moins de points', rules: 'Saisis les points bruts. Si le joueur qui ferme la manche n’a pas strictement le plus petit score, son score positif est doublé.' },
    nimmt: { name: '6 qui prend !', emoji: '🐂', className: 'card-nimmt', target: 66, mode: 'low', subtitle: 'Évite les têtes de bœuf', rules: 'Saisis les têtes de bœuf prises pendant la manche. La partie se termine après une manche lorsqu’un joueur atteint 66 points ou plus.' },
    free: { name: 'Score libre', emoji: '✍️', className: 'card-free', target: null, mode: 'high', subtitle: 'Pour tous les autres jeux', rules: 'Ajoute simplement les scores manche après manche. Tu décides quand la partie se termine.' }
  };

  const initialState = () => ({
    players: ['Adrien', 'Hugo', 'Pauline', 'Delphine'],
    history: [],
    active: null,
    screen: 'home'
  });

  let state = load();
  function load() {
    try { return { ...initialState(), ...JSON.parse(localStorage.getItem(APP_KEY) || '{}') }; }
    catch { return initialState(); }
  }
  function save() { localStorage.setItem(APP_KEY, JSON.stringify(state)); }
  function setScreen(screen) { state.screen = screen; save(); render(); }
  function esc(v='') { return String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function fmtDate(ts) { return new Intl.DateTimeFormat('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }).format(new Date(ts)); }
  function totals(active=state.active) {
    const out = Object.fromEntries(active.players.map(p => [p, 0]));
    active.rounds.forEach(r => active.players.forEach(p => out[p] += Number(r.scores[p] || 0)));
    return out;
  }
  function ranking(active=state.active) {
    const g = games[active.game]; const t = totals(active);
    return [...active.players].sort((a,b) => g.mode === 'high' ? t[b]-t[a] : t[a]-t[b]).map((p,i) => ({name:p, score:t[p], rank:i+1}));
  }
  function gameOver(active=state.active) {
    const g = games[active.game]; if (!g.target) return false;
    const values = Object.values(totals(active));
    return values.some(v => v >= g.target);
  }

  function render() {
    const root = document.getElementById('app');
    const body = state.screen === 'home' ? home() : state.screen === 'players' ? playersScreen() : state.screen === 'game' ? gameScreen() : state.screen === 'result' ? resultScreen() : historyScreen();
    root.innerHTML = `<main class="shell"><div class="topbar"><div class="brand"><div class="logo">S</div>ScoreKrew</div><button class="icon-btn" data-action="history">Historique</button></div>${body}</main>`;
    bind();
  }

  function home() {
    return `<section class="hero"><h1>Tous vos jeux.<br>Un seul compteur.</h1><p>Choisis un jeu, retrouve tes joueurs et lance une partie en quelques secondes.</p></section>
      <div class="section-title"><h2>À quoi on joue ?</h2><small>${state.history.length} partie${state.history.length>1?'s':''}</small></div>
      <div class="game-grid">${Object.entries(games).map(([id,g]) => `<button class="game-card ${g.className}" data-game="${id}"><span class="emoji">${g.emoji}</span><strong>${g.name}</strong><span>${g.subtitle}</span></button>`).join('')}</div>
      ${statsBlock()}`;
  }

  function statsBlock() {
    if (!state.history.length) return '';
    const wins = {};
    state.history.forEach(h => { if(h.winner) wins[h.winner]=(wins[h.winner]||0)+1; });
    const champ = Object.entries(wins).sort((a,b)=>b[1]-a[1])[0];
    return `<div class="section-title"><h2>Vos stats</h2></div><div class="stats-grid"><div class="stat"><b>${state.history.length}</b><span>parties</span></div><div class="stat"><b>${new Set(state.history.map(h=>h.game)).size}</b><span>jeux</span></div><div class="stat"><b>${champ?esc(champ[0]):'—'}</b><span>leader</span></div></div>`;
  }

  function playersScreen() {
    const a = state.active, g = games[a.game];
    return `<button class="back" data-action="home">← Jeux</button><h1 class="page-title">${g.emoji} ${g.name}</h1><p class="page-sub">Qui est autour de la table ? Sélectionne au moins 2 joueurs.</p>
      <div class="panel"><div class="add-player"><input id="new-player" class="field" placeholder="Ajouter un joueur" maxlength="20"><button data-action="add-player">+</button></div>
      <div class="player-chips">${state.players.map(p=>`<button class="chip ${a.players.includes(p)?'selected':''}" data-player="${esc(p)}"><span class="dot"></span>${esc(p)}</button>`).join('')}</div>
      <p class="help">Les joueurs ajoutés restent mémorisés sur cet appareil.</p></div>
      <div class="bottom"><div class="bottom-inner"><button class="primary" data-action="start" ${a.players.length<2?'disabled':''}>Lancer la partie · ${a.players.length} joueurs</button></div></div>`;
  }

  function gameScreen() {
    const a=state.active, g=games[a.game], t=totals();
    return `<button class="back" data-action="quit">← Quitter</button>
      <div class="row" style="align-items:flex-start"><div><span class="badge">${g.emoji} ${g.name}</span><h1 class="page-title">Manche ${a.rounds.length+1}</h1></div>${gameOver()?'<span class="badge warn">Fin possible</span>':''}</div>
      <div class="scoreboard">${a.players.map(p=>`<div class="score-line"><div><div class="score-name">${esc(p)}</div><div class="score-meta">${a.rounds.length} manche${a.rounds.length>1?'s':''}</div></div><div class="score-total">${t[p]}</div></div>`).join('')}</div>
      <div class="panel round-box"><h3>Points de cette manche</h3>${scoreInputs()}<p class="help">${g.rules}</p></div>
      <div class="actions"><button class="secondary" data-action="undo" ${!a.rounds.length?'disabled':''}>Annuler dernière</button><button class="secondary danger" data-action="finish">Terminer</button><button class="primary" data-action="add-round">Valider la manche</button></div>`;
  }

  function scoreInputs() {
    const a=state.active;
    return a.players.map((p,i)=>{
      let extras='';
      if(a.game==='flip7') extras=`<div class="toggles"><button class="mini-toggle" data-bust="${i}">💥 Sauté</button><button class="mini-toggle" data-flip="${i}">+15 Flip 7</button></div>`;
      if(a.game==='skyjo') extras=`<div class="toggles"><button class="mini-toggle" data-closer="${i}">🏁 A fermé</button></div>`;
      return `<div class="score-entry"><div><label>${esc(p)}</label>${extras}</div><input class="round-score" data-index="${i}" type="number" inputmode="numeric" value="0"></div>`;
    }).join('');
  }

  function resultScreen() {
    const a=state.active, g=games[a.game], list=ranking();
    const medals=['🥇','🥈','🥉'];
    return `<span class="badge">Partie terminée</span><h1 class="page-title">${esc(list[0].name)} gagne !</h1><p class="page-sub">${g.name} · ${a.rounds.length} manche${a.rounds.length>1?'s':''}</p>
      <div class="panel podium">${list.map((x,i)=>`<div class="podium-row"><div class="rank">${medals[i]||'#'+(i+1)}</div><div class="podium-name">${esc(x.name)}</div><div class="podium-score">${x.score} pts</div></div>`).join('')}</div>
      <div class="row"><button class="secondary" data-action="replay">Rejouer</button><button class="primary" data-action="done">Retour accueil</button></div>`;
  }

  function historyScreen() {
    return `<button class="back" data-action="home">← Accueil</button><h1 class="page-title">Historique</h1><p class="page-sub">Toutes les parties enregistrées sur cet appareil.</p><div class="panel">${state.history.length ? state.history.map(h=>`<div class="history-card"><div><strong>${games[h.game]?.emoji||'🎲'} ${games[h.game]?.name||h.game}</strong><span>${fmtDate(h.endedAt)} · ${h.players.length} joueurs</span></div><div style="text-align:right"><strong>🏆 ${esc(h.winner)}</strong><span>${h.rounds} manches</span></div></div>`).join('') : '<div class="empty">Aucune partie pour le moment.</div>'}</div>${state.history.length?'<button class="secondary danger" data-action="clear-history">Effacer l’historique</button>':''}`;
  }

  function bind() {
    document.querySelectorAll('[data-game]').forEach(el=>el.onclick=()=>{ state.active={game:el.dataset.game, players:[], rounds:[], startedAt:Date.now()}; setScreen('players'); });
    document.querySelectorAll('[data-player]').forEach(el=>el.onclick=()=>{ const p=el.dataset.player, arr=state.active.players; state.active.players=arr.includes(p)?arr.filter(x=>x!==p):[...arr,p]; save(); render(); });
    document.querySelector('[data-action="history"]')?.addEventListener('click',()=>setScreen('history'));
    document.querySelectorAll('[data-action="home"]').forEach(el=>el.onclick=()=>{state.active=null;setScreen('home')});
    document.querySelector('[data-action="add-player"]')?.addEventListener('click', addPlayer);
    document.getElementById('new-player')?.addEventListener('keydown',e=>{if(e.key==='Enter')addPlayer();});
    document.querySelector('[data-action="start"]')?.addEventListener('click',()=>{ if(state.active.players.length>=2) setScreen('game'); });
    document.querySelector('[data-action="quit"]')?.addEventListener('click',()=>{ if(confirm('Quitter cette partie ?')) {state.active=null;setScreen('home');} });
    document.querySelector('[data-action="undo"]')?.addEventListener('click',()=>{ state.active.rounds.pop();save();render(); });
    document.querySelector('[data-action="finish"]')?.addEventListener('click',finishGame);
    document.querySelector('[data-action="add-round"]')?.addEventListener('click',addRound);
    document.querySelector('[data-action="done"]')?.addEventListener('click',()=>{state.active=null;setScreen('home')});
    document.querySelector('[data-action="replay"]')?.addEventListener('click',()=>{ const {game,players}=state.active; state.active={game,players:[...players],rounds:[],startedAt:Date.now()}; setScreen('game'); });
    document.querySelector('[data-action="clear-history"]')?.addEventListener('click',()=>{if(confirm('Effacer tout l’historique ?')){state.history=[];save();render();}});
    document.querySelectorAll('[data-bust]').forEach(el=>el.onclick=()=>{ el.classList.toggle('active'); const idx=el.dataset.bust; const input=document.querySelector(`.round-score[data-index="${idx}"]`); if(el.classList.contains('active')) input.value=0; });
    document.querySelectorAll('[data-flip]').forEach(el=>el.onclick=()=>el.classList.toggle('active'));
    document.querySelectorAll('[data-closer]').forEach(el=>el.onclick=()=>{ document.querySelectorAll('[data-closer]').forEach(x=>x.classList.remove('active')); el.classList.add('active'); });
  }

  function addPlayer(){
    const input=document.getElementById('new-player'); if(!input)return; const name=input.value.trim(); if(!name)return;
    if(!state.players.some(p=>p.toLowerCase()===name.toLowerCase())) state.players.push(name);
    if(!state.active.players.some(p=>p.toLowerCase()===name.toLowerCase())) state.active.players.push(name);
    input.value=''; save(); render();
  }

  function addRound(){
    const a=state.active; const scores={};
    a.players.forEach((p,i)=>{ scores[p]=Number(document.querySelector(`.round-score[data-index="${i}"]`).value||0); });
    if(a.game==='flip7'){
      a.players.forEach((p,i)=>{ if(document.querySelector(`[data-bust="${i}"]`)?.classList.contains('active')) scores[p]=0; else if(document.querySelector(`[data-flip="${i}"]`)?.classList.contains('active')) scores[p]+=15; });
    }
    if(a.game==='skyjo'){
      const closerEl=document.querySelector('[data-closer].active');
      if(closerEl){ const closer=a.players[Number(closerEl.dataset.closer)]; const others=a.players.filter(p=>p!==closer).map(p=>scores[p]); const minOther=Math.min(...others); if(scores[closer]>0 && scores[closer]>=minOther) scores[closer]*=2; }
    }
    a.rounds.push({scores, at:Date.now()}); save();
    if(gameOver()) { render(); const btn=document.querySelector('[data-action="finish"]'); if(btn) btn.textContent='Voir le résultat'; }
    else render();
  }

  function finishGame(){
    if(!state.active.rounds.length && !confirm('Terminer sans aucune manche ?')) return;
    const list=ranking();
    const snapshot={ game:state.active.game, players:[...state.active.players], rounds:state.active.rounds.length, totals:totals(), winner:list[0]?.name||'', endedAt:Date.now() };
    state.history.unshift(snapshot); state.history=state.history.slice(0,100); state.screen='result'; save(); render();
  }

  if ('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  render();
})();
