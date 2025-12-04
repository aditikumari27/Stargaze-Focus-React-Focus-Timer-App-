import React, { useEffect, useRef, useState } from "react";
import ReactLogo from "./assets/react.svg";

/*
  Stargaze Focus - Single-file main component.
  Features:
  - Pomodoro-style timer with presets
  - Add / check / remove tasks (localStorage)
  - Circular progress display
  - Theme toggle (dark / light)
  - Animated starfield background (CSS)
  - Responsive layout
*/

const DEFAULT_TASKS = [
  // empty by default, but keep example commented
];

const PRESETS = [
  { label: "Focus 25", sec: 25 * 60 },
  { label: "Short 10", sec: 10 * 60 },
  { label: "Micro 5", sec: 5 * 60 }
];

function formatTime(total) {
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = Math.floor(total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("sg-theme") || "dark"
  );

  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem("sg-tasks");
      return raw ? JSON.parse(raw) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  });

  const [seconds, setSeconds] = useState(() => {
    const s = localStorage.getItem("sg-seconds");
    return s ? Number(s) : 25 * 60;
  });

  const [running, setRunning] = useState(() => {
    const r = localStorage.getItem("sg-running");
    return r === "true";
  });

  const [selectedPreset, setSelectedPreset] = useState(() => {
    const p = localStorage.getItem("sg-preset");
    return p ? Number(p) : PRESETS[0].sec;
  });

  const [title, setTitle] = useState("Stargaze Focus");
  const intervalRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("sg-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("sg-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("sg-seconds", String(seconds));
  }, [seconds]);

  useEffect(() => {
    localStorage.setItem("sg-running", String(running));
  }, [running]);

  useEffect(() => {
    localStorage.setItem("sg-preset", String(selectedPreset));
  }, [selectedPreset]);

  useEffect(() => {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            // timer finished
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setRunning(false);
            // play beep
            try {
              const audio = new Audio(
                "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA="
              );
              audio.play();
            } catch {}
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running]);

  // Derived percentage for progress circle
  const percent =
    selectedPreset > 0 ? Math.max(0, (1 - seconds / selectedPreset) * 100) : 0;

  function addTask(text) {
    if (!text.trim()) return;
    const newTask = { id: Date.now(), text: text.trim(), done: false };
    setTasks((t) => [newTask, ...t]);
  }

  function toggleDone(id) {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  }

  function deleteTask(id) {
    setTasks((t) => t.filter((x) => x.id !== id));
  }

  function editTask(id, newText) {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, text: newText } : x)));
  }

  function choosePreset(sec) {
    setSelectedPreset(sec);
    setSeconds(sec);
    setRunning(false);
  }

  function toggleStartPause() {
    if (seconds === 0) {
      setSeconds(selectedPreset);
      setRunning(true);
    } else {
      setRunning((r) => !r);
    }
  }

  function resetTimer() {
    setSeconds(selectedPreset);
    setRunning(false);
  }

  // Quick keyboard: space to start/stop
  useEffect(() => {
    function onKey(e) {
      if (e.code === "Space") {
        e.preventDefault();
        toggleStartPause();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [seconds, selectedPreset]);

  // sample motivating quotes
  const quotes = [
    "One small step of focus. One giant leap for progress!",
    "Stars don't hurry, but they shine consistently.",
    "Do it for a minute. Then another. Build momentum.",
    "Focus now, celebrate later."
  ];

  return (
    <div className="app">
      <div className="stars" />
      <div className="stars2" />
      <header className="topbar">
        <div className="title">
          <img src={ReactLogo} alt="logo" className="logo" />
          <div>
            <h1>{title}</h1>
            <p className="subtitle">Focus timer · tasks · progress</p>
          </div>
        </div>
        <div className="controls">
          <select
            aria-label="Theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="theme-select"
            title="Theme"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
          <button
            className="ghost"
            onClick={() => {
              setTasks([]);
            }}
            title="Clear all tasks"
          >
            Clear tasks
          </button>
        </div>
      </header>

      <main className="container">
        <section className="left">
          <div className="card timer-card">
            <div className="preset-row">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  className={`preset ${selectedPreset === p.sec ? "active" : ""}`}
                  onClick={() => choosePreset(p.sec)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="clock-row">
              <div className="circle-wrap" aria-hidden>
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path
                    className="circle-bg"
                    d="M18 2.0845
                       a 15.9155 15.9155 0 0 1 0 31.831
                       a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="circle"
                    strokeDasharray={`${percent}, 100`}
                    d="M18 2.0845
                       a 15.9155 15.9155 0 0 1 0 31.831
                       a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="clock">
                  <div className="time">{formatTime(seconds)}</div>
                  <div className="small">{running ? "Running" : "Paused"}</div>
                  <div className="quote">{quotes[Math.floor(Math.random() * quotes.length)]}</div>
                </div>
              </div>
            </div>

            <div className="btn-row">
              <button className="big" onClick={toggleStartPause}>
                {running ? "Pause" : seconds === 0 ? "Start" : "Start / Resume"}
              </button>
              <button className="ghost" onClick={resetTimer}>
                Reset
              </button>
            </div>

            <div className="hint">Tip: press <kbd>Space</kbd> to start/pause</div>
          </div>

          <div className="card tasks-card">
            <TaskInput onAdd={addTask} />
            <TaskList
              tasks={tasks}
              onToggle={toggleDone}
              onDelete={deleteTask}
              onEdit={editTask}
            />
          </div>
        </section>

        <aside className="right">
          <div className="card stats-card">
            <h3>Progress</h3>
            <p>
              Completed tasks:{" "}
              <strong>{tasks.filter((t) => t.done).length}/{tasks.length}</strong>
            </p>
            <div className="progress-bar">
              <div
                className="fill"
                style={{
                  width:
                    tasks.length === 0
                      ? "0%"
                      : `${Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100)}%`
                }}
              />
            </div>

            <h3 style={{ marginTop: 16 }}>Quick Actions</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                className="ghost"
                onClick={() => {
                  setSeconds(5 * 60);
                  setSelectedPreset(5 * 60);
                }}
              >
                Quick 5m
              </button>
              <button
                className="ghost"
                onClick={() => {
                  setSeconds(15 * 60);
                  setSelectedPreset(15 * 60);
                }}
              >
                Quick 15m
              </button>
              <button
                className="ghost"
                onClick={() => {
                  setTasks((t) => [...t, { id: Date.now(), text: "Reflect later", done: false }]);
                }}
              >
                Add a note
              </button>
            </div>
          </div>

          <div className="card about-card">
            <h3>About</h3>
            <p>
              Stargaze Focus helps you focus with short bursts of deep work, track tasks, and keep
              momentum. It's responsive and stores your state locally.
            </p>
           
          </div>
        </aside>
      </main>

      <footer className="footer">
        <small>Stargaze Focus • Local state only • No account required</small>
      </footer>
    </div>
  );
}

/* Task Input & List as small components */

function TaskInput({ onAdd }) {
  const [val, setVal] = useState("");
  return (
    <div className="task-input">
      <input
        placeholder="Add a task (e.g., Read one chapter)"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onAdd(val);
            setVal("");
          }
        }}
      />
      <button
        className="big"
        onClick={() => {
          onAdd(val);
          setVal("");
        }}
      >
        Add
      </button>
    </div>
  );
}

function TaskList({ tasks, onToggle, onDelete, onEdit }) {
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState("");

  useEffect(() => {
    if (editingId != null) {
      const t = tasks.find((x) => x.id === editingId);
      if (t) setEditVal(t.text);
    }
  }, [editingId, tasks]);

  return (
    <div className="task-list">
      {tasks.length === 0 && <div className="empty">No tasks ✔ Add one to start</div>}
      {tasks.map((t) => (
        <div key={t.id} className={`task ${t.done ? "done" : ""}`}>
          <label className="task-left">
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => onToggle(t.id)}
              aria-label={`Mark ${t.text}`}
            />
            {editingId === t.id ? (
              <input
                className="edit-input"
                value={editVal}
                onChange={(e) => setEditVal(e.target.value)}
              />
            ) : (
              <span className="task-text">{t.text}</span>
            )}
          </label>

          <div className="task-actions">
            {editingId === t.id ? (
              <>
                <button
                  className="ghost"
                  onClick={() => {
                    onEdit(t.id, editVal);
                    setEditingId(null);
                  }}
                >
                  Save
                </button>
                <button className="ghost" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  className="ghost"
                  onClick={() => {
                    setEditingId(t.id);
                  }}
                >
                  Edit
                </button>
                <button
                  className="ghost danger"
                  onClick={() => {
                    if (confirm("Delete this task?")) onDelete(t.id);
                  }}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

