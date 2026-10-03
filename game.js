const $=id=>document.getElementById(id);
const base={storyVersion:10,stage:24,energy:6,food:0,seeds:6,wood:0,coins:0,trust:0,generosity:0,completed:false,character:'woman',outfit:'gardener',playerName:'',playerEmail:'',profileReady:false,narration:false,music:false,musicVolume:.16,plots:['empty','empty','empty','empty','empty','empty'],owned:['feeder'],placed:['feeder'],log:[]};
let state=load(),lineIndex=0,pendingAction=null;
const a=(label,icon,delta,result,next=null,speaker='player')=>({label,icon,delta,result,next,speaker});
const d=(speaker,text)=>({speaker,text});
const scenes=[
 {bg:'custom-garden-mobile.png',special:'plant',title:'A Garden Waiting',goal:'Tap a glowing garden bed to plant it.',npc:'miriam',dialogue:[d('miriam','This land remembers every kindness. Put what you have been given into the soil.'),d('player','Then let’s begin with the first seed.')],actions:[
  a('Plant carefully','🌱',{energy:-1,seeds:-1,generosity:1},'I kneel, open the soil, and plant the first seed.'),
  a('Ask Miriam to help','🤝',{trust:1},'Will you show me how this soil should be tended?'),
  a('Water the bed','💧',{energy:-1},'I prepare the dry earth before planting.'),
  a('Clear the stones','🪨',{energy:-1,wood:1},'I clear the hard ground and make room for roots.')
 ]},
 {bg:'scene-camp-v2.png',title:'Beyond the Thorns',goal:'Learn what the trail is telling you.',npc:null,dialogue:[d('Eden’s Reach','Footprints cross the path. Wild berries grow near an occupied shelter.')],actions:[
  a('Gather berries','🫐',{food:4,energy:-1},'I gather only the ripe berries and leave plenty behind.'),
  a('Gather herbs','🌿',{energy:-1,trust:1},'These herbs may be useful to someone.',16),
  a('Study the tracks','👣',{trust:1},'Someone travels between this camp, the creek, and an old orchard.',17),
  a('Return to garden','↩',{},'I am not ready to approach the shelter yet.',18)
 ]},
 {bg:'scene-camp-v2.png',title:'A Stranger on the Trail',goal:'Answer Daniel and decide what to do.',npc:'daniel',dialogue:[
  d('daniel','Those berries yours?'),
  d('player','I don’t know. I found them by the road.'),
  d('daniel','Well, I guess that means they belong to the person that needs them the most.')
 ],actions:[
  a('Offer the berries','🫐',{food:-2,trust:4,generosity:2},'Then I think they belong to you. Would you share them with me?'),
  a('Ask his name','💬',{trust:2},'Maybe—but first, what’s your name?'),
  a('Keep the berries','🧺',{},'I may need them myself.',19),
  a('Leave the camp','↩',{},'I should keep moving. Take care.',18)
 ]},
 {bg:'scene-cottage.png',title:'A Place at the Table',goal:'Choose how to build trust.',npc:'daniel',dialogue:[
  d('daniel','Most people say they’ll come back. You actually did.'),
  d('player','I want my actions to mean more than my promises.'),
  d('daniel','You could hand me food and keep walking. Why stay?')
 ],actions:[
  a('Share the meal','🍲',{food:-1,trust:4,generosity:2},'Because you are a person, not a project. Sit with me.'),
  a('Give provisions','🧺',{food:-1,trust:2,generosity:1},'Take these for tomorrow too.'),
  a('Ask him to cook','🥣',{trust:3},'Would you help me turn this into supper?'),
  a('Ask about his work','🛠️',{trust:3,wood:1},'What kind of work did you enjoy doing?',17)
 ]},
 {bg:'scene-creek.png',title:'Living Water',goal:'Respond to Daniel’s broken cup.',npc:'daniel',dialogue:[
  d('daniel','My cup split again. I can patch most things, but this one will not hold water.'),
  d('player','We have more than one way to solve that.')
 ],actions:[
  a('Share your flask','💧',{energy:-1,trust:5,generosity:2},'Drink from mine. We can walk back together.'),
  a('Repair the cup','🛠️',{trust:1},'Let’s gather clay and fiber and mend it together.',15),
  a('Bring a new cup','🥛',{trust:3,generosity:1},'I have another cup at the cottage. It is yours.'),
  a('Point to the creek','🌊',{trust:-1},'The creek is close. You can drink there.',20)
 ]},
 {bg:'scene-camp-v2.png',title:'Shelter in the Storm',goal:'Make the night safer.',npc:'daniel',storm:true,dialogue:[
  d('daniel','That wind will pull the shelter loose before morning.'),
  d('player','Then we will not leave it for you to face alone.')
 ],actions:[
  a('Brace the shelter','🪵',{wood:-1,energy:-1,trust:4,generosity:2},'I brace the frame while Daniel ties each joint.'),
  a('Bring blankets','🧶',{trust:3,generosity:1},'I bring dry blankets and help secure the tarp.'),
  a('Offer the cottage','🏡',{trust:5,generosity:2},'Come stay at the cottage tonight. You are welcome.'),
  a('Gather branches','🌿',{energy:-1},'We need better braces before the storm worsens.',17)
 ]},
 {bg:'scene-fire.png',pose:'seated',title:'What the Orchard Lost',goal:'Stay present with Daniel’s grief.',npc:'daniel',dialogue:[
  d('daniel','I cared for that orchard once. After my wife died, grief became anger. Drink made it quiet—until it took nearly everything.'),
  d('player','I cannot change what happened. But I can listen, and I can stay.')
 ],actions:[
  a('Listen in silence','🕯️',{trust:5},'I stay quiet until Daniel is ready to continue.'),
  a('Ask about his wife','💬',{trust:4},'Tell me something you loved about her.'),
  a('Share your pain','❤',{trust:3},'I know what it is to need grace after pain changes you.'),
  a('Offer quick advice','📋',{trust:-1},'You need to forget the past and make better choices.',21)
 ]},
 {bg:'scene-fire.png',pose:'seated',title:'A Life Still Valuable',goal:'Recognize the gift that remains.',npc:'daniel',dialogue:[
  d('daniel','I used to carve birds for the orchard gate. My wife said they made the place feel watched over.'),
  d('player','Your hands still know how to make something beautiful.')
 ],actions:[
  a('Ask him to teach','🐦',{trust:4,wood:1},'Will you teach me to carve one?'),
  a('Request a gate bird','🚪',{trust:4},'Our garden gate needs one of your birds.'),
  a('Find carving wood','🪵',{energy:-1,wood:2,trust:3},'I find a clean piece of fallen applewood.'),
  a('Invite him to garden','🌱',{trust:3},'Your skill belongs in the garden too.')
 ]},
 {bg:'scene-harvest-v2.png',title:'The Measure of Enough',goal:'Choose what abundance is for.',npc:'miriam',dialogue:[
  d('miriam','Keep enough to remain strong. Then decide what your abundance can restore.'),
  d('player','Enough for me can also become enough for someone else.')
 ],actions:[
  a('Community table','🍽️',{food:-1,seeds:2,generosity:4,trust:2},'I set places for anyone who is hungry and save two seeds for tomorrow.'),
  a('Stock the orchard','🌱',{seeds:3,generosity:3,trust:4},'I sort three good seeds and load the tools for Daniel’s orchard.'),
  a('Household baskets','🧺',{food:3,seeds:2},'I keep enough for the household, save two seeds, and share the surplus.'),
  a('Keep everything','🔒',{food:5,seeds:2},'I store the harvest, including two seeds for another season.',22)
 ]},
 {bg:'scene-fire.png',pose:'seated',title:'Why Did You Return?',goal:'Point Daniel toward Jesus with honesty.',npc:'daniel',dialogue:[
  d('daniel','You kept coming back when I had nothing to offer. Why?'),
  d('player','Because Jesus did not abandon me—and because you are worth knowing.')
 ],actions:[
  a('Explain the Gospel','✝️',{trust:5},'Jesus died and rose to reconcile us to God. Grace is received through repentance and faith, not earned.'),
  a('Share testimony','❤',{trust:4},'I know what it is to be met by Jesus when I could not repair myself.'),
  a('Offer to pray','🙏',{trust:4},'If you want, I will sit with you while you pray.'),
  a('Welcome questions','💬',{trust:4},'Ask anything. I will not pretend to know what I do not know.',23)
 ]},
 {bg:'scene-orchard-ruin.png',title:'Coming Home',goal:'Walk through the orchard gate together.',npc:'daniel',dialogue:[
  d('daniel','I thought I had to clean everything up before I could come home.'),
  d('player','Come to Jesus as you are. He is the One who saves.')
 ],actions:[
  a('Open the gate','🚪',{trust:3},'I open the orchard gate and wait beside Daniel.'),
  a('Walk beside him','🚶',{trust:4},'You do not have to cross this ground alone.'),
  a('Let Daniel lead','🤝',{trust:4},'This is your story, Daniel. I will follow your pace.'),
  a('Pause and pray','🙏',{trust:3},'Jesus, guide every step we take here.')
 ]},
 {bg:'scene-orchard-ruin.png',title:'A Prayer in the Orchard',goal:'Give Daniel room to respond.',npc:'daniel',dialogue:[
  d('daniel','Daniel prays…')
 ],actions:[
  a('Wait beside him','☀',{trust:3},'I remain beside Daniel without interrupting.'),
  a('Pray silently','🙏',{trust:3},'Jesus, let Daniel know Your mercy is real.'),
  a('Give him space','🕊️',{trust:2},'I step back but do not leave.'),
  a('Open the gate','🚪',{trust:3},'I open the gate and wait for Daniel to rise.')
 ]},
 {bg:'scene-orchard-ruin.png',title:'Clear What Has Fallen',goal:'Let restoration become faithful work.',npc:'daniel',dialogue:[
  d('daniel','Faith has not erased every hardship. But I am not walking into tomorrow alone.'),
  d('player','Then we begin with the next faithful task.')
 ],actions:[
  a('Clear fallen limbs','🪵',{energy:-1,wood:2,trust:2},'We open the main path together.'),
  a('Clear irrigation','💧',{energy:-1,trust:3},'Water moves through the old channel again.'),
  a('Repair the gate','🚪',{wood:-1,trust:3},'Daniel hangs a newly carved bird over the gate.'),
  a('Invite neighbors','🤝',{trust:4,generosity:2},'The garden community arrives with tools and food.')
 ]},
 {bg:'scene-orchard-ruin.png',title:'Plant for Tomorrow',goal:'Plant something that outlives the moment.',npc:'daniel',dialogue:[
  d('daniel','This soil can carry life again.'),
  d('player','And the harvest can become grace for someone we have not met yet.')
 ],actions:[
  a('Plant apple trees','🌳',{seeds:-1,energy:-1,trust:3},'We plant a new row of apple trees.'),
  a('Plant path berries','🫐',{seeds:-1,generosity:2},'We plant berries where travelers can reach them.'),
  a('Plant shade trees','🌿',{seeds:-1,generosity:2},'We plant shade for people who will need rest.'),
  a('Community garden','🌱',{seeds:-1,trust:2,generosity:3},'We reserve a bed for anyone in need.')
 ]},
 {bg:'scene-orchard-restored.png',title:'Freely Give',goal:'Welcome the next traveler.',npc:'daniel',dialogue:[
  d('Eden’s Reach','A hungry traveler appears at the restored gate.'),
  d('daniel','There’s room at the table.'),
  d('player','What was freely given to us, we can freely give.')
 ],actions:[
  a('Open the table','🍞',{generosity:4},'Come in. There is enough, and you are welcome.'),
  a('Offer road food','🍎',{generosity:3},'Take what you need, and rest before you continue.'),
  a('Invite them to stay','🏡',{trust:3,generosity:3},'You do not have to eat alone tonight.'),
  a('Ask their name','💬',{trust:4},'Before anything else—what is your name?')
 ]},
 {bg:'scene-creek.png',title:'Clay and Reed',goal:'Gather sound materials for Daniel’s cup.',npc:'daniel',dialogue:[d('daniel','Clay can seal the split, but it needs clean fiber and time near the fire.')],actions:[
  a('Clay and reeds','🟤',{energy:-1,trust:4},'I gather clean clay and strong reed fiber.',5),
  a('Wet sand','🏖️',{energy:-1},'The sand crumbles. We learn what will not hold.',15),
  a('Tree bark','🌳',{wood:1},'The bark bends, but it cannot seal the crack.',15),
  a('Share your flask','💧',{trust:4,generosity:2},'The repair can wait. Drink first.',5)
 ]},
 {bg:'scene-woodland.png',title:'Useful Things',goal:'Gather with wisdom, not greed.',npc:null,dialogue:[d('Eden’s Reach','Mint, yarrow, fallen branches, and flexible willow grow along the trail.')],actions:[
  a('Gather mint','🌿',{trust:1},'I gather mint for warm tea.',2),
  a('Take fallen branches','🪵',{wood:2,energy:-1},'I take sound wood already on the ground.',2),
  a('Gather everything','🧺',{energy:-1},'I take too much, then return what I cannot use.',2),
  a('Leave it untouched','🍃',{},'I leave the plants and continue openly down the path.',2)
 ]},
 {bg:'scene-woodland.png',title:'Signs of a Neighbor',goal:'Notice Daniel’s skill and history.',npc:'daniel',dialogue:[d('daniel','I repaired irrigation, carved gate birds, and kept every orchard tool sharp.')],actions:[
  a('Gather shelter braces','🪵',{wood:2,trust:3},'Let’s choose strong fallen branches together.',5),
  a('Ask about orchard','🌳',{trust:3},'What happened to the orchard you cared for?',6),
  a('Sharpen garden tools','🛠️',{trust:3},'Your skills still matter. Will you teach me?',4),
  a('Plan irrigation','💧',{trust:4},'Show me how water should move through the orchard.',4)
 ]},
 {bg:'custom-garden-mobile.png',title:'Courage Is a Choice',goal:'Decide how to return.',npc:'miriam',dialogue:[d('miriam','You do not need perfect words. You only need to see the person before you.')],actions:[
  a('Bring berries','🫐',{food:3},'I will return with something to share.',2),
  a('Bring water','💧',{trust:1},'I will bring water and introduce myself.',2),
  a('Ask Miriam along','🤝',{trust:1},'Walk with me until I reach the camp.',2),
  a('Pray, then return','🙏',{generosity:1},'Jesus, help me approach with humility and love.',2)
 ]},
 {bg:'scene-woodland.png',title:'Enough for Two',goal:'Find a wiser response to scarcity.',npc:null,dialogue:[d('Eden’s Reach','Hunger makes every choice feel smaller. The forest still offers several paths.')],actions:[
  a('Forage more berries','🫐',{energy:-1,food:3,trust:3},'I gather enough for both of us.',3),
  a('Bring garden food','🥕',{food:2,trust:3},'I harvest one row and return.',3),
  a('Split what remains','🍞',{food:-1,trust:4,generosity:2},'Half is still a gift.',3),
  a('Ask Miriam for help','🤝',{trust:2,generosity:1},'We prepare a simple meal together.',3)
 ]},
 {bg:'scene-creek.png',title:'More Than Water',goal:'Repair the distance your answer created.',npc:'daniel',dialogue:[d('daniel','I know where the creek is. I was asking whether I had to go alone.'),d('player','You’re right. I answered the problem and missed the person.')],actions:[
  a('Walk together','🚶',{energy:-1,trust:4},'I’ll carry the water. Let’s go together.',5),
  a('Share your flask','💧',{trust:4,generosity:2},'Drink first, and forgive my thoughtlessness.',5),
  a('Repair the cup','🛠️',{trust:2},'Stay with me. We can repair it together.',15),
  a('Invite him home','🏡',{trust:3},'Come to the cottage. There is water and a seat.',5)
 ]},
 {bg:'scene-fire.png',pose:'seated',title:'Listen Before Answering',goal:'Trade advice for presence.',npc:'daniel',dialogue:[d('daniel','I already know what I should have done. I needed someone willing to hear what happened.'),d('player','You’re right. I’m listening now.')],actions:[
  a('Let silence remain','🕯️',{trust:4},'I do not rush to fill the silence.',7),
  a('Ask him to continue','💬',{trust:4},'What happened after you left the orchard?',7),
  a('Apologize','🤝',{trust:3},'I’m sorry I tried to fix your grief with a sentence.',7),
  a('Stay by the fire','🔥',{trust:3},'I stay until the fire burns low.',7)
 ]},
 {bg:'custom-garden-mobile.png',title:'The Locked Storehouse',goal:'Face the fear beneath keeping everything.',npc:'miriam',dialogue:[d('miriam','The harvest is safe, but your heart is restless. What are you afraid will happen if you give?'),d('player','I’m afraid there will not be enough when my own need comes.')],actions:[
  a('Open one basket','🧺',{food:-1,generosity:2},'I begin with one basket and discover I still have enough.',9),
  a('Share with Daniel','🍎',{food:-1,trust:4,generosity:2},'I take a full basket to Daniel.',9),
  a('Save seed, share food','🌱',{food:-1,seeds:1,generosity:3},'I keep seed for tomorrow and share food for today.',9),
  a('Ask God for trust','🙏',{generosity:2},'God, teach me to receive and give without fear.',9)
 ]},
 {bg:'scene-fire.png',pose:'seated',title:'Questions Beside the Fire',goal:'Make room for honest questions.',npc:'daniel',dialogue:[d('daniel','Would God still want me after everything I have done?'),d('player','Jesus came for sinners, not people pretending they never needed mercy.')],actions:[
  a('Explain forgiveness','✝️',{trust:4},'In Christ, forgiveness is a gift—not a reward for becoming respectable first.',10),
  a('Tell of lost sheep','🐑',{trust:4},'Jesus described a shepherd who goes after the one who is lost.',10),
  a('Share your doubt','❤',{trust:3},'I have asked whether grace could reach me too. Jesus met me there.',10),
  a('Sit with question','🕯️',{trust:4},'God is not frightened by an honest question.',10)
 ]},
 {bg:'scene-overgrown-garden.png',title:'Something Forgotten',goal:'Explore the abandoned cabin and garden.',npc:null,dialogue:[
  d('Eden’s Reach','A weathered cabin appears beyond the old gate. Brush has swallowed the path and every garden bed.'),
  d('player','Oh, what have we here? This place still has good bones.')
 ],actions:[
  a('Inspect the cabin','🏚️',{},'The roof is sound, but vines cover the door.',25),
  a('Check the garden','🌿',{},'Six beds are hidden beneath weeds and thorny brush.',25),
  a('Look down the well','💧',{},'The well still holds clear water.',25),
  a('Open the old gate','🚪',{},'The hinges resist, then open onto the overgrown path.',25)
 ]},
 {bg:'scene-overgrown-garden.png',title:'Clear the Way',goal:'Turn the overgrowth into useful supplies.',npc:null,dialogue:[
  d('player','If I clear this carefully, some of these branches can still be useful.')
 ],actions:[
  a('Cut fallen branches','🪵',{energy:-1,wood:4},'I clear the path and save four strong pieces of wood.',0),
  a('Pull thorny brush','🌿',{energy:-1,wood:3},'I pull the thorny brush and bundle three usable branches.',0),
  a('Clear around cabin','🏚️',{energy:-1,wood:3},'I free the cabin door and stack three dry limbs.',0),
  a('Open the garden beds','🛠️',{energy:-2,wood:5},'I uncover all six beds and salvage five straight branches.',0)
 ]}
];
// Fixed camera anchors keep every character on the same human-scale depth lane.
// Heights are based on the walkable foreground, not on the image filename alone.
const sceneLayouts={
 'scene-camp-v2.png':{pLeft:34,pBottom:3,pHeight:43,nRight:8,nBottom:4,nHeight:41},
 'scene-cottage.png':{pLeft:34,pBottom:3,pHeight:46,nRight:7,nBottom:4,nHeight:44},
 'scene-creek.png':{pLeft:31,pBottom:3,pHeight:44,nRight:8,nBottom:4,nHeight:41},
 'scene-fire.png':{pLeft:25,pBottom:31,pHeight:32,nRight:8,nBottom:31,nHeight:32},
 'scene-harvest-v2.png':{pLeft:34,pBottom:4,pHeight:45,nRight:7,nBottom:6,nHeight:42},
 'scene-orchard-ruin.png':{pLeft:35,pBottom:3,pHeight:43,nRight:8,nBottom:6,nHeight:39},
 'scene-orchard-restored.png':{pLeft:34,pBottom:3,pHeight:43,nRight:8,nBottom:6,nHeight:39},
 'scene-woodland.png':{pLeft:34,pBottom:3,pHeight:43,nRight:8,nBottom:6,nHeight:39},
 'scene-overgrown-garden.png':{pLeft:35,pBottom:3,pHeight:43,nRight:8,nBottom:6,nHeight:39},
 'custom-garden-mobile.png':{pLeft:32,pBottom:25,pHeight:24,nRight:18,nBottom:30,nHeight:22}
};
function layoutFor(s){return sceneLayouts[s.bg]||{pLeft:34,pBottom:4,pHeight:43,nRight:8,nBottom:6,nHeight:40}}
function load(){try{const old=JSON.parse(localStorage.getItem('gardenOfGraceSave')||'{}');if(old.storyVersion===9){const migrated={...base,...old,storyVersion:base.storyVersion,plots:old.plots||[...base.plots],owned:old.owned||old.placed||[...base.owned],placed:old.placed||[...base.placed]};if(migrated.stage===13&&migrated.seeds<1)migrated.seeds=2;return migrated}if(old.storyVersion!==base.storyVersion)return{...base,character:old.character||base.character,outfit:old.outfit||base.outfit,playerName:old.playerName||'',playerEmail:old.playerEmail||'',profileReady:!!old.profileReady,owned:old.owned||old.placed||[...base.owned],placed:old.placed||[...base.placed]};return{...base,...old,plots:old.plots||[...base.plots],owned:old.owned||old.placed||[...base.owned],placed:old.placed||[...base.placed]}}catch{return{...base}}}
function save(){localStorage.setItem('gardenOfGraceSave',JSON.stringify(state))}
function apply(delta){Object.entries(delta).forEach(([k,v])=>state[k]=Math.max(0,(state[k]||0)+v))}
function avatarFile(pose){if(pose==='seated')return state.character==='man'?'avatar-man-seated.png':'avatar-gardener-seated.png';if(state.character==='man')return'avatar-man.png';return{gardener:'avatar-gardener.png',apron:'avatar-apron.png',blue:'avatar-blue-dress.png'}[state.outfit]||'avatar-gardener.png'}
function speakerName(s){if(s==='player')return state.playerName||'You';if(s==='daniel')return'Daniel';if(s==='miriam')return'Miriam';return s}
function progressFor(i){if(i===24)return 1;if(i===25)return 4;return i<15?Math.round(5+(i+1)/15*95):({15:32,16:12,17:30,18:14,19:22,20:31,21:47,22:60,23:70}[i]||10)}
function render(){const index=Math.min(state.stage,scenes.length-1),s=scenes[index],layout=layoutFor(s);lineIndex=0;pendingAction=null;$('plotGrid').innerHTML='';renderDecor();$('sceneBackground').src='assets/'+s.bg;$('sceneBackground').style.filter=s.storm?'brightness(.58) saturate(.75)':'none';const world=document.querySelector('.world');world.classList.add('scene-play');world.dataset.scene=String(index);world.dataset.pose=s.pose||'standing';world.style.setProperty('--player-left',layout.pLeft+'%');world.style.setProperty('--player-bottom',layout.pBottom+'%');world.style.setProperty('--player-height',layout.pHeight+'%');world.style.setProperty('--npc-right',layout.nRight+'%');world.style.setProperty('--npc-bottom',layout.nBottom+'%');world.style.setProperty('--npc-height',layout.nHeight+'%');$('playerAvatar').src='assets/'+avatarFile(s.pose);$('npcAvatar').classList.toggle('hidden',!s.npc);if(s.npc){$('npcAvatar').src='assets/npc-'+s.npc+(s.pose==='seated'&&s.npc==='daniel'?'-seated':'')+'.png';$('npcAvatar').alt=speakerName(s.npc)}$('questTitle').textContent=s.title;$('questText').textContent=s.goal;$('progressBar').style.width=progressFor(index)+'%';['energy','food','seeds','wood','coins'].forEach(k=>$(k).textContent=state[k]);showDialogue()}
function renderDecor(){$('placedDecor').innerHTML=state.placed.map(n=>`<img class="decor ${n}" src="assets/decor-${n}.png" alt="">`).join('')}
function showDialogue(){const s=scenes[state.stage],l=s.dialogue[lineIndex];$('hotspots').innerHTML='';if(lineIndex===0)showQuestTitle();if(!l){renderActions();return}const speaker=speakerName(l.speaker);$('bubbleSpeaker').textContent=speaker;$('bubbleText').textContent=l.text;$('speechBubble').querySelector('small').textContent=lineIndex<s.dialogue.length-1?'tap to continue the conversation':'tap to reveal your choices';speakLine(l.speaker,l.text)}
function advanceBubble(){if(pendingAction){finishAction();return}const s=scenes[state.stage];if(lineIndex<s.dialogue.length){lineIndex++;showDialogue()}}
function renderActions(){const s=scenes[Math.min(state.stage,scenes.length-1)];$('bubbleSpeaker').textContent='Your choice';$('bubbleText').textContent=s.special==='plant'?'Choose a garden bed and plant one seed.':'What will you do?';$('speechBubble').querySelector('small').textContent=s.special==='plant'?'tap a glowing bed':'choose one action below';$('hotspots').innerHTML='';$('hotspots').classList.toggle('action-tray',s.special!=='plant');if(s.special==='plant'){renderPlantBeds();return}s.actions.forEach(action=>{const b=document.createElement('button');b.className='hotspot target';b.innerHTML=`<span class="action-icon">${action.icon}</span><span>${action.label}</span>`;b.onclick=()=>doAction(action);$('hotspots').appendChild(b)})}
function renderPlantBeds(){$('plotGrid').innerHTML=state.plots.map((p,i)=>`<button class="plot ${p==='planted'?'planted':'target'}" onclick="plantBed(${i})" aria-label="${p==='planted'?'Planted bed':'Plant this bed'}"><small>${p==='planted'?'Planted':'Plant 1 seed'}</small></button>`).join('')}
function plantBed(i){if(state.plots[i]==='planted')return;if(state.seeds<1){$('bubbleSpeaker').textContent='Inventory';$('bubbleText').textContent='You need one seed to plant this bed.';$('speechBubble').querySelector('small').textContent='replay the chapter to restore the seed supply';showChat();return}state.seeds--;state.plots[i]='planted';const planted=state.plots.filter(p=>p==='planted').length;$('seeds').textContent=state.seeds;renderPlantBeds();$('bubbleSpeaker').textContent=state.playerName||'You';if(planted===state.plots.length){pendingAction={next:null};$('bubbleText').textContent='All six beds are planted. The garden is ready to grow.';$('speechBubble').querySelector('small').textContent='tap to continue'}else{pendingAction=null;$('bubbleText').textContent=`The seed is tucked into the earth. ${planted} of 6 beds are planted.`;$('speechBubble').querySelector('small').textContent='choose the next glowing bed'}showChat();save()}
function doAction(action){const missing=Object.entries(action.delta).filter(([k,v])=>v<0&&(state[k]||0)<-v);if(missing.length){pendingAction={blocked:true};$('bubbleSpeaker').textContent='Inventory';$('bubbleText').textContent='You need '+missing.map(([k,v])=>`${-v} more ${k}`).join(' and ')+' for that choice.';$('speechBubble').querySelector('small').textContent='tap to choose another action';$('hotspots').innerHTML='';return}apply(action.delta);state.log.push(action.result);pendingAction=action;$('bubbleSpeaker').textContent=action.speaker==='player'?(state.playerName||'You'):speakerName(action.speaker);$('bubbleText').textContent=action.result;$('speechBubble').querySelector('small').textContent='tap to continue when you are ready';$('hotspots').innerHTML='';save()}
function finishAction(){const action=pendingAction;pendingAction=null;if(action.blocked){renderActions();return}if(state.stage===14&&!action.next){state.completed=true;save();showEnding();return}state.stage=action.next??state.stage+1;save();render()}
function openModal(html){$('modalContent').innerHTML=html;if(!$('modal').open)$('modal').showModal()}function closeModal(){$('modal').close()}
function showEnding(){openModal(`<h2>The Hidden Orchard</h2><p>Daniel’s story is complete. The restored orchard remains open.</p><div class="verse">“Freely you received, freely give.”<br><small>Matthew 10:8</small></div><button class="buy" onclick="previewPurchase()">Unlock Clara’s Story — $1.99</button><button onclick="replayDaniel()">Replay Daniel’s Story</button><button onclick="closeModal()">Return to the orchard</button>`)}
function previewPurchase(){openModal('<h2>Coming after testing</h2><p>Clara’s chapter and checkout remain disabled while we test Daniel’s interactive story.</p><button onclick="closeModal()">Return</button>')}
const decorNames=['feeder','lanterns','flowerbox','bench','fountain','scarecrow'];
const decorPrices={feeder:0,lanterns:3,flowerbox:4,bench:5,fountain:8,scarecrow:6};
function pretty(n){return({feeder:'Sparrow Feeder',lanterns:'Orchard Lanterns',flowerbox:'Flower Box',bench:'Garden Bench',fountain:'Stone Fountain',scarecrow:'Patchwork Scarecrow'})[n]}
function showStore(){const cards=decorNames.map(n=>{const owned=state.owned.includes(n);return`<button class="decor-choice ${state.placed.includes(n)?'selected':''}" onclick="${owned?`toggleDecor('${n}')`:`buyDecor('${n}')`}"><img src="assets/decor-${n}.png" alt=""><small>${pretty(n)} · ${owned?(state.placed.includes(n)?'Placed':'Owned'):`${decorPrices[n]} coins`}</small></button>`}).join('');openModal(`<h2>Garden Store</h2><p><b>🪙 ${state.coins} coins</b> · Earn coins by selling spare resources.</p><div class="store-grid"><button onclick="sellResource('food')">Sell 1 food · +1 coin</button><button onclick="sellResource('seeds')">Sell 1 seed · +1 coin</button><button onclick="sellResource('wood')">Sell 1 wood · +1 coin</button></div><h3>Earnable garden items</h3><div class="decor-list">${cards}</div><h3>Optional paid cosmetics</h3><div class="store-grid"><button class="buy" onclick="previewPaid('Golden Garden Outfit — $0.99')">Golden Outfit · $0.99</button><button class="buy" onclick="previewPaid('Dove Gate Set — $0.99')">Dove Gate Set · $0.99</button></div><button onclick="closeModal()">Done</button>`)}
function sellResource(k){if((state[k]||0)<1)return storeNotice('You do not have any spare '+k+' to sell.');state[k]--;state.coins++;save();showStore()}
function buyDecor(n){const price=decorPrices[n];if(state.coins<price)return storeNotice('You need '+(price-state.coins)+' more coins for '+pretty(n)+'.');state.coins-=price;state.owned.push(n);state.placed.push(n);save();showStore()}
function toggleDecor(n){if(!state.owned.includes(n))return;state.placed=state.placed.includes(n)?state.placed.filter(x=>x!==n):[...state.placed,n];save();renderDecor();showStore()}
function storeNotice(message){openModal(`<h2>Garden Store</h2><p>${message}</p><button onclick="showStore()">Back to store</button>`)}
function previewPaid(item){openModal(`<h2>${item}</h2><p>This paid cosmetic is displayed for testing. Real checkout will be connected when the game is packaged for the app stores.</p><button onclick="showStore()">Back to store</button>`)}
function showWardrobe(){const list=state.character==='man'?[['man','Everyday Gardener','avatar-man.png']]:[['gardener','Everyday Gardener','avatar-gardener.png'],['apron','Harvest Apron','avatar-apron.png'],['blue','Bluebell Dress','avatar-blue-dress.png']];const outfits=list.map(([id,name,img])=>`<button class="closet-card ${state.outfit===id?'selected':''}" onclick="wear('${id}')"><img src="assets/${img}" alt="${name}"><b>${name}</b></button>`).join('');openModal(`<h2>${state.playerName||'Your'}’s Wardrobe</h2><p>Choose what your gardener wears in every scene.</p><div class="closet-grid">${outfits}</div><button onclick="closeModal()">Return</button>`)}
function wear(id){state.outfit=id;save();$('playerAvatar').src='assets/'+avatarFile(scenes[state.stage]?.pose);showWardrobe()}
function showJournal(){openModal(`<h2>Garden Journal</h2><p><b>Daniel’s trust:</b> ${state.trust} &nbsp; <b>Generosity:</b> ${state.generosity}</p><ul>${state.log.slice(-7).map(x=>`<li>${x}</li>`).join('')||'<li>Your story has just begun.</li>'}</ul><button onclick="closeModal()">Return</button>`)}
function showMenu(){openModal(`<h2>Garden of Grace</h2><p>${state.playerName||'Your gardener'} is at “${scenes[state.stage].title}.”</p><button onclick="closeModal()">Continue</button><button onclick="replayDaniel()">Replay Daniel’s Story</button><button onclick="showTitle()">Title Screen</button>`)}
function replayDaniel(){Object.assign(state,{storyVersion:base.storyVersion,stage:24,completed:false,energy:6,food:0,seeds:6,wood:0,coins:0,trust:0,generosity:0,plots:[...base.plots],log:[]});save();closeModal();$('openingScreen').classList.add('hidden');render()}
function showTitle(){closeModal();populateOpening();$('openingScreen').classList.remove('hidden')}
function populateOpening(){$('playerName').value=state.playerName||'';$('playerEmail').value=state.playerEmail||'';document.querySelectorAll('.character-card').forEach(b=>b.classList.toggle('selected',b.dataset.character===(state.character||'woman')));$('continueGame').hidden=!state.profileReady;$('startGame').textContent=state.profileReady?'Start Over With This Gardener':'Begin a New Story'}
function startProfile(){const name=$('playerName').value.trim(),email=$('playerEmail').value.trim();if(!name)return $('playerName').focus();const selected=document.querySelector('.character-card.selected')?.dataset.character||'woman';state={...base,character:selected,playerName:name,playerEmail:email,profileReady:true,outfit:selected==='man'?'man':'gardener',plots:[...base.plots],placed:[...base.placed]};save();$('openingScreen').classList.add('hidden');render()}
let questTimer=null;
function showQuestTitle(){clearTimeout(questTimer);$('questCard').classList.remove('collapsed');$('questTab').classList.add('hidden');questTimer=setTimeout(collapseQuest,5200)}
function collapseQuest(){$('questCard').classList.add('collapsed');$('questTab').classList.remove('hidden')}
let audioCtx=null,musicMaster=null,musicTimer=null;
function duckMusic(level){if(musicMaster&&audioCtx)musicMaster.gain.setTargetAtTime((state.musicVolume||.16)*level,audioCtx.currentTime,.2)}
function voiceFor(role,voices){const english=voices.filter(v=>/^en[-_]/i.test(v.lang));const natural=v=>/natural|neural|enhanced|premium|google/i.test(v.name);const male=v=>/daniel|david|mark|aaron|guy|male|james|george|matthew|ryan/i.test(v.name);const female=v=>/miriam|samantha|zira|susan|aria|jenny|female|karen|victoria|moira/i.test(v.name);const pool=english.length?english:voices;if(role==='daniel'||(role==='player'&&state.character==='man'))return pool.find(v=>male(v)&&natural(v))||pool.find(male)||pool.find(natural)||pool[0]||null;if(role==='miriam'||(role==='player'&&state.character==='woman'))return pool.find(v=>female(v)&&natural(v))||pool.find(female)||pool.find(natural)||pool[0]||null;return pool.find(v=>natural(v)&&!male(v)&&!female(v))||pool.find(natural)||pool[0]||null}
function spokenText(role,text){if(role==='Eden’s Reach')return text;const name=speakerName(role);if(/^Daniel prays/i.test(text))return'Daniel prays.';return`${name} says, ${text}`}
function speakLine(role,text){if(!state.narration||!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(spokenText(role,text));u.rate=1;u.pitch=role==='daniel'||(role==='player'&&state.character==='man')?.9:role==='miriam'||(role==='player'&&state.character==='woman')?1.08:1;u.voice=voiceFor(role,window.speechSynthesis.getVoices());u.onstart=()=>duckMusic(.16);u.onend=()=>duckMusic(1);u.onerror=()=>duckMusic(1);window.speechSynthesis.speak(u)}
function playString(freq,at,duration,level,type='triangle'){const o=audioCtx.createOscillator(),g=audioCtx.createGain(),f=audioCtx.createBiquadFilter();o.type=type;o.frequency.value=freq;f.type='lowpass';f.frequency.value=2200;g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(level,at+.035);g.gain.exponentialRampToValueAtTime(.001,at+duration);o.connect(f).connect(g).connect(musicMaster);o.start(at);o.stop(at+duration+.03)}
function scheduleCanon(){if(!audioCtx||audioCtx.state==='closed')return;const beat=60/96,eighth=beat/2,chordTime=beat*2,start=audioCtx.currentTime+.08;const harmony=[{bass:146.83,notes:[293.66,369.99,440]},{bass:110,notes:[277.18,329.63,440]},{bass:123.47,notes:[293.66,369.99,493.88]},{bass:92.5,notes:[277.18,369.99,440]},{bass:98,notes:[293.66,392,493.88]},{bass:146.83,notes:[293.66,369.99,440]},{bass:98,notes:[293.66,392,493.88]},{bass:110,notes:[277.18,329.63,440]}];harmony.forEach((chord,i)=>{const at=start+i*chordTime;playString(chord.bass,at,chordTime*.96,.07,'triangle');[0,1,2,1].forEach((n,j)=>playString(chord.notes[n],at+j*eighth,eighth*.92,.042,'sine'))})}
function startMusic(){stopMusic();const AudioEngine=window.AudioContext||window.webkitAudioContext;if(!AudioEngine)return;audioCtx=new AudioEngine();musicMaster=audioCtx.createGain();musicMaster.gain.value=state.musicVolume||.16;musicMaster.connect(audioCtx.destination);const loopMs=10000;scheduleCanon();musicTimer=setInterval(scheduleCanon,loopMs)}
function stopMusic(){clearInterval(musicTimer);musicTimer=null;if(audioCtx){audioCtx.close();audioCtx=null;musicMaster=null}}
function updateAudioStatus(){const active=state.narration||state.music;$('soundPrompt').classList.toggle('hidden',active);$('audioStatus').classList.toggle('hidden',!active);$('audioStatus').textContent=[state.music?'♫ Music':'',state.narration?'Narrator':''].filter(Boolean).join(' · ')}
function currentVoiceRole(){const s=scenes[Math.min(state.stage,scenes.length-1)],line=s.dialogue[lineIndex];return line?.speaker||'Eden’s Reach'}
function enableSound(){state.narration=true;state.music=true;state.musicVolume=Math.max(.28,state.musicVolume||0);save();startMusic();speakLine(currentVoiceRole(),$('bubbleText').textContent);updateAudioStatus()}
function toggleNarration(){state.narration=!state.narration;save();if(state.narration)speakLine(currentVoiceRole(),$('bubbleText').textContent);else if('speechSynthesis'in window)window.speechSynthesis.cancel();updateAudioStatus();showAudio()}
function toggleMusic(){state.music=!state.music;save();state.music?startMusic():stopMusic();updateAudioStatus();showAudio()}
function setMusicVolume(value){state.musicVolume=Number(value);save();if(musicMaster&&audioCtx)musicMaster.gain.setTargetAtTime(state.musicVolume,audioCtx.currentTime,.1);$('musicLevel').textContent=Math.round(state.musicVolume*100)+'%'}
function showAudio(){openModal(`<h2>Story Audio</h2><p>Dialogue uses separate male, female, and narrator voices when your device provides them. The brighter string score follows the public-domain Canon progression at a natural walking tempo.</p><button class="${state.narration?'buy':''}" onclick="toggleNarration()">Character voices: ${state.narration?'On':'Off'}</button><button class="${state.music?'buy':''}" onclick="toggleMusic()">Background strings: ${state.music?'On':'Off'}</button><label class="audio-range">Music volume <b id="musicLevel">${Math.round((state.musicVolume||.16)*100)}%</b><input type="range" min="0.05" max="0.35" step="0.01" value="${state.musicVolume||.16}" oninput="setMusicVolume(this.value)"></label><button onclick="closeModal()">Done</button>`)}
function hideChat(){$('speechBubble').classList.add('is-hidden');$('chatReopen').classList.remove('hidden')}
function showChat(){$('speechBubble').classList.remove('is-hidden');$('chatReopen').classList.add('hidden')}
let bubbleTouchX=null;
document.querySelectorAll('.character-card').forEach(b=>b.onclick=()=>{document.querySelectorAll('.character-card').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')});
$('startGame').onclick=startProfile;$('continueGame').onclick=()=>{$('openingScreen').classList.add('hidden');render()};$('gardenButton').onclick=()=>showGarden();$('storyButton').onclick=advanceBubble;$('journalButton').onclick=showJournal;$('storeButton').onclick=showStore;$('homeButton').onclick=showMenu;$('speechBubble').onclick=advanceBubble;$('speechBubble').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();advanceBubble()}};$('bubbleClose').onclick=e=>{e.stopPropagation();hideChat()};$('chatReopen').onclick=showChat;$('hotspots').addEventListener('click',showChat,true);$('speechBubble').addEventListener('touchstart',e=>{bubbleTouchX=e.changedTouches[0].clientX},{passive:true});$('speechBubble').addEventListener('touchend',e=>{if(bubbleTouchX!==null&&Math.abs(e.changedTouches[0].clientX-bubbleTouchX)>55)hideChat();bubbleTouchX=null},{passive:true});$('modal').addEventListener('click',e=>{if(e.target===$('modal'))closeModal()});
$('audioButton').onclick=showAudio;$('soundPrompt').onclick=enableSound;$('questTab').onclick=showQuestTitle;$('questCard').onclick=collapseQuest;document.addEventListener('pointerdown',()=>{if(state.music&&!audioCtx)startMusic()},{once:true});
populateOpening();$('openingScreen').classList.toggle('hidden',state.profileReady);render();
updateAudioStatus();

// Garden 2.0: a repeatable, device-local farming loop alongside Daniel's chapter.
const crops={carrot:{name:'Carrots',icon:'🥕',turns:2,yield:2},berry:{name:'Berries',icon:'🫐',turns:3,yield:3},wheat:{name:'Wheat',icon:'🌾',turns:4,yield:4}};
const requests=[
 {name:'Miriam’s shared table',need:4,wood:0,reward:3,copy:'Bring four portions of food for the neighbors gathering at the table.'},
 {name:'Daniel’s gate repair',need:2,wood:2,reward:4,copy:'Bring two portions of food and two pieces of wood. Daniel will help repair the gate.'},
 {name:'Travelers on the path',need:6,wood:0,reward:5,copy:'Prepare six portions for the next group of travelers.'}
];
function ensureGarden(){if(!Array.isArray(state.farmPlots)||state.farmPlots.length!==6)state.farmPlots=Array.from({length:6},()=>null);if(!Number.isInteger(state.gardenDay))state.gardenDay=1;if(!Number.isInteger(state.requestIndex))state.requestIndex=0;if(!Number.isInteger(state.requestsDone))state.requestsDone=0}
function gardenStatus(message){const n=$('gardenNotice');if(n)n.textContent=message}
function showGarden(message=''){ensureGarden();const req=requests[state.requestIndex%requests.length];const beds=state.farmPlots.map((plot,i)=>{const c=plot&&crops[plot.crop],ready=plot&&plot.growth>=c.turns;return `<button class="farm-bed ${ready?'ripe':''}" onclick="tendBed(${i})" aria-label="Bed ${i+1}: ${plot?`${c.name}, ${ready?'ready to harvest':`${c.turns-plot.growth} garden turns left`}`:'empty, plant a crop'}"><span>${plot?c.icon:'＋'}</span><b>Bed ${i+1}</b><small>${plot?ready?'Harvest':`${c.name} · ${c.turns-plot.growth} turns`:'Plant'}</small></button>`}).join('');openModal(`<div class="garden-panel"><p class="eyebrow">DAY ${state.gardenDay} · GARDEN</p><h2>Tend your garden</h2><div class="garden-stats"><span>☀ ${state.energy}/6 energy</span><span>🌱 ${state.seeds} seeds</span><span>🧺 ${state.food} food</span><span>🪵 ${state.wood} wood</span><span>🪙 ${state.coins} coins</span></div><div class="farm-grid">${beds}</div><p id="gardenNotice" role="status">${message||'Tap an empty bed to plant, or a ripe bed to harvest.'}</p><div class="garden-actions"><button onclick="gardenRest()">🌙 Rest until morning</button><button onclick="gardenForage()">🌲 Gather supplies · 1 energy</button><button onclick="showWardrobe()">👕 Wardrobe</button></div><section class="neighbor-request"><p class="eyebrow">NEIGHBOR REQUEST ${state.requestsDone+1}</p><h3>${req.name}</h3><p>${req.copy}</p><button class="buy" onclick="fulfillRequest()">Share ${req.need} food${req.wood?` + ${req.wood} wood`:''} · earn ${req.reward} coins</button></section><button onclick="closeModal()">Back to the story</button></div>`)}
function tendBed(i){ensureGarden();const plot=state.farmPlots[i];if(plot){const crop=crops[plot.crop];if(plot.growth<crop.turns)return gardenStatus(`${crop.name} need ${crop.turns-plot.growth} more garden turns. Planting, harvesting, gathering, or resting advances the garden.`);state.food+=crop.yield;state.seeds++;state.farmPlots[i]=null;advanceGarden();save();renderResources();return showGarden(`Harvested ${crop.yield} food and saved 1 seed.`)}if(state.seeds<1)return gardenStatus('You need a seed. Gather supplies to find one.');if(state.energy<1)return gardenStatus('Rest until morning to regain energy.');openModal(`<h2>Plant bed ${i+1}</h2><p>Each crop costs 1 seed and 1 energy. Garden turns pass as you tend other beds, gather, harvest, or rest.</p><div class="crop-choices">${Object.entries(crops).map(([id,c])=>`<button onclick="plantCrop(${i},'${id}')"><span>${c.icon}</span><b>${c.name}</b><small>${c.turns} turns · ${c.yield} food</small></button>`).join('')}</div><button onclick="showGarden()">Back to garden</button>`)}
function plantCrop(i,id){ensureGarden();if(!crops[id]||state.farmPlots[i]||state.seeds<1||state.energy<1)return showGarden('Unable to plant this bed right now.');state.seeds--;state.energy--;advanceGarden();state.farmPlots[i]={crop:id,growth:0};save();renderResources();showGarden(`${crops[id].name} planted in bed ${i+1}.`)}
function advanceGarden(){state.farmPlots.forEach(p=>{if(p)p.growth++})}
function gardenRest(){ensureGarden();state.gardenDay++;state.energy=6;advanceGarden();save();renderResources();showGarden('A new morning arrives. Your beds have grown and your energy is restored.')}
function gardenForage(){ensureGarden();if(state.energy<1)return gardenStatus('Rest until morning before gathering.');state.energy--;state.wood++;state.seeds++;advanceGarden();save();renderResources();showGarden('You found 1 fallen branch and 1 seed along the path.')}
function fulfillRequest(){ensureGarden();const req=requests[state.requestIndex%requests.length];if(state.food<req.need||state.wood<req.wood)return gardenStatus(`Still needed: ${Math.max(0,req.need-state.food)} food and ${Math.max(0,req.wood-state.wood)} wood.`);state.food-=req.need;state.wood-=req.wood;state.coins+=req.reward;state.generosity++;state.requestsDone++;state.requestIndex++;state.log.push(`Shared supplies for ${req.name}.`);save();renderResources();showGarden(`You helped with ${req.name} and earned ${req.reward} coins for garden decorations.`)}
function renderResources(){['energy','food','seeds','wood','coins'].forEach(k=>$(k).textContent=state[k])}
