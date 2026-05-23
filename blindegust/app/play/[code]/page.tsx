'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Game={id:string;code:string;status:string;current_round:number}
type Player={id:string;name:string;score:number;game_id:string}
type Round={id:string;number:number;status:string;correct_answer:string}
type Guess={id:string;answer:string;points:number;player_id:string;round_id:string}

export default function Play({params}:{params:{code:string}}){
 const [game,setGame]=useState<Game|null>(null),[player,setPlayer]=useState<Player|null>(null),[name,setName]=useState(''),[round,setRound]=useState<Round|null>(null),[answer,setAnswer]=useState(''),[guess,setGuess]=useState<Guess|null>(null),[msg,setMsg]=useState('')
 async function load(){const {data:g}=await supabase.from('games').select('*').eq('code',params.code.toUpperCase()).maybeSingle(); setGame(g); if(!g)return; const saved=localStorage.getItem('blindegustPlayer-'+g.id); if(saved){const {data:p}=await supabase.from('players').select('*').eq('id',saved).maybeSingle(); setPlayer(p)} if(g.current_round){const {data:r}=await supabase.from('rounds').select('*').eq('game_id',g.id).eq('number',g.current_round).maybeSingle(); setRound(r); if(r&&saved){const {data:gu}=await supabase.from('guesses').select('*').eq('round_id',r.id).eq('player_id',saved).maybeSingle(); setGuess(gu); setAnswer(gu?.answer||'')}}}
 useEffect(()=>{load(); const ch=supabase.channel('play-'+params.code).on('postgres_changes',{event:'*',schema:'public'},load).subscribe(); return()=>{supabase.removeChannel(ch)}},[])
 async function join(){if(!game||!name.trim())return; const {data,error}=await supabase.from('players').insert({game_id:game.id,name:name.trim()}).select().single(); if(error)return alert(error.message); localStorage.setItem('blindegustPlayer-'+game.id,data.id); setPlayer(data)}
 async function send(){if(!round||!player||!answer.trim())return; const {data,error}=await supabase.from('guesses').upsert({round_id:round.id,player_id:player.id,answer:answer.trim()},{onConflict:'round_id,player_id'}).select().single(); if(error)return alert(error.message); setGuess(data); setMsg('Réponse envoyée ✅')}
 if(game===null)return <main className="page"><div className="card center"><h1>Chargement…</h1></div></main>
 if(!game)return <main className="page"><div className="card center"><h1>Partie introuvable</h1></div></main>
 if(!player)return <main className="page"><section className="shell center"><h1 className="brand">Blindegust</h1><div className="card"><p className="tag">Entre ton prénom pour rejoindre</p><input value={name} onChange={e=>setName(e.target.value)} placeholder="Ton prénom"/><br/><br/><button className="btn pink" onClick={join}>Rejoindre</button></div></section></main>
 return <main className="page"><section className="shell"><h1 className="brand">Blindegust</h1><div className="card center"><p className="tag">Salut {player.name} 🥤</p><p className="score">Score : {player.score} pts</p></div>{!round?<div className="card center"><h2>En attente du premier round…</h2></div>:<div className="card"><h2>Round {round.number}</h2>{round.status==='open'?<><label>Quelle boisson penses-tu avoir goûtée ?</label><input value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Ex : Sprite, Dr Pepper, Orangina…"/><br/><br/><button className="btn green" onClick={send}>Valider ma réponse</button>{msg&&<p className="notice">{msg}</p>}</>:<><p className="notice">Les réponses sont fermées.</p>{guess&&<p>Ta réponse : <b>{guess.answer}</b></p>}{round.status==='revealed'||round.status==='results'?<p>Bonne réponse : <b>{round.correct_answer}</b></p>:null}{round.status==='results'&&guess?<p className="score">+{guess.points} pts</p>:null}</>}</div>}</section></main>
}
