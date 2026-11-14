import { useEffect, useState } from 'react';
import SceneBackground from './SceneBackground.jsx';
import InteractiveObject from './InteractiveObject.jsx';
import ObjectivesPanel from './ObjectivesPanel.jsx';
import { Icon, Modal, DataTable } from './ui.jsx';
import { visibleObjects, locationUnlocked, objectiveList, currentObjective } from '../engines/InvestigationEngine.js';

const KIND = { document: 'Dokumen', object: 'Benda', npc: 'Saksi' };

function InspectionPanel({ caseDef, obj, state, cs, onClose, actions }) {
  const ev = obj.evidence ? caseDef.evidence[obj.evidence] : null;
  const collected = !!ev && cs.collected.includes(ev.id);
  return (
    <Modal title={obj.name} onClose={onClose} tone="paper" labelId="inspect-title" closeLabel="Tutup pemeriksaan">
      <div className="inspect">
        <div className="inspect-icon" aria-hidden="true"><Icon name={obj.icon} size={34} /></div>
        <div className="inspect-main">
          <p className="kind-chip">
            {KIND[obj.kind] || 'Benda'}
            {obj.background && ' · informasi latar'}
          </p>
          <p>{obj.description}</p>

          {state.locked ? (
            <p className="lock-note" role="note"><Icon name="Lock" size={16} /> {obj.lockText || 'Belum bisa dibuka.'}</p>
          ) : (
            <>
              {obj.details && obj.details.length > 0 && (
                <>
                  <h3 className="mini-title">Informasi yang kamu temukan</h3>
                  <ul className="detail-list">
                    {obj.details.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </>
              )}
              <DataTable table={obj.table} />
              {obj.note && <blockquote className="doc-note">{obj.note}</blockquote>}
              {obj.revealText && (
                <p className="discovery" role="status"><Icon name="Sparkles" size={16} /> Penemuan baru: {obj.revealText}</p>
              )}
            </>
          )}

          <div className="btn-row">
            {!state.locked && ev && !collected && (
              <button type="button" className="btn btn-primary" onClick={() => actions.collect(ev.id)} data-autofocus>
                <Icon name="Pin" size={18} /> Kumpulkan Bukti
              </button>
            )}
            {!state.locked && ev && collected && (
              <p className="collected-note" role="status">
                <Icon name="CircleCheck" size={18} /> Bukti terkumpul: {ev.code} — {ev.title}
              </p>
            )}
            {!state.locked && obj.kind === 'npc' && (
              <button type="button" className="btn btn-primary" onClick={() => actions.startInterview(obj.script)} data-autofocus>
                <Icon name="MessageSquareQuote" size={18} /> {obj.actionLabel || 'Mulai wawancara'}
              </button>
            )}
            {!state.locked && ev && collected && (
              <button type="button" className="btn" onClick={() => actions.openView('journal')}>
                <Icon name="BookOpen" size={18} /> Buka Jurnal
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={onClose}>Tutup</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function InvestigationScene({ caseDef, cs, actions }) {
  const [openId, setOpenId] = useState(null);
  const [locMsg, setLocMsg] = useState('');
  const locId = cs.location;
  const loc = caseDef.locations[locId];
  const objects = visibleObjects(caseDef, cs, locId);
  const objectives = objectiveList(caseDef, cs);
  const cur = currentObjective(caseDef, cs);
  const open = openId ? objects.find((o) => o.obj.id === openId) : null;

  useEffect(() => {
    setLocMsg('');
    setOpenId(null);
  }, [locId]);

  const openObject = (id) => {
    const found = objects.find((o) => o.obj.id === id);
    if (!found) return;
    setOpenId(id);
    if (!found.state.locked) actions.inspect(id);
  };

  const goLocation = (id) => {
    if (!locationUnlocked(caseDef, cs, id)) {
      setLocMsg(caseDef.locations[id].lockText);
      return;
    }
    setLocMsg('');
    actions.setLocation(id);
  };

  return (
    <div className="investigate">
      <div className="inv-main">
        <div className="loc-tabs" role="tablist" aria-label="Lokasi penyelidikan">
          {caseDef.locationOrder.map((id) => {
            const l = caseDef.locations[id];
            const unlocked = locationUnlocked(caseDef, cs, id);
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={id === locId}
                aria-disabled={!unlocked}
                className={`loc-tab ${id === locId ? 'is-active' : ''} ${!unlocked ? 'is-locked' : ''}`}
                onClick={() => goLocation(id)}
              >
                <Icon name={unlocked ? l.icon : 'Lock'} size={18} />
                <span>{l.name}</span>
                {!unlocked && <span className="sr-only"> (terkunci)</span>}
              </button>
            );
          })}
        </div>
        {locMsg && <p className="lock-note loc-msg" role="alert"><Icon name="Lock" size={16} /> {locMsg}</p>}

        <div className="stage-frame">
          <div className="stage" role="group" aria-label={`Lokasi: ${loc.name}`}>
            <SceneBackground id={loc.bg} figures={locId === 'hallway'} />
            {objects.map(({ obj, state }) => (
              <InteractiveObject key={obj.id} obj={obj} state={state} onOpen={openObject} />
            ))}
          </div>
        </div>

        {cur && (
          <p className="now-banner">
            <Icon name="Target" size={16} /> <strong>Tujuan:</strong> {cur.text} <span className="muted">({cur.where})</span>
          </p>
        )}
      </div>

      <aside className="inv-side" aria-label="Panel penyelidikan">
        <section className="panel">
          <div className="panel-head">
            <h2 className="panel-title"><Icon name="MapPin" size={18} /> {loc.name}</h2>
          </div>
          <p className="loc-intro">{loc.intro}</p>
          <h3 className="mini-title">Titik penyelidikan</h3>
          <ul className="obj-buttons">
            {objects.map(({ obj, state }) => (
              <li key={obj.id}>
                <button type="button" className="obj-btn" onClick={() => openObject(obj.id)}>
                  <Icon name={state.locked ? 'Lock' : obj.icon} size={18} />
                  <span className="obj-btn-name">{obj.name}</span>
                  <span className="obj-btn-state">
                    {state.locked ? 'Terkunci' : state.collected ? 'Bukti terkumpul' : state.inspected ? 'Diperiksa' : 'Baru'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
        <div className="panel desktop-only">
          <ObjectivesPanel objectives={objectives} compact />
          <button type="button" className="btn btn-small" onClick={() => actions.openView('objectives')}>Lihat semua tujuan</button>
        </div>
      </aside>

      {open && (
        <InspectionPanel
          caseDef={caseDef}
          obj={open.obj}
          state={open.state}
          cs={cs}
          onClose={() => setOpenId(null)}
          actions={{
            ...actions,
            startInterview: (sid) => {
              setOpenId(null);
              actions.startInterview(sid);
            },
            openView: (v) => {
              setOpenId(null);
              actions.openView(v);
            },
          }}
        />
      )}
    </div>
  );
}
