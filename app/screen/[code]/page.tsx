'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Game={id:string;code:string;current_round:number}
type Player={id:string;name:string;score:number}
type Round={id:string;number:number;status:string;correct_answer:string}
type Guess={id:string;answer:string;points:number;player_id:string}

export default function Screen({params}:{params:{code:string}}){
 const [game,setGame]=useState<Game|null>(null),[players,setPlayers]=useState<Player[]>([]),[round,setRound]=useState<Round|null>(null),[guesses,setGuesses]=useState<Guess[]>([])
 async function load(){const {data:g}=await supabase.from('games').select('*').eq('code',params.code.toUpperCase()).maybeSingle(); setGame(g); if(!g)return; const {data:p}=await supabase.from('players').select('*').eq('game_id',g.id).order('score',{ascending:false}); setPlayers(p||[]); if(g.current_round){const {data:r}=await supabase.from('rounds').select('*').eq('game_id',g.id).eq('number',g.current_round).maybeSingle(); setRound(r); if(r){const {data:gs}=await supabase.from('guesses').select('*').eq('round_id',r.id); setGuesses(gs||[])}}}
 useEffect(()=>{load(); const ch=supabase.channel('screen-'+params.code).on('postgres_changes',{event:'*',schema:'public'},load).subscribe(); return()=>{supabase.removeChannel(ch)}},[])
 const byPlayer=useMemo(()=>Object.fromEntries(players.map(p=>[p.id,p])),[players])
 if(!game)return <main className="page"><div className="card center"><h1>Blindegust</h1><p>Partie introuvable ou chargement…</p></div></main>
 return <main className="page"><section className="shell center"><div className="bubble">🥤🫧🍋🍒</div><h1 className="brand">Blindegust</h1>{!round?<div className="card"><p className="tag">Code pour rejoindre</p><div className="bigcode">{game.code}</div></div>:<><div className="card"><p className="tag">Round {round.number}</p>{round.status==='open'&&<><h2>Goûtez… puis répondez sur votre téléphone</h2><div className="bigcode">{game.code}</div></>}{round.status==='closed'&&<h2>Réponses verrouillées 🔒</h2>}{(round.status==='revealed'||round.status==='results')&&<><p>La bonne réponse était…</p><div className="answer">{round.correct_answer}</div></>}</div>{round.status==='results'&&<div className="card"><h2>Réponses du round</h2><table className="table"><tbody>{guesses.map(g=><tr key={g.id}><td>{byPlayer[g.player_id]?.name}</td><td>“{g.answer}”</td><td className="score">+{g.points}</td></tr>)}</tbody></table></div>}</>}<div className="card"><h2>🏆 Classement</h2><table className="table"><tbody>{players.map((p,i)=><tr key={p.id}><td>{i+1}. {p.name}</td><td className="score">{p.score} pts</td></tr>)}</tbody></table></div></section></main>
}
