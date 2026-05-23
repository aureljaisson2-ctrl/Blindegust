'use client'
import { useEffect, useMemo, useState } from 'react'
import { makeCode, makeHostKey, supabase } from '@/lib/supabase'

type Game={id:string;code:string;host_key:string;status:string;current_round:number}
type Player={id:string;name:string;score:number;game_id:string}
type Round={id:string;game_id:string;number:number;status:string;correct_answer:string}
type Guess={id:string;round_id:string;player_id:string;answer:string;points:number}

export default function Host(){
 const [game,setGame]=useState<Game|null>(null),[players,setPlayers]=useState<Player[]>([]),[round,setRound]=useState<Round|null>(null),[guesses,setGuesses]=useState<Guess[]>([]),[correct,setCorrect]=useState('')
 const origin=typeof window==='undefined'?'':window.location.origin
 const playLink=game?`${origin}/play/${game.code}`:''; const screenLink=game?`${origin}/screen/${game.code}`:''
 async function createGame(){const code=makeCode(), host_key=makeHostKey(); const {data,error}=await supabase.from('games').insert({code,host_key}).select().single(); if(error) alert(error.message); else {localStorage.setItem('blindegustHost',JSON.stringify(data)); setGame(data)}}
 async function load(g:Game){const [{data:p},{data:r}]=await Promise.all([supabase.from('players').select('*').eq('game_id',g.id).order('score',{ascending:false}),supabase.from('rounds').select('*').eq('game_id',g.id).eq('number',g.current_round).maybeSingle()]); setPlayers(p||[]); setRound(r||null); if(r){setCorrect(r.correct_answer||''); const {data:gs}=await supabase.from('guesses').select('*').eq('round_id',r.id); setGuesses(gs||[])} else setGuesses([])}
 useEffect(()=>{const saved=localStorage.getItem('blindegustHost'); if(saved) setGame(JSON.parse(saved))},[])
 useEffect(()=>{if(!game)return; load(game); const ch=supabase.channel('host-'+game.id).on('postgres_changes',{event:'*',schema:'public'},()=>load(game)).subscribe(); return()=>{supabase.removeChannel(ch)}},[game?.id, game?.current_round])
 async function nextRound(){if(!game)return; const n=game.current_round+1; const {data:r,error}=await supabase.from('rounds').insert({game_id:game.id,number:n,status:'open'}).select().single(); if(error) return alert(error.message); const {data:g}=await supabase.from('games').update({current_round:n,status:'open'}).eq('id',game.id).select().single(); setGame(g); setRound(r); setCorrect('')}
 async function closeAnswers(){if(round) await supabase.from('rounds').update({status:'closed'}).eq('id',round.id)}
 async function reveal(){if(round) await supabase.from('rounds').update({status:'revealed',correct_answer:correct}).eq('id',round.id)}
 async function showResults(){if(round) await supabase.from('rounds').update({status:'results'}).eq('id',round.id)}
 async function setPoints(guess:Guess, pts:number){await supabase.from('guesses').update({points:pts}).eq('id',guess.id); const total=guesses.filter(g=>g.player_id===guess.player_id&&g.id!==guess.id).reduce((s,g)=>s+g.points,0)+pts; await supabase.from('players').update({score:total}).eq('id',guess.player_id)}
 const byPlayer=useMemo(()=>Object.fromEntries(players.map(p=>[p.id,p])),[players])
 if(!game) return <main className="page"><section className="shell center"><h1 className="brand">Blindegust</h1><div className="card"><p className="tag">Interface maître du jeu</p><button className="btn pink" onClick={createGame}>Créer une partie</button></div></section></main>
 return <main className="page"><section className="shell"><h1 className="brand">Blindegust</h1><div className="grid"><div className="card"><p className="muted">Code joueurs</p><div className="bigcode">{game.code}</div><a className="btn blue" href={playLink} target="_blank">Ouvrir lien joueur</a> <a className="btn orange" href={screenLink} target="_blank">Écran public</a></div><div className="card"><h2>Joueurs</h2>{players.map(p=><span className="pill" key={p.id}>{p.name} · {p.score} pts</span>)}</div></div><div className="card"><h2>Round {game.current_round||'—'}</h2>{!round?<button className="btn green" onClick={nextRound}>Lancer le round 1</button>:<><p>Statut : <b>{round.status}</b></p><div className="row"><button className="btn orange" onClick={closeAnswers}>Fermer les réponses</button><button className="btn green" onClick={reveal}>Révéler la bonne réponse</button><button className="btn pink" onClick={showResults}>Afficher résultats</button><button className="btn blue" onClick={nextRound}>Round suivant</button></div><label>Bonne réponse</label><input value={correct} onChange={e=>setCorrect(e.target.value)} placeholder="Ex : Coca-Cola Cherry" /></>}</div>{round&&<div className="card"><h2>Réponses et points</h2><table className="table"><thead><tr><th>Joueur</th><th>Réponse</th><th>Points</th><th>Attribuer</th></tr></thead><tbody>{guesses.map(g=><tr key={g.id}><td>{byPlayer[g.player_id]?.name}</td><td>{g.answer}</td><td className="score">{g.points}</td><td><div className="row">{[0,1,2,3].map(n=><button className="btn light" key={n} onClick={()=>setPoints(g,n)}>{n}</button>)}</div></td></tr>)}</tbody></table></div>}</section></main>
}
