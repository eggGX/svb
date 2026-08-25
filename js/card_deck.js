(function(){
  const API = {};
  API.cardImage = card => `cardData/${card.pack}/${card.image}`;
  API.loadCards = async function(){
    const packs = await fetch('cardData/packs.json').then(r=>{if(!r.ok) throw new Error('packs.json'); return r.json();});
    const all=[]; const packNames={};
    for(const id of packs){
      try{
        const [meta,cards]=await Promise.all([
          fetch(`cardData/${id}/pack.json`).then(r=>r.ok?r.json():({id,name:id})),
          fetch(`cardData/${id}/cards.json`).then(r=>r.ok?r.json():[])
        ]);
        packNames[id]=meta.name||id;
        for(const c of cards) all.push({...c,pack:id,packName:packNames[id]});
      }catch(e){ console.warn('card pack load failed',id,e); }
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
        item.innerHTML=`<img src="${API.cardImage(card)}" alt="${card.name||''}"><span>${x.count}</span>`;
        const previewImg=item.querySelector('img');
        if(previewImg) previewImg.addEventListener('error',()=>{ previewImg.style.display='none'; });
        box.appendChild(item);
      });
      target.appendChild(box); return true;
    }
    if(deck && deck.url){ const img=document.createElement('img'); img.src=deck.url; img.alt=deck.name||'デッキ画像'; target.appendChild(img); return true; }
    return false;
  };

  // デッキ作成画面ではカードを四角いタイルで、画像全体が切れずに見えるようにする。
  if (location.pathname.endsWith('/deck_builder.html') || location.pathname.endsWith('deck_builder.html')) {
    const style = document.createElement('style');
    style.textContent = `
      .card-grid {
        align-items: start !important;
      }
      .card-item {
        border-radius: 4px !important;
        overflow: hidden !important;
        padding: 6px !important;
        background: #09102a !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: flex-start !important;
        height: auto !important;
        min-height: 0 !important;
      }
      .card-item img {
        width: 100% !important;
        height: auto !important;
        max-height: none !important;
        aspect-ratio: auto !important;
        object-fit: contain !important;
        object-position: center !important;
        border-radius: 0 !important;
        display: block !important;
        background: #05091a !important;
      }
      .card-item .name {
        width: 100% !important;
        box-sizing: border-box !important;
        min-height: 0 !important;
        padding: 7px 4px 4px !important;
        white-space: normal !important;
        overflow: visible !important;
        text-overflow: clip !important;
      }
      .card-item .count {
        border-radius: 4px !important;
      }
    `;
    document.head.appendChild(style);
  }

  window.CardDeckAPI=API;
})();
