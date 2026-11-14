import { useCallback, useEffect, useRef, useState } from 'react';

import MainMenu from './components/MainMenu.jsx';
import StoryScreen from './components/StoryScreen.jsx';
import GameShell from './components/GameShell.jsx';
import InvestigationScene from './components/InvestigationScene.jsx';
import ObjectivesPanel from './components/ObjectivesPanel.jsx';
import EvidenceInventory from './components/EvidenceInventory.jsx';
import EvidenceBoard from './components/EvidenceBoard.jsx';
import KnowledgeChallenge, { ChallengeList } from './components/KnowledgeChallenge.jsx';
import CaseResolution from './components/CaseResolution.jsx';
import ResultScreen from './components/ResultScreen.jsx';
import CaseArchive from './components/CaseArchive.jsx';
import SettingsScreen from './components/SettingsScreen.jsx';
import ProgressPanel from './components/ProgressPanel.jsx';
import { ConfirmDialog, Modal, Toasts, Icon } from './components/ui.jsx';
import RenntzyCompanion from './components/ai/RenntzyCompanion.jsx';
import useAiStatus from './components/ai/useAiStatus.js';
import { ai as aiApi, buildProgress, friendlyError } from './services/aiClient.js';
import { normalizeLearner } from './data/curriculum.js';

import { CASES, getScript } from './data/cases/index.js';
import { INTRO_SCRIPT } from './data/intro.js';
import * as Story from './engines/StoryEngine.js';
import * as Inv from './engines/InvestigationEngine.js';
import * as Ev from './engines/EvidenceEngine.js';
import * as Puzzle from './engines/PuzzleEngine.js';
import * as Progress from './engines/ProgressEngine.js';

/* ------------------------------------------------------------------ */
/* Fungsi murni untuk alur cerita (state -> state)                      */
/* ------------------------------------------------------------------ */

function currentScript(save) {
  if (!save.story) return null;
  const caseId = save.current ? save.current.caseId : 'MYS-001';
  return getScript(caseId, save.story.scriptId, INTRO_SCRIPT);
}

function beginStory(save, scriptId) {
  const caseId = save.current ? save.current.caseId : 'MYS-001';
  const script = getScript(caseId, scriptId, INTRO_SCRIPT);
  const flags = save.current ? save.current.flags : {};
  const r = Story.resolveNode(script, script.start, flags);
  return { ...save, story: { scriptId, nodeId: r.id, visited: [r.id] } };
}

function applyEffects(save, effects) {
  let s = save;
  const collected = [];
  for (const e of effects) {
    if (e.type === 'flag' && s.current) {
      s = { ...s, current: { ...s.current, flags: { ...s.current.flags, [e.key]: e.value } } };
    }
    if (e.type === 'collect' && s.current && !s.current.collected.includes(e.id)) {
      s = { ...s, current: Ev.collectEvidence(s.current, e.id) };
      collected.push(e.id);
    }
  }
  return { save: s, collected };
}

function advanceStory(save, choiceIndex, patch) {
  const script = currentScript(save);
  const node = Story.getNode(script, save.story.nodeId);
  let s = patch ? patch(save) : save;
  const eff = applyEffects(s, Story.nodeEffects(node, choiceIndex));
  s = eff.save;
  const nextId = Story.nextNodeId(node, choiceIndex);
  const flags = s.current ? s.current.flags : {};
  const r = nextId ? Story.resolveNode(script, nextId, flags) : { id: null, node: null };
  if (!r.node) return { save: s, ended: script, collected: eff.collected };
  return {
    save: { ...s, story: { ...s.story, nodeId: r.id, visited: [...s.story.visited, r.id] } },
    ended: null,
    collected: eff.collected,
  };
}

function finishStory(save, script) {
  const base = { ...save, story: null };
  switch (script.onEnd) {
    case 'introDone': {
      const cases = { ...base.profile.cases };
      if (!cases['MYS-001']) cases['MYS-001'] = { status: 'available' };
      return { save: { ...base, introDone: true, profile: { ...base.profile, cases } }, screen: 'archive', highlight: 'MYS-001' };
    }
    case 'toResult':
      return { save: { ...base, current: null }, screen: 'result', resultId: base.current.caseId };
    default: {
      const cur = base.current && base.current.phase === 'briefing' ? { ...base.current, phase: 'investigate' } : base.current;
      return { save: { ...base, current: cur }, screen: 'game' };
    }
  }
}

function sumBest(profile, skipId) {
  return Object.entries(profile.cases).reduce((n, [id, c]) => (id === skipId ? n : n + (c.bestPoints || 0)), 0);
}

/* ------------------------------------------------------------------ */

export default function App() {
  const [save, setSave] = useState(() => Progress.loadSave());
  const saveRef = useRef(save);
  const [screen, setScreen] = useState('menu');
  const [modal, setModal] = useState(null); // 'pause' | 'profile' | null
  const [confirm, setConfirm] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [highlight, setHighlight] = useState(null);
  const [resultId, setResultId] = useState(null);
  const [settingsBack, setSettingsBack] = useState('menu');
  const toastId = useRef(0);
  const aiStatus = useAiStatus();
  const learner = normalizeLearner(save.settings.learner);
  const [astraBusy, setAstraBusy] = useState(null); // { id, error? }

  const commit = useCallback((next) => {
    saveRef.current = next;
    setSave(next);
  }, []);

  useEffect(() => {
    Progress.persistSave(save);
  }, [save]);

  // Pengaturan tampilan
  useEffect(() => {
    document.documentElement.dataset.text = save.settings.textSize;
    document.documentElement.dataset.motion = save.settings.motion;
  }, [save.settings.textSize, save.settings.motion]);

  const reduceMotion =
    save.settings.motion === 'reduce' ||
    (save.settings.motion === 'auto' && typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------------- toast ---------------- */
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const pushToast = useCallback((t) => {
    const id = ++toastId.current;
    setToasts((cur) => [...cur.slice(-2), { ...t, id }]);
    setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== id)), t.action ? 9000 : 5500);
  }, []);

  /* ---------------- turunan ---------------- */
  const cs = save.current;
  const caseDef = cs ? CASES[cs.caseId] : null;
  const points = Progress.totalKnowledge(save, CASES);
  const rank = Progress.rankFor(points);
  const canContinue = Progress.hasProgress(save);

  /* ---------------- kasus: pembaruan state ---------------- */
  const updateCase = (fn) => {
    const prev = saveRef.current;
    if (!prev.current) return;
    const def = CASES[prev.current.caseId];
    let next = fn(prev.current);
    const fresh = Inv.newChallengeIds(def, next, next.seenChallenges || []);
    if (fresh.length) {
      next = { ...next, seenChallenges: [...(next.seenChallenges || []), ...fresh] };
      fresh.forEach((id) => {
        const ch = Puzzle.getChallenge(def, id);
        pushToast({ title: 'Tantangan baru tersedia', text: ch.title, icon: 'Brain', action: { label: 'Buka', run: () => openChallenge(id) } });
      });
    }
    commit({ ...prev, current: next });
  };

  const openView = (view) => {
    const prev = saveRef.current.current;
    if (!prev) return;
    const def = CASES[prev.caseId];
    if (view === 'resolution' && !Inv.readyForResolution(def, prev)) {
      pushToast({ title: 'Kesimpulan belum siap', text: `Masih kurang: ${Inv.missingForResolution(def, prev).join('; ')}.`, icon: 'Lock', tone: 'warn' });
      return;
    }
    updateCase((c) => ({ ...c, view }));
  };

  const openChallenge = (id) => updateCase((c) => ({ ...c, view: 'challenge', openChallenge: id }));

  const actions = {
    openView,
    setLocation: (id) => updateCase((c) => ({ ...c, location: id })),
    inspect: (objId) => {
      const found = Inv.findObject(CASES[saveRef.current.current.caseId], objId);
      if (!found) return;
      const def = CASES[saveRef.current.current.caseId];
      const { revealed } = Inv.inspectObject(def, saveRef.current.current, found.obj);
      updateCase((c) => Inv.inspectObject(def, c, found.obj).cs);
      if (revealed.length && found.obj.revealText) pushToast({ title: 'Penemuan baru', text: found.obj.revealText, icon: 'Sparkles' });
    },
    collect: (evId) => {
      const def = CASES[saveRef.current.current.caseId];
      updateCase((c) => Ev.collectEvidence(c, evId));
      const e = def.evidence[evId];
      pushToast({ title: `Bukti terkumpul: ${e.code}`, text: e.title, icon: 'Pin', action: { label: 'Jurnal', run: () => openView('journal') } });
    },
    startInterview: (scriptId) => {
      commit(beginStory(saveRef.current, scriptId));
      setScreen('story');
    },
    setNote: (id, text) => updateCase((c) => ({ ...c, notes: { ...c.notes, [id]: text } })),
    recordResult: (chId, idx, res) => {
      const def = CASES[saveRef.current.current.caseId];
      const ch = Puzzle.getChallenge(def, chId);
      updateCase((c) => Puzzle.recordStepResult(c, ch, idx, res));
      const after = saveRef.current.current.challenges[chId];
      if (after && after.done && ch.unlocksText) pushToast({ title: 'Lokasi baru terbuka', text: ch.unlocksText, icon: 'MapPin' });
    },
    hint: (chId, idx) => {
      const def = CASES[saveRef.current.current.caseId];
      updateCase((c) => Puzzle.recordHint(c, Puzzle.getChallenge(def, chId), idx));
    },
    recordConnection: (test, success) => updateCase((c) => Ev.recordConnectionAttempt(c, test, success)),
    submitConclusion: (answer) => submitConclusion(answer),
  };

  function submitConclusion(answer) {
    const prev = saveRef.current;
    const c = prev.current;
    const def = CASES[c.caseId];
    const evaluation = Ev.evaluateConclusion(def, answer);
    if (!evaluation.ok) {
      const wrong = evaluation.stage === 'reasoning' ? c.final.wrong : c.final.wrong + 1;
      commit({ ...prev, current: { ...c, final: { ...c.final, wrong } } });
      return evaluation;
    }
    const final = { wrong: c.final.wrong, solved: true, points: Progress.finalPoints(c.final.wrong), reasoning: answer.reasoning.trim() };
    const c2 = { ...c, final, phase: 'epilogue' };
    const result = Progress.buildResult(def, c2, evaluation.checks);
    const before = sumBest(prev.profile);
    const prevBest = (prev.profile.cases[def.id] && prev.profile.cases[def.id].bestPoints) || 0;
    const after = sumBest(prev.profile, def.id) + Math.max(prevBest, result.points);
    result.rankUp = Progress.rankFor(after).index > Progress.rankFor(before).index;
    // Masukan untuk ASTRA (hanya ID & jawaban pemain; tidak menentukan hasil kasus).
    result.astraInput = {
      optionId: answer.optionId,
      evidence: answer.evidence || [],
      numbers: { increase: Number(answer.increase) || null, sessions: Number(answer.sessions) || null, perSession: Number(answer.perSession) || null },
      reasoning: (answer.reasoning || '').trim().slice(0, 500),
      progress: buildProgress(c2),
      learner: normalizeLearner(saveRef.current.settings.learner),
    };
    let next = Progress.finalizeCase({ ...prev, current: c2 }, def, result);
    next = beginStory(next, 'epilogue');
    commit(next);
    setScreen('story');
    runAstra(def.id);
    return evaluation;
  }

  // ASTRA: evaluasi penalaran (opsional). Kegagalan tidak memengaruhi hasil kasus.
  async function runAstra(caseId) {
    const rec = saveRef.current.profile.cases[caseId];
    const input = rec && rec.result && rec.result.astraInput;
    if (!input) return;
    setAstraBusy({ id: caseId });
    try {
      const data = await aiApi.evaluate(input);
      const s = saveRef.current;
      const cur = s.profile.cases[caseId];
      commit({ ...s, profile: { ...s.profile, cases: { ...s.profile.cases, [caseId]: { ...cur, result: { ...cur.result, astra: data } } } } });
      setAstraBusy(null);
    } catch (e) {
      setAstraBusy({ id: caseId, error: friendlyError(e) });
    }
  }

  /* ---------------- cerita ---------------- */
  const handleAdvance = (choiceIndex) => {
    const res = advanceStory(saveRef.current, choiceIndex);
    if (res.collected.length) {
      const def = CASES[res.save.current.caseId];
      res.collected.forEach((id) => pushToast({ title: `Bukti terkumpul: ${def.evidence[id].code}`, text: def.evidence[id].title, icon: 'Pin' }));
    }
    if (res.ended) {
      const fin = finishStory(res.save, res.ended);
      // tandai tantangan baru setelah bukti dari wawancara
      commit(fin.save);
      if (fin.highlight) setHighlight(fin.highlight);
      if (fin.resultId) setResultId(fin.resultId);
      setScreen(fin.screen);
      if (fin.screen === 'game') setTimeout(() => updateCase((c) => c), 0);
    } else {
      commit(res.save);
    }
  };

  const handleName = (name) => {
    const res = advanceStory(saveRef.current, 0, (s) => ({ ...s, player: { name } }));
    commit(res.save);
  };

  /* ---------------- menu & arsip ---------------- */
  const beginNewGame = () => {
    const fresh = Progress.freshSave(saveRef.current);
    commit(beginStory(fresh, 'intro'));
    setScreen('story');
    setModal(null);
  };

  const startNew = () => {
    if (canContinue) {
      setConfirm({
        title: 'Mulai penyelidikan baru?',
        message: 'Semua progres, poin, dan lencana yang tersimpan akan dihapus. Pengaturanmu tetap dipertahankan.',
        confirmLabel: 'Hapus & mulai baru',
        danger: true,
        onConfirm: () => { setConfirm(null); beginNewGame(); },
      });
    } else beginNewGame();
  };

  const continueGame = () => {
    const s = saveRef.current;
    if (s.story) setScreen('story');
    else if (s.current) setScreen('game');
    else setScreen('archive');
  };

  const startCase = (caseId) => {
    const def = CASES[caseId];
    const s = { ...saveRef.current, current: Progress.newCaseState(def) };
    commit(beginStory(s, 'briefing'));
    setScreen('story');
    setHighlight(null);
  };

  const continueCase = () => {
    setScreen(saveRef.current.story ? 'story' : 'game');
  };

  const replayCase = (caseId) => {
    setConfirm({
      title: 'Ulangi kasus dari awal?',
      message: 'Bukti dan jawaban kasus ini akan diulang dari awal. Poin terbaik dan lencana yang sudah diraih tetap tersimpan.',
      confirmLabel: 'Ulangi kasus',
      danger: true,
      onConfirm: () => { setConfirm(null); setModal(null); startCase(caseId); },
    });
  };

  const toMenu = () => { setModal(null); setScreen('menu'); };

  const openSettings = (from) => { setSettingsBack(from); setModal(null); setScreen('settings'); };

  const resetAll = () => {
    setConfirm({
      title: 'Hapus semua progres?',
      message: 'Progres, poin, dan lencana akan dihapus permanen dari perangkat ini.',
      confirmLabel: 'Hapus semua',
      danger: true,
      onConfirm: () => {
        setConfirm(null);
        commit({ ...Progress.defaultSave(), settings: saveRef.current.settings });
        setScreen('menu');
        pushToast({ title: 'Progres dihapus', icon: 'Trash2' });
      },
    });
  };

  const changeSettings = (patch) => commit({ ...saveRef.current, settings: { ...saveRef.current.settings, ...patch } });

  /* ---------------- render ---------------- */
  const script = currentScript(save);
  const storyNode = script && save.story ? Story.getNode(script, save.story.nodeId) : null;
  let view = 'scene';
  let body = null;

  let current = screen;
  if (current === 'story' && !(script && storyNode)) current = 'menu';
  if (current === 'game' && !(cs && caseDef)) current = 'menu';
  if (current === 'result' && !(resultId && save.profile.cases[resultId] && save.profile.cases[resultId].result)) current = 'menu';

  if (current === 'game') {
    view = cs.view || 'scene';
    const ready = Inv.readyForResolution(caseDef, cs);
    const newCh = caseDef.challenges.filter((c) => Inv.challengeStatus(c, caseDef, cs) === 'available').length;
    const chal = cs.openChallenge ? Puzzle.getChallenge(caseDef, cs.openChallenge) : null;
    let content;
    switch (view) {
      case 'objectives':
        content = (
          <div className="page-pad">
            <div className="paper-card"><ObjectivesPanel objectives={Inv.objectiveList(caseDef, cs)} /></div>
            <div className="btn-row"><button type="button" className="btn" onClick={() => openView('scene')}><Icon name="Search" size={18} /> Kembali menyelidiki</button></div>
          </div>
        );
        break;
      case 'journal':
        content = <div className="page-pad"><EvidenceInventory caseDef={caseDef} cs={cs} actions={actions} /></div>;
        break;
      case 'board':
        content = <div className="page-pad"><EvidenceBoard caseDef={caseDef} cs={cs} actions={actions} /></div>;
        break;
      case 'challenges':
        content = <div className="page-pad"><ChallengeList caseDef={caseDef} cs={cs} onOpen={openChallenge} aiStatus={aiStatus} learner={learner} onLearner={(l) => changeSettings({ learner: l })} /></div>;
        break;
      case 'challenge':
        content = chal && Inv.challengeAvailable(chal, caseDef, cs)
          ? <div className="page-pad narrow-pad"><KnowledgeChallenge key={chal.id} caseDef={caseDef} cs={cs} challenge={chal} actions={actions} onBack={() => openView('scene')} aiStatus={aiStatus} learner={learner} onLearner={(l) => changeSettings({ learner: l })} /></div>
          : <div className="page-pad"><ChallengeList caseDef={caseDef} cs={cs} onOpen={openChallenge} /></div>;
        break;
      case 'resolution':
        content = ready
          ? <div className="page-pad narrow-pad"><CaseResolution caseDef={caseDef} cs={cs} actions={actions} /></div>
          : <div className="page-pad"><ObjectivesPanel objectives={Inv.objectiveList(caseDef, cs)} /></div>;
        break;
      default:
        content = <InvestigationScene caseDef={caseDef} cs={cs} actions={actions} />;
    }
    body = (
      <>
        <GameShell caseDef={caseDef} view={view} points={points} rank={rank} evidenceCount={cs.collected.length} newChallenges={newCh} ready={ready} onView={openView} onPause={() => setModal('pause')}>
          {content}
        </GameShell>
        <RenntzyCompanion cs={cs} status={aiStatus.status} onRecheck={aiStatus.recheck} learner={learner} />
      </>
    );
  }

  const inCaseStory = !!save.current;

  return (
    <div className={`app screen-${current}`}>
      {current === 'menu' && (
        <MainMenu
          canContinue={canContinue}
          continueHint="Belum ada penyelidikan tersimpan. Mulailah Penyelidikan Baru."
          onContinue={continueGame}
          onNew={startNew}
          onArchive={() => setScreen('archive')}
          onSettings={() => openSettings('menu')}
        />
      )}

      {current === 'archive' && (
        <CaseArchive
          save={save}
          points={points}
          rank={rank}
          highlight={highlight}
          onBack={() => setScreen('menu')}
          onStart={startCase}
          onContinue={continueCase}
          onReport={(id) => { setResultId(id); setScreen('result'); }}
          onReplay={replayCase}
          onNewGame={startNew}
        />
      )}

      {current === 'settings' && (
        <SettingsScreen settings={save.settings} onChange={changeSettings} onReset={resetAll} onBack={() => setScreen(settingsBack === 'story' && !save.story ? 'menu' : settingsBack)} />
      )}

      {current === 'story' && (
        <StoryScreen
          script={script}
          nodeId={save.story.nodeId}
          node={storyNode}
          visitedCount={save.story.visited.length}
          visitedIds={save.story.visited}
          flags={cs ? cs.flags : {}}
          playerName={save.player.name}
          settings={save.settings}
          reduceMotion={reduceMotion}
          onAdvance={handleAdvance}
          onSubmitName={handleName}
          onPause={() => setModal('pause')}
          cs={cs}
          aiStatus={aiStatus}
          learner={learner}
        />
      )}

      {body}

      {current === 'result' && (() => {
        const def = CASES[resultId];
        const rec = save.profile.cases[resultId];
        return (
          <ResultScreen
            caseDef={def}
            result={rec.result}
            rank={rank}
            points={points}
            rankUp={!!rec.result.rankUp}
            astra={{ data: rec.result.astra || null, busy: !!(astraBusy && astraBusy.id === resultId && !astraBusy.error), error: astraBusy && astraBusy.id === resultId ? astraBusy.error : null, canAsk: !!rec.result.astraInput, onRequest: () => runAstra(resultId) }}
            onArchive={() => setScreen('archive')}
            onReplay={() => replayCase(resultId)}
            onMenu={() => setScreen('menu')}
          />
        );
      })()}

      {modal === 'pause' && (
        <Modal title="Jeda" onClose={() => setModal(null)} tone="dark" labelId="pause-title" closeLabel="Tutup menu jeda">
          <p className="muted">Progresmu tersimpan otomatis.</p>
          <div className="menu-list">
            <button type="button" className="btn btn-primary" onClick={() => setModal(null)} data-autofocus><Icon name="Play" size={18} /> Lanjutkan</button>
            <button type="button" className="btn" onClick={() => setModal('profile')}><Icon name="Award" size={18} /> Profil & Lencana</button>
            <button type="button" className="btn" onClick={() => openSettings(current)}><Icon name="Settings" size={18} /> Pengaturan</button>
            {inCaseStory && !(cs && cs.phase === 'epilogue') && (
              <button type="button" className="btn" onClick={() => replayCase(cs.caseId)}><Icon name="RotateCcw" size={18} /> Ulangi Kasus dari Awal</button>
            )}
            <button type="button" className="btn" onClick={toMenu}><Icon name="Save" size={18} /> Simpan & Menu Utama</button>
          </div>
        </Modal>
      )}

      {modal === 'profile' && (
        <Modal title="Profil Penyelidik" onClose={() => setModal('pause')} tone="dark" labelId="profile-title" wide>
          <ProgressPanel save={save} points={points} rank={rank} cases={save.profile.cases} />
        </Modal>
      )}

      {confirm && <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} />}
      <Toasts items={toasts} onDismiss={dismissToast} />
    </div>
  );
}
