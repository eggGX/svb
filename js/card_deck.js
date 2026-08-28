(function(){
  const API = {};
  API.cardImage = card => `cardData/${card.pack}/${card.image}`;
  API.loadCards = async function(){
    const packs = await fetch('cardData/packs.json').then(r=>{if(!r.ok) throw new Error('packs.json'); return r.json();});
    const packResults = await Promise.all(packs.map(async id => {
      try{
        const [meta,cards]=await Promise.all([
          fetch(`cardData/${id}/pack.json`).then(r=>r.ok?r.json():({id,name:id})),
          fetch(`cardData/${id}/cards.json`).then(r=>r.ok?r.json():[])
        ]);
        const packName=meta.name||id;
        return {id,packName,cards:cards.map(c=>({...c,pack:id,packName}))};
      }catch(e){
        console.warn('card pack load failed',id,e);
        return {id,packName:id,cards:[]};
      }
    }));
    const all=[]; const packNames={};
    for(const result of packResults){
      packNames[result.id]=result.packName;
      all.push(...result.cards);
    }
    return {cards:all, packNames};
  };
  API.renderDeckPreview = function(deck, target, cardsById, compact=false){
    target.innerHTML='';
    if(deck && deck.deckType==='builder' && Array.isArray(deck.cards) && deck.cards.length){
      const box=document.createElement('div'); box.className='built-deck-preview'+(compact?' compact':'');
      deck.cards.forEach(x=>{
        const card=cardsById && cardsById[x.cardId];
        if(!card) return;
        const item=document.createElement('div'); item.className='built-deck-card';
        item.title=`${card.name} ×${x.count}`;
        item.innerHTML=`<img loading="lazy" src="${API.cardImage(card)}" alt="${card.name||''}"><span>${x.count}</span>`;
        const previewImg=item.querySelector('img');
        if(previewImg) previewImg.addEventListener('error',()=>{ previewImg.style.display='none'; });
        box.appendChild(item);
      });
      target.appendChild(box); return true;
    }
    if(deck && deck.url){ const img=document.createElement('img'); img.loading='lazy'; img.src=deck.url; img.alt=deck.name||'デッキ画像'; target.appendChild(img); return true; }
    return false;
  };

  if (location.pathname.endsWith('/deck_builder.html') || location.pathname.endsWith('deck_builder.html')) {
    const style = document.createElement('style');
    style.textContent = `
      .card-grid { align-items: start !important; }
      .card-item { border-radius:4px!important;overflow:hidden!important;padding:6px!important;background:#09102a!important;display:flex!important;flex-direction:column!important;justify-content:flex-start!important;height:auto!important;min-height:0!important; }
      .card-item img { width:100%!important;height:auto!important;max-height:none!important;aspect-ratio:auto!important;object-fit:contain!important;object-position:center!important;border-radius:0!important;display:block!important;background:#05091a!important; }
      .card-item .name { width:100%!important;box-sizing:border-box!important;min-height:0!important;padding:7px 4px 4px!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;color:#fff!important;opacity:1!important; }
      .card-item.selected .name,.card-item.maxed .name { color:#fff!important;opacity:1!important;visibility:visible!important; }
      .card-item .count { border-radius:4px!important; }
    `;
    document.head.appendChild(style);
  }

  // 戦績入力画面：デッキ作成方式のデッキだけマリガン研究を利用可能にする。
  if (location.pathname.endsWith('/battle.html') || location.pathname.endsWith('battle.html')) {
    window.addEventListener('DOMContentLoaded',()=>{
      const d=JSON.parse(localStorage.getItem('shadowverseData')||'{}');
      const deck=(d.decks||[]).find(x=>x.id===d.selectedDeckId&&x.environmentId===d.currentEnvironmentId);
      const anchor=document.querySelector('button[onclick="goToResult()"]');
      if(!anchor) return;
      const btn=document.createElement('button');
      btn.type='button'; btn.textContent='マリガン研究'; btn.style.marginLeft='10px';
      const enabled=deck&&deck.deckType==='builder'&&Array.isArray(deck.cards)&&deck.cards.length>0;
      btn.disabled=!enabled;
      btn.title=enabled?'選択中のデッキのマリガンを研究します':'デッキ作成機能で登録したデッキのみ利用できます';
      btn.addEventListener('click',()=>{ if(enabled) location.href='mulligan.html'; });
      anchor.insertAdjacentElement('afterend',btn);
    });
  }

  window.CardDeckAPI=API;
})();
