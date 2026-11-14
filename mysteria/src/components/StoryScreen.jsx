import SceneBackground from './SceneBackground.jsx';
import CharacterPortrait from './CharacterPortrait.jsx';
import DialogueBox from './DialogueBox.jsx';
import { Icon } from './ui.jsx';
import { CHARACTERS, speakerName } from '../data/characters.js';
import { fillTemplate, progressFor } from '../engines/StoryEngine.js';
import ReiTalk, { REI_CHARACTER_BY_SCRIPT } from './ai/ReiTalk.jsx';

// Layar visual novel: latar, potret, kartu surat, dan kotak dialog.
export default function StoryScreen({ script, nodeId, node, visitedCount, visitedIds, flags, playerName, settings, reduceMotion, onAdvance, onSubmitName, onPause, cs, aiStatus, learner }) {
  const speaker = node.speaker;
  const narrator = !speaker || speaker === 'narrator';
  const cast = node.cast && node.cast.length ? node.cast : !narrator ? [speaker] : [];
  const vars = { player: playerName };
  const text = fillTemplate(node.text, vars);
  const progress = script.interview
    ? null
    : { ...progressFor(script, visitedCount, nodeId, flags), label: script.chapter };

  return (
    <div className="story-screen">
      <SceneBackground id={node.bg} />
      <header className="story-top">
        <div className="chapter-chip">
          <Icon name="BookOpen" size={16} />
          <span>{script.chapter}</span>
        </div>
        <div className="story-top-right">
          {script.interview && cs && REI_CHARACTER_BY_SCRIPT[script.id] && aiStatus && (
            <ReiTalk characterId={REI_CHARACTER_BY_SCRIPT[script.id]} cs={cs} status={aiStatus.status} onRecheck={aiStatus.recheck} learner={learner} />
          )}
          <button type="button" className="btn btn-ghost" onClick={onPause} aria-label="Buka menu jeda">
            <Icon name="Menu" size={18} /> <span className="hide-sm">Jeda</span>
          </button>
        </div>
      </header>

      {node.card && (
        <div className="letter" aria-label="Isi undangan">
          <div className="letter-seal" aria-hidden="true"><Icon name="BookOpen" size={26} /></div>
          <h2>{node.card.title}</h2>
          {node.card.lines.map((l, i) => <p key={i}>{l}</p>)}
        </div>
      )}

      <div className="stage-cast" aria-hidden={false}>
        {['left', 'right'].map((side) => (
          <div key={side} className={`cast-slot cast-${side}`}>
            {cast
              .filter((id) => CHARACTERS[id] && CHARACTERS[id].side === side)
              .map((id) => (
                <CharacterPortrait
                  key={`${id}-${id === speaker ? node.expr || 'neutral' : 'idle'}`}
                  id={id}
                  expression={id === speaker ? node.expr || 'neutral' : 'neutral'}
                  dim={cast.length > 1 && id !== speaker}
                />
              ))}
          </div>
        ))}
      </div>

      <DialogueBox
        key={nodeId}
        name={speakerName(speaker, playerName)}
        text={text}
        narrator={narrator}
        choices={node.choices ? node.choices.map((c) => ({ ...c, text: fillTemplate(c.text, vars) })) : null}
        visited={visitedIds}
        input={node.input}
        speed={settings.textSpeed}
        instant={reduceMotion}
        progress={progress}
        onNext={() => onAdvance(0)}
        onChoose={(i) => onAdvance(i)}
        onSubmitName={onSubmitName}
      />
    </div>
  );
}
