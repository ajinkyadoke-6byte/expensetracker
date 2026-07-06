import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Trash2, Plus, Loader2, Receipt } from "lucide-react";


/*  MOCK API                                                          */

const MOCK_EXPENSES = [
  { id: 1, description: "Rent", amount: 1200, category: "Housing", date: "2026-07-01" },
  { id: 2, description: "Groceries", amount: 86.4, category: "Food", date: "2026-07-02" },
  { id: 3, description: "Metro pass", amount: 45, category: "Transport", date: "2026-07-02" },
  { id: 4, description: "Electricity bill", amount: 62.15, category: "Utilities", date: "2026-07-03" },
  { id: 5, description: "Movie night", amount: 28, category: "Entertainment", date: "2026-07-04" },
];

function fetchExpensesFromServer() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_EXPENSES), 900);
  });
}

const CATEGORIES = ["Food", "Transport", "Housing", "Entertainment", "Utilities", "Shopping", "Health", "Other"];

const CATEGORY_COLOR = {
  Food: "#C9A227",
  Transport: "#3E8E82",
  Housing: "#B5533C",
  Entertainment: "#7A6FB0",
  Utilities: "#4C8BC9",
  Shopping: "#C97757",
  Health: "#5FA35F",
  Other: "#8891A0",
};

let nextId = 1000;

export default function ExpenseTracker() {

  /*  useState — form fields + core data                              */

  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [activeFilter, setActiveFilter] = useState("All");
  const [formError, setFormError] = useState("");

  /*  useRef — focus management, no re-render needed to hold this     */

  const descriptionInputRef = useRef(null);

  /*  useEffect — fetch mock API data once on mount                   */

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchExpensesFromServer()
      .then((data) => {
        if (isMounted) {
          setExpenses(data);
          setError(null);
        }
      })
      .catch(() => {
        if (isMounted) setError("Couldn't load expenses. Try refreshing.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false; // avoids setting state on an unmounted component
    };
  }, []);

  // Autofocus the description field once the ledger has finished loading
  useEffect(() => {
    if (!isLoading) {
      descriptionInputRef.current?.focus();
    }
  }, [isLoading]);

  /*  useCallback — stable handler references                         */

  const handleAddExpense = useCallback(
    (e) => {
      e.preventDefault();

      const parsedAmount = parseFloat(amount);
      if (!description.trim()) {
        setFormError("Give this entry a description.");
        descriptionInputRef.current?.focus();
        return;
      }
      if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        setFormError("Enter an amount greater than zero.");
        return;
      }

      const newExpense = {
        id: nextId++,
        description: description.trim(),
        amount: parsedAmount,
        category,
        date,
      };

      setExpenses((prev) => [newExpense, ...prev]);
      setDescription("");
      setAmount("");
      setFormError("");

      // Return focus to the first field so rapid entry stays fast
      descriptionInputRef.current?.focus();
    },
    [description, amount, category, date]
  );

  const handleDeleteExpense = useCallback((id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  }, []);

  const handleFilterChange = useCallback((cat) => {
    setActiveFilter(cat);
  }, []);

 
  /*  useMemo — derived data, recomputed only when inputs change      */

  const total = useMemo(
    () => expenses.reduce((sum, exp) => sum + exp.amount, 0),
    [expenses]
  );

  const categoriesPresent = useMemo(() => {
    const set = new Set(expenses.map((exp) => exp.category));
    return ["All", ...CATEGORIES.filter((c) => set.has(c))];
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const list =
      activeFilter === "All"
        ? expenses
        : expenses.filter((exp) => exp.category === activeFilter);
    return [...list].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [expenses, activeFilter]);

  const categoryBreakdown = useMemo(() => {
    const totals = {};
    expenses.forEach((exp) => {
      totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
    });
    return Object.entries(totals)
      .map(([cat, amt]) => ({ category: cat, amount: amt, pct: total ? (amt / total) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, total]);

  return (
    <div className="ledger-root">
      <style>{`
        .ledger-root {
          --ink-950: #10141a;
          --ink-900: #1a2029;
          --ink-800: #232b36;
          --line: #313a47;
          --gold: #c9a227;
          --gold-soft: rgba(201,162,39,0.14);
          --paper: #ece7da;
          --muted: #8891a0;
          --rust: #b5533c;
          font-family: 'Inter', system-ui, sans-serif;
          background: var(--ink-950);
          color: var(--paper);
          min-height: 100vh;
          padding: 2rem 1rem 4rem;
        }
        .ledger-root * { box-sizing: border-box; }
        .ledger-serif { font-family: 'Fraunces', Georgia, serif; }
        .ledger-mono { font-family: 'IBM Plex Mono', monospace; }

        .ledger-wrap {
          max-width: 880px;
          margin: 0 auto;
        }

        /* --- Hero / receipt tape total --- */
        .receipt {
          background: var(--ink-900);
          border: 1px solid var(--line);
          border-radius: 4px;
          padding: 1.75rem 1.75rem 1.5rem;
          position: relative;
          margin-bottom: 2rem;
        }
        .receipt::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: -8px;
          height: 16px;
          background: repeating-linear-gradient(
            -45deg,
            var(--ink-950) 0 8px,
            transparent 8px 16px
          );
        }
        .receipt-eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 0.7rem;
          color: var(--gold);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.6rem;
        }
        .receipt-total {
          font-size: clamp(2.4rem, 8vw, 3.4rem);
          line-height: 1;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        .receipt-sub {
          color: var(--muted);
          font-size: 0.85rem;
          margin-top: 0.35rem;
        }

        .breakdown {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1.4rem;
        }
        .breakdown-item {
          flex: 1 1 140px;
          min-width: 120px;
        }
        .breakdown-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: var(--muted);
          margin-bottom: 0.3rem;
        }
        .breakdown-bar-track {
          height: 5px;
          background: var(--ink-800);
          border-radius: 3px;
          overflow: hidden;
        }
        .breakdown-bar-fill {
          height: 100%;
          border-radius: 3px;
        }

        /* --- Form --- */
        .form-panel {
          background: var(--ink-900);
          border: 1px solid var(--line);
          border-radius: 4px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        .form-title {
          font-size: 0.95rem;
          margin-bottom: 1rem;
          color: var(--paper);
        }
        .form-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr auto;
          gap: 0.6rem;
        }
        @media (max-width: 720px) {
          .form-grid { grid-template-columns: 1fr 1fr; }
        }
        .field label {
          display: block;
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--muted);
          margin-bottom: 0.35rem;
        }
        .field input, .field select {
          width: 100%;
          background: var(--ink-950);
          border: 1px solid var(--line);
          color: var(--paper);
          border-radius: 3px;
          padding: 0.55rem 0.6rem;
          font-size: 0.9rem;
          font-family: inherit;
        }
        .field input:focus, .field select:focus {
          outline: none;
          border-color: var(--gold);
          box-shadow: 0 0 0 3px var(--gold-soft);
        }
        .add-btn {
          background: var(--gold);
          color: var(--ink-950);
          border: none;
          border-radius: 3px;
          padding: 0.55rem 0.9rem;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          white-space: nowrap;
          align-self: end;
        }
        .add-btn:hover { filter: brightness(1.08); }
        .form-error {
          color: var(--rust);
          font-size: 0.78rem;
          margin-top: 0.6rem;
        }

        /* --- Filters --- */
        .filters {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }
        .chip {
          border: 1px solid var(--line);
          background: transparent;
          color: var(--muted);
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          font-size: 0.78rem;
          cursor: pointer;
        }
        .chip.active {
          border-color: var(--gold);
          color: var(--gold);
          background: var(--gold-soft);
        }

        /* --- Ledger rows --- */
        .ledger-list { border-top: 1px solid var(--line); }
        .ledger-row {
          display: flex;
          align-items: baseline;
          gap: 0.6rem;
          padding: 0.85rem 0.15rem;
          border-bottom: 1px dashed var(--line);
        }
        .row-cat-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-bottom: 2px;
        }
        .row-desc {
          font-size: 0.92rem;
          white-space: nowrap;
        }
        .row-leader {
          flex: 1;
          border-bottom: 1px dotted var(--line);
          transform: translateY(-4px);
          margin: 0 0.4rem;
        }
        .row-meta {
          font-size: 0.68rem;
          color: var(--muted);
          margin-right: 0.6rem;
        }
        .row-amount {
          font-size: 0.95rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .row-delete {
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          padding: 0.2rem;
          margin-left: 0.4rem;
          display: flex;
        }
        .row-delete:hover { color: var(--rust); }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--muted);
        }
        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 3rem 0;
          color: var(--muted);
          font-size: 0.9rem;
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap"
        rel="stylesheet"
      />

      <div className="ledger-wrap">
        {/* ---------- Hero: receipt-style running total ---------- */}
        <div className="receipt">
          <div className="receipt-eyebrow">
            <Receipt size={13} /> Running total
          </div>
          <div className="receipt-total ledger-serif">
            ${total.toFixed(2)}
          </div>
          <div className="receipt-sub ledger-mono">
            {expenses.length} {expenses.length === 1 ? "entry" : "entries"} logged
          </div>

          {categoryBreakdown.length > 0 && (
            <div className="breakdown">
              {categoryBreakdown.map(({ category: cat, amount: amt, pct }) => (
                <div className="breakdown-item" key={cat}>
                  <div className="breakdown-label">
                    <span>{cat}</span>
                    <span className="ledger-mono">${amt.toFixed(0)}</span>
                  </div>
                  <div className="breakdown-bar-track">
                    <div
                      className="breakdown-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: CATEGORY_COLOR[cat] || "#8891A0",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---------- Add expense form ---------- */}
        <form className="form-panel" onSubmit={handleAddExpense}>
          <div className="form-title ledger-serif">New entry</div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="desc">Description</label>
              <input
                id="desc"
                ref={descriptionInputRef}
                type="text"
                placeholder="Coffee with client"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="amt">Amount</label>
              <input
                id="amt"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="cat">Category</label>
              <select id="cat" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <button type="submit" className="add-btn">
              <Plus size={16} /> Add
            </button>
          </div>
          {formError && <div className="form-error">{formError}</div>}
        </form>

        {/* ---------- Filters ---------- */}
        {!isLoading && expenses.length > 0 && (
          <div className="filters">
            {categoriesPresent.map((cat) => (
              <button
                key={cat}
                className={`chip ${activeFilter === cat ? "active" : ""}`}
                onClick={() => handleFilterChange(cat)}
                type="button"
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ---------- Ledger list ---------- */}
        {isLoading ? (
          <div className="loading-state">
            <Loader2 size={18} className="spin" /> Fetching your expenses…
          </div>
        ) : error ? (
          <div className="empty-state">{error}</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="empty-state">No entries here yet. Add one above.</div>
        ) : (
          <div className="ledger-list">
            {filteredExpenses.map((exp) => (
              <div className="ledger-row" key={exp.id}>
                <span
                  className="row-cat-dot"
                  style={{ background: CATEGORY_COLOR[exp.category] || "#8891A0" }}
                />
                <span className="row-desc">{exp.description}</span>
                <span className="row-leader" />
                <span className="row-meta ledger-mono">{exp.date}</span>
                <span className="row-amount ledger-mono">${exp.amount.toFixed(2)}</span>
                <button
                  className="row-delete"
                  onClick={() => handleDeleteExpense(exp.id)}
                  aria-label={`Delete ${exp.description}`}
                  type="button"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
