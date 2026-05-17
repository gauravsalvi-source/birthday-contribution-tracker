import { useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'birthday-contribution-records-react-v3';
const EXPENSE_STORAGE_KEY = 'birthday-contribution-expenses-react-v1';
const defaultBirthdayMonth = '2026-05';
const defaultBirthdayFor = 'Sumit, Lalit & Bhakti';
const contributionStatuses = ['Paid', 'Pending', 'Exempted', 'NA'];
const managerPassword = 'manager123';

const defaultRecords = [
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Gaurav', status: 'Paid', contribution: 100, expense: 467, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Pawan', status: 'Paid', contribution: 100, expense: 480, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Nehal', status: 'Paid', contribution: 100, expense: 354, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Sangeeta', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Bhakti', status: 'Exempted', contribution: 0, expense: 0, note: '', statusRemark: 'Birthday Employee' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Riddhi', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Mohammed', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Mane', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Aniket', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Ishwar', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Samiran', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Sumit', status: 'Exempted', contribution: 0, expense: 0, note: '', statusRemark: 'Birthday Employee' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Lalit', status: 'Exempted', contribution: 0, expense: 0, note: '', statusRemark: 'Birthday Employee' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Juhee', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Rupali', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Rushab', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Ankit', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Sayali', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Prathamesh', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Sweta', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Shivam', status: 'Paid', contribution: 100, expense: 0, note: '', statusRemark: '' },
];

const teamMemberNames = Array.from(new Set(defaultRecords.map((record) => record.name)));

const blankForm = {
  id: '',
  birthdayMonth: defaultBirthdayMonth,
  birthdayFor: defaultBirthdayFor,
  name: '',
  status: 'Paid',
  contribution: '100',
  birthDate: '',
  note: '',
};

const defaultExpenses = [
  { birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, item: 'Cake & Sevpuri', amount: 1301 },
];

const blankExpenseForm = {
  id: '',
  birthdayMonth: defaultBirthdayMonth,
  birthdayFor: defaultBirthdayFor,
  item: '',
  amount: '',
};

const blankMonthForm = {
  birthdayMonth: defaultBirthdayMonth,
  birthdayFor: '',
};

const viewTabs = [
  { id: 'records', label: 'Records' },
  { id: 'pending', label: 'Pending List' },
  { id: 'na', label: 'NA List' },
  { id: 'exempted', label: 'Birthday Employees' },
  { id: 'banner', label: 'Birthday Wish Banner' },
];

function makeId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseAmount(value) {
  const parsed = Number.parseFloat(String(value || '').replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeRecord(record) {
  const status = contributionStatuses.includes(record.status) ? record.status : 'Paid';
  const contribution = status === 'NA' || status === 'Exempted' ? 0 : parseAmount(record.contribution);

  return {
    id: record.id || makeId(),
    birthdayMonth: String(record.birthdayMonth || defaultBirthdayMonth).trim(),
    birthdayFor: String(record.birthdayFor || defaultBirthdayFor).trim(),
    name: String(record.name || '').trim() || 'Unnamed',
    status,
    contribution,
    birthDate: String(record.birthDate || '').trim(),
    statusRemark: String(record.statusRemark || '').trim(),
    note: String(record.note || '').trim(),
  };
}

function normalizeExpense(expense) {
  return {
    id: expense.id || makeId(),
    birthdayMonth: String(expense.birthdayMonth || defaultBirthdayMonth).trim(),
    birthdayFor: String(expense.birthdayFor || defaultBirthdayFor).trim(),
    item: String(expense.item || '').trim() || 'Expense',
    amount: parseAmount(expense.amount),
  };
}

function cloneDefaultRecords() {
  return defaultRecords.map(normalizeRecord);
}

function buildMonthRecords(birthdayMonth, birthdayFor) {
  return teamMemberNames.map((name) => normalizeRecord({
    birthdayMonth,
    birthdayFor,
    name,
    status: isBirthdayEmployee(name, birthdayFor) ? 'Exempted' : 'Pending',
    contribution: isBirthdayEmployee(name, birthdayFor) ? 0 : 100,
    note: isBirthdayEmployee(name, birthdayFor) ? 'Birthday Employee' : '',
  }));
}

function isBirthdayEmployee(name, birthdayFor) {
  const normalizedName = name.trim().toLowerCase();
  return birthdayFor
    .toLowerCase()
    .split(/,|&|and|\+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .includes(normalizedName);
}

function cloneDefaultExpenses() {
  return defaultExpenses.map(normalizeExpense);
}

function cloneZeroedRecords() {
  return defaultRecords.map((record) => normalizeRecord({
    ...record,
    status: 'Pending',
    contribution: 0,
    statusRemark: '',
    note: '',
  }));
}

function loadRecords() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return cloneDefaultRecords();
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.map(normalizeRecord) : cloneDefaultRecords();
  } catch {
    return cloneDefaultRecords();
  }
}

function saveRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // The app can still run if a browser blocks storage.
  }
}

function loadExpenses() {
  try {
    const saved = localStorage.getItem(EXPENSE_STORAGE_KEY);
    if (!saved) {
      return cloneDefaultExpenses();
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.map(normalizeExpense) : cloneDefaultExpenses();
  } catch {
    return cloneDefaultExpenses();
  }
}

function saveExpenses(expenses) {
  try {
    localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(expenses));
  } catch {
    // The app can still run if a browser blocks storage.
  }
}

function formatMoney(value) {
  return `Rs. ${new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

function formatMonthLabel(value) {
  if (!value) {
    return 'No Month';
  }

  const [year, month] = value.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }
      row.push(cell);
      if (row.some((value) => value.trim() !== '')) {
        rows.push(row);
      }
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== '')) {
    rows.push(row);
  }

  return rows;
}

function recordsFromCsv(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim().toLowerCase());
  const monthIndex = headers.findIndex((header) => header.includes('month'));
  const birthdayForIndex = headers.findIndex((header) => header.includes('birthday'));
  const nameIndex = headers.findIndex((header) => header === 'name' || header.includes('member'));
  const statusIndex = headers.findIndex((header) => header.includes('status'));
  const amountIndex = headers.findIndex((header) => header === 'amount' || header.includes('contribution'));
  const expenseIndex = headers.findIndex((header) => header.includes('expense'));
  const balanceIndex = headers.findIndex((header) => header.includes('balance'));
  const remarkIndex = headers.findIndex((header) => header.includes('remark'));

  return rows
    .slice(1)
    .map((row) => ({
      birthdayMonth: monthIndex >= 0 && row[monthIndex] ? row[monthIndex] : defaultBirthdayMonth,
      birthdayFor: birthdayForIndex >= 0 && row[birthdayForIndex] ? row[birthdayForIndex] : defaultBirthdayFor,
      name: row[nameIndex] || '',
      status: statusIndex >= 0 && row[statusIndex] ? row[statusIndex] : 'Paid',
      contribution: parseAmount(row[amountIndex]),
      expense: expenseIndex >= 0 ? parseAmount(row[expenseIndex]) : 0,
      statusRemark: remarkIndex >= 0 && row[remarkIndex] ? row[remarkIndex] : '',
      note: balanceIndex >= 0 && row[balanceIndex] ? `Balance ${row[balanceIndex]}` : '',
    }))
    .filter((record) => record.name.trim() && !record.name.toLowerCase().includes('total'))
    .map(normalizeRecord);
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function buildCsv(records) {
  const header = ['Birthday Month', 'Birthday For', 'Team Member Name', 'Contribution Status', 'Contribution Amount', 'Note'];
  const rows = records.map((record) => [
    record.birthdayMonth,
    record.birthdayFor,
    record.name,
    record.status,
    record.contribution,
    record.note,
  ]);

  return [header, ...rows]
    .map((row) => row.map(csvEscape).join(','))
    .join('\n');
}

export default function App() {
  const [records, setRecords] = useState(loadRecords);
  const [expenses, setExpenses] = useState(loadExpenses);
  const [form, setForm] = useState(blankForm);
  const [expenseForm, setExpenseForm] = useState(blankExpenseForm);
  const [monthForm, setMonthForm] = useState(blankMonthForm);
  const [search, setSearch] = useState('');
  const [activeMonth, setActiveMonth] = useState(() => loadRecords()[0]?.birthdayMonth || defaultBirthdayMonth);
  const [activeView, setActiveView] = useState('records');
  const [isManagerMode, setIsManagerMode] = useState(false);
  const [managerPasswordInput, setManagerPasswordInput] = useState('');
  const fileInputRef = useRef(null);

  const monthTabs = useMemo(() => {
    const months = Array.from(new Set(records.map((record) => record.birthdayMonth))).filter(Boolean);
    return months.sort((a, b) => b.localeCompare(a));
  }, [records]);

  const monthlyRecords = useMemo(
    () => records.filter((record) => record.birthdayMonth === activeMonth),
    [records, activeMonth],
  );
  const monthlyExpenses = useMemo(
    () => expenses.filter((expense) => expense.birthdayMonth === activeMonth),
    [expenses, activeMonth],
  );

  const monthFinancials = useMemo(() => {
    const orderedMonths = Array.from(new Set([
      ...records.map((record) => record.birthdayMonth),
      ...expenses.map((expense) => expense.birthdayMonth),
    ]))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    let runningBalance = 0;
    const financials = {};

    orderedMonths.forEach((month) => {
      const monthRecords = records.filter((record) => record.birthdayMonth === month);
      const monthExpenses = expenses.filter((expense) => expense.birthdayMonth === month);
      const collected = monthRecords
        .filter((record) => record.status === 'Paid')
        .reduce((sum, record) => sum + record.contribution, 0);
      const spent = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const openingBalance = runningBalance;
      const monthlyBalance = collected - spent;
      const closingBalance = openingBalance + monthlyBalance;

      financials[month] = {
        openingBalance,
        monthlyBalance,
        closingBalance,
      };

      runningBalance = closingBalance;
    });

    return financials;
  }, [records, expenses]);

  const totals = useMemo(() => {
    const paidRecords = monthlyRecords.filter((record) => record.status === 'Paid');
    const pendingRecords = monthlyRecords.filter((record) => record.status === 'Pending');
    const exemptedRecords = monthlyRecords.filter((record) => record.status === 'Exempted');
    const naRecords = monthlyRecords.filter((record) => record.status === 'NA');
    const activeRecords = monthlyRecords.filter((record) => record.status !== 'Exempted' && record.status !== 'NA');
    const collected = paidRecords.reduce((sum, record) => sum + record.contribution, 0);
    const pendingAmount = pendingRecords.reduce((sum, record) => sum + record.contribution, 0);
    const spent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    return {
      collected,
      expected: collected + pendingAmount,
      pendingAmount,
      spent,
      balance: collected - spent,
      openingBalance: monthFinancials[activeMonth]?.openingBalance || 0,
      closingBalance: monthFinancials[activeMonth]?.closingBalance || collected - spent,
      expectedBalance: (monthFinancials[activeMonth]?.openingBalance || 0) + collected + pendingAmount - spent,
      activeCount: activeRecords.length,
      paidCount: paidRecords.length,
      pendingCount: pendingRecords.length,
      exemptedCount: exemptedRecords.length,
      naCount: naRecords.length,
    };
  }, [monthlyRecords, monthlyExpenses, monthFinancials, activeMonth]);

  const statusReports = useMemo(() => ({
    pending: monthlyRecords.filter((record) => record.status === 'Pending'),
    na: monthlyRecords.filter((record) => record.status === 'NA'),
    exempted: monthlyRecords.filter((record) => record.status === 'Exempted'),
  }), [monthlyRecords]);

  const visibleRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return monthlyRecords
      .filter((record) => !query || record.name.toLowerCase().includes(query))
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [monthlyRecords, search]);

  const activeBirthdayFor = monthlyRecords[0]?.birthdayFor || defaultBirthdayFor;

  function commitRecords(nextRecords) {
    setRecords(nextRecords);
    saveRecords(nextRecords);
  }

  function commitExpenses(nextExpenses) {
    setExpenses(nextExpenses);
    saveExpenses(nextExpenses);
  }

  function updateField(field, value) {
    setForm((current) => {
      if (field === 'status' && (value === 'NA' || value === 'Exempted')) {
        return { ...current, status: value, contribution: '0' };
      }
      if (field === 'status' && (value === 'Paid' || value === 'Pending')) {
        const contribution = current.contribution === '' || current.contribution === '0' ? '100' : current.contribution;
        return { ...current, status: value, contribution };
      }
      return { ...current, [field]: value };
    });
  }

  function updateExpenseField(field, value) {
    setExpenseForm((current) => ({ ...current, [field]: value }));
  }

  function updateMonthField(field, value) {
    setMonthForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    const monthRecord = monthlyRecords[0];
    setForm({
      ...blankForm,
      birthdayMonth: activeMonth,
      birthdayFor: monthRecord?.birthdayFor || defaultBirthdayFor,
    });
  }

  function resetExpenseForm() {
    const monthRecord = monthlyRecords[0];
    setExpenseForm({
      ...blankExpenseForm,
      birthdayMonth: activeMonth,
      birthdayFor: monthRecord?.birthdayFor || defaultBirthdayFor,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const record = normalizeRecord(form);
    if (!record.name) {
      alert('Please enter a name.');
      return;
    }

    const existingIndex = records.findIndex((item) => item.id === record.id);
    const nextRecords = existingIndex >= 0
      ? records.map((item) => (item.id === record.id ? record : item))
      : [...records, record];

    commitRecords(nextRecords);
    setActiveMonth(record.birthdayMonth);
    setForm({
      ...blankForm,
      birthdayMonth: record.birthdayMonth,
      birthdayFor: record.birthdayFor,
    });
  }

  function editRecord(record) {
    setForm({
      id: record.id,
      birthdayMonth: record.birthdayMonth,
      birthdayFor: record.birthdayFor,
      name: record.name,
      status: record.status,
      contribution: String(record.contribution),
      birthDate: record.birthDate || '',
      note: record.note,
    });
  }

  function handleExpenseSubmit(event) {
    event.preventDefault();
    const expense = normalizeExpense(expenseForm);
    const existingIndex = expenses.findIndex((item) => item.id === expense.id);
    const nextExpenses = existingIndex >= 0
      ? expenses.map((item) => (item.id === expense.id ? expense : item))
      : [...expenses, expense];

    commitExpenses(nextExpenses);
    setActiveMonth(expense.birthdayMonth);
    setExpenseForm({
      ...blankExpenseForm,
      birthdayMonth: expense.birthdayMonth,
      birthdayFor: expense.birthdayFor,
    });
  }

  function editExpense(expense) {
    setExpenseForm({
      id: expense.id,
      birthdayMonth: expense.birthdayMonth,
      birthdayFor: expense.birthdayFor,
      item: expense.item,
      amount: String(expense.amount),
    });
  }

  function deleteExpense(expense) {
    if (!confirm(`Delete expense "${expense.item}"?`)) {
      return;
    }
    commitExpenses(expenses.filter((item) => item.id !== expense.id));
    if (expenseForm.id === expense.id) {
      resetExpenseForm();
    }
  }

  function resetData() {
    if (!confirm(`Reset ${formatMonthLabel(activeMonth)} contribution and expense amounts to 0?`)) {
      return;
    }

    const zeroedMonthRecords = monthlyRecords.map((record) => normalizeRecord({
      ...record,
      status: 'Pending',
      contribution: 0,
      statusRemark: '',
      note: '',
    }));
    const nextRecords = records.map((record) => {
      const replacement = zeroedMonthRecords.find((item) => item.id === record.id);
      return replacement || record;
    });
    commitRecords(nextRecords);
    commitExpenses(expenses.filter((expense) => expense.birthdayMonth !== activeMonth));
    resetForm();
    resetExpenseForm();
    setSearch('');
  }

  function deleteActiveMonth() {
    if (!confirm(`Delete ${formatMonthLabel(activeMonth)} and all its records and expenses?`)) {
      return;
    }

    const nextRecords = records.filter((record) => record.birthdayMonth !== activeMonth);
    const nextExpenses = expenses.filter((expense) => expense.birthdayMonth !== activeMonth);
    const nextActiveMonth = nextRecords[0]?.birthdayMonth || defaultBirthdayMonth;

    commitRecords(nextRecords);
    commitExpenses(nextExpenses);
    setActiveMonth(nextActiveMonth);
    setActiveView('records');
    setSearch('');
    setForm({
      ...blankForm,
      birthdayMonth: nextActiveMonth,
      birthdayFor: nextRecords.find((record) => record.birthdayMonth === nextActiveMonth)?.birthdayFor || defaultBirthdayFor,
    });
    setExpenseForm({
      ...blankExpenseForm,
      birthdayMonth: nextActiveMonth,
      birthdayFor: nextRecords.find((record) => record.birthdayMonth === nextActiveMonth)?.birthdayFor || defaultBirthdayFor,
    });
  }

  function switchMonth(month) {
    setActiveMonth(month);
    setActiveView('records');
    setSearch('');
    setForm({
      ...blankForm,
      birthdayMonth: month,
      birthdayFor: records.find((record) => record.birthdayMonth === month)?.birthdayFor || defaultBirthdayFor,
    });
    setExpenseForm({
      ...blankExpenseForm,
      birthdayMonth: month,
      birthdayFor: records.find((record) => record.birthdayMonth === month)?.birthdayFor || defaultBirthdayFor,
    });
  }

  function createMonth(event) {
    event.preventDefault();

    const birthdayMonth = monthForm.birthdayMonth;
    const birthdayFor = monthForm.birthdayFor.trim();

    if (!birthdayMonth || !birthdayFor) {
      alert('Please select a month and enter Birthday For.');
      return;
    }

    const existingMonthRecords = records.filter((record) => record.birthdayMonth === birthdayMonth);
    if (existingMonthRecords.length > 0) {
      switchMonth(birthdayMonth);
      alert(`${formatMonthLabel(birthdayMonth)} already exists. Switched to that month.`);
      return;
    }

    const newMonthRecords = buildMonthRecords(birthdayMonth, birthdayFor);
    const nextRecords = [...records, ...newMonthRecords];

    commitRecords(nextRecords);
    setActiveMonth(birthdayMonth);
    setActiveView('records');
    setSearch('');
    setForm({
      ...blankForm,
      birthdayMonth,
      birthdayFor,
    });
    setExpenseForm({
      ...blankExpenseForm,
      birthdayMonth,
      birthdayFor,
    });
    setMonthForm({
      birthdayMonth,
      birthdayFor: '',
    });
  }

  function unlockManagerMode(event) {
    event.preventDefault();
    if (managerPasswordInput !== managerPassword) {
      alert('Incorrect manager password.');
      return;
    }
    setIsManagerMode(true);
    setManagerPasswordInput('');
  }

  function lockManagerMode() {
    setIsManagerMode(false);
    resetForm();
    resetExpenseForm();
  }

  function exportCsv() {
    const blob = new Blob([buildCsv(records)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'birthday-contribution-record.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importCsv(event) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    const importedRecords = recordsFromCsv(text);
    if (importedRecords.length === 0) {
      alert('No valid records found in this CSV.');
      event.target.value = '';
      return;
    }

    commitRecords(importedRecords);
    setActiveMonth(importedRecords[0].birthdayMonth);
    setActiveView('records');
    resetForm();
    setSearch('');
    event.target.value = '';
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Monthly Team Birthday Fund</p>
          <h1>Birthday Contribution Tracker</h1>
        </div>
        <div className="topbar-actions">
          {isManagerMode ? (
            <>
              <button type="button" className="secondary-button" onClick={exportCsv}>
                Export CSV
              </button>
              <button type="button" className="secondary-button" onClick={() => fileInputRef.current.click()}>
                Import CSV
              </button>
              <button type="button" className="secondary-button danger-button" onClick={lockManagerMode}>
                Lock Editing
              </button>
              <input ref={fileInputRef} className="hidden-file" type="file" accept=".csv,text/csv" onChange={importCsv} />
            </>
          ) : (
            <form className="manager-login" onSubmit={unlockManagerMode}>
              <input
                type="password"
                placeholder="Manager password"
                value={managerPasswordInput}
                onChange={(event) => setManagerPasswordInput(event.target.value)}
              />
              <button type="submit" className="secondary-button">
                Unlock Editing
              </button>
            </form>
          )}
        </div>
      </header>

      {isManagerMode ? (
        <form className="month-create-panel" onSubmit={createMonth}>
          <div>
            <h2>Create Monthly Sheet</h2>
            <p>All team members will be added automatically for the selected month.</p>
          </div>
          <label>
            Month
            <input
              type="month"
              value={monthForm.birthdayMonth}
              onChange={(event) => updateMonthField('birthdayMonth', event.target.value)}
              required
            />
          </label>
          <label>
            Birthday For
            <input
              type="text"
              placeholder="Employee birthday name"
              value={monthForm.birthdayFor}
              onChange={(event) => updateMonthField('birthdayFor', event.target.value)}
              required
            />
          </label>
          <button type="submit" className="primary-button">
            Create Month
          </button>
        </form>
      ) : null}

      <nav className="month-tabs" aria-label="Month views">
        {monthTabs.map((month) => (
          <button
            key={month}
            type="button"
            className={month === activeMonth ? 'tab-button active' : 'tab-button'}
            onClick={() => switchMonth(month)}
          >
            {formatMonthLabel(month)}
          </button>
        ))}
      </nav>

      <section className="summary-grid" aria-label="Contribution totals">
        <MetricCard label="Total Collected" value={formatMoney(totals.collected)} />
        <MetricCard label="Total Expense" value={formatMoney(totals.spent)} />
        <MetricCard label="Total Balance" value={formatMoney(totals.closingBalance)} />
        <MetricCard label="Active Members" value={totals.activeCount} />
      </section>

      <section className="status-grid" aria-label="Contribution status totals">
        <MetricCard label="Total Paid Members" value={totals.paidCount} className="status-card paid-card" />
        <MetricCard label="Pending Members" value={totals.pendingCount} className="status-card pending-card" />
        <MetricCard label="Exempted Members" value={totals.exemptedCount} className="status-card exempted-card" />
        <MetricCard label="NA Members" value={totals.naCount} className="status-card na-card" />
      </section>

      <section className={isManagerMode ? 'editor-layout' : 'viewer-layout'}>
        {isManagerMode ? (
        <form className="form-panel" onSubmit={handleSubmit}>
          <div className="section-heading">
            <h2>{form.id ? 'Edit Record' : 'Add Record'}</h2>
            {form.id ? (
              <button type="button" className="ghost-button" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>

          <label>
            Birthday Month
            <input
              type="month"
              value={form.birthdayMonth}
              onChange={(event) => updateField('birthdayMonth', event.target.value)}
              required
            />
          </label>

          <label>
            Birthday For
            <input
              type="text"
              placeholder="Teammate birthday name"
              value={form.birthdayFor}
              onChange={(event) => updateField('birthdayFor', event.target.value)}
              required
            />
          </label>

          <label>
            Team Member Name
            <input
              type="text"
              placeholder="Contributor name"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              required
            />
          </label>

          <label>
            Contribution Status
            <select
              value={form.status}
              onChange={(event) => updateField('status', event.target.value)}
              required
            >
              {contributionStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>

          <label>
            Contribution Amount
            <input
              type="number"
              min="0"
              step="1"
              placeholder="100"
              value={form.contribution}
              onChange={(event) => updateField('contribution', event.target.value)}
              disabled={form.status === 'NA' || form.status === 'Exempted'}
              required
            />
          </label>

          <label>
            Birth Date
            <input
              type="date"
              value={form.birthDate}
              onChange={(event) => updateField('birthDate', event.target.value)}
            />
          </label>

          <label>
            Note
            <input
              type="text"
              placeholder="Optional"
              value={form.note}
              onChange={(event) => updateField('note', event.target.value)}
            />
          </label>

          <button type="submit" className="primary-button">
            Save Record
          </button>
        </form>
        ) : null}

        <section className="records-panel">
          <div className="table-toolbar">
            <div>
              <h2>{formatMonthLabel(activeMonth)} Contribution View</h2>
              <p>{visibleRecords.length} of {monthlyRecords.length} records</p>
            </div>
            <div className="toolbar-actions">
              <input
                type="search"
                placeholder="Search name"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {isManagerMode ? (
                <div className="reset-actions">
                  <button type="button" className="secondary-button" onClick={resetData}>
                    Reset to 0
                  </button>
                  <button type="button" className="secondary-button danger-button" onClick={deleteActiveMonth}>
                    Delete Month
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <nav className="view-tabs" aria-label="Contribution report views">
            {viewTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={tab.id === activeView ? 'tab-button active' : 'tab-button'}
                onClick={() => setActiveView(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="formula-strip">
            <span>Total Contribution</span>
            <strong>{formatMoney(totals.collected)}</strong>
            <span>+ Pending</span>
            <strong>{formatMoney(totals.pendingAmount)}</strong>
            <span>- Total Expense</span>
            <strong>{formatMoney(totals.spent)}</strong>
            <span>+ Opening Balance</span>
            <strong>{formatMoney(totals.openingBalance)}</strong>
            <span>= Expected Closing Balance</span>
            <strong className={totals.expectedBalance < 0 ? 'negative' : 'positive'}>{formatMoney(totals.expectedBalance)}</strong>
            <span>Active Members</span>
            <strong>{totals.activeCount}</strong>
          </div>

          {activeView === 'records' ? (
            <>
              <RecordsTable
                records={visibleRecords}
                totals={totals}
                onEdit={editRecord}
                canEdit={isManagerMode}
              />
              {isManagerMode ? (
                <ExpenseSection
                  form={expenseForm}
                  expenses={monthlyExpenses}
                  onFieldChange={updateExpenseField}
                  onSubmit={handleExpenseSubmit}
                  onCancel={resetExpenseForm}
                  onEdit={editExpense}
                  onDelete={deleteExpense}
                />
              ) : (
                <ExpenseSummary expenses={monthlyExpenses} />
              )}
            </>
          ) : null}

          {activeView === 'pending' ? (
            <ReportPage
              title="Pending Contribution List"
              records={statusReports.pending}
              emptyText="No pending members for this month."
            />
          ) : null}

          {activeView === 'na' ? (
            <ReportPage
              title="NA / Not Participated"
              records={statusReports.na}
              emptyText="No NA members for this month."
            />
          ) : null}

          {activeView === 'exempted' ? (
            <ReportPage
              title="Birthday Employees"
              records={statusReports.exempted}
              emptyText="No birthday employees marked for this month."
              showBirthDate={true}
            />
          ) : null}

          {activeView === 'banner' ? (
            <BirthdayBanner
              birthdayFor={activeBirthdayFor}
              month={activeMonth}
              birthdayEmployees={statusReports.exempted}
            />
          ) : null}
        </section>
      </section>
    </main>
  );
}

function MetricCard({ label, value, className = '', valueClassName = '' }) {
  return (
    <article className={`metric-card ${className}`.trim()}>
      <span>{label}</span>
      <strong className={valueClassName}>{value}</strong>
    </article>
  );
}

function RecordsTable({ records, totals, onEdit, canEdit }) {
  return (
    <div className="table-scroll">
      <table className={canEdit ? 'records-table editable-table' : 'records-table viewer-table'}>
        <thead>
          <tr>
            <th>Month</th>
            <th>Team Member Name</th>
            <th>Status</th>
            <th className="number-cell">Contribution Amount</th>
            <th className="number-cell">Total Balance</th>
            {canEdit ? <th>Action</th> : null}
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td className="empty-state" colSpan={canEdit ? 6 : 5}>No records found.</td>
            </tr>
          ) : (
            records.map((record) => (
              <RecordRow
                key={record.id}
                record={record}
                onEdit={onEdit}
                canEdit={canEdit}
              />
            ))
          )}
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            <th>Total</th>
            <th>
              Paid {totals.paidCount} / Pending {totals.pendingCount} / NA {totals.naCount}
            </th>
            <th className="number-cell">{formatMoney(totals.collected)}</th>
            <th className={`number-cell ${totals.closingBalance < 0 ? 'negative' : 'positive'}`}>
              {formatMoney(totals.closingBalance)}
            </th>
            {canEdit ? <th></th> : null}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function RecordRow({ record, onEdit, canEdit }) {
  return (
    <tr>
      <td>{record.birthdayMonth}</td>
      <td>{record.name}</td>
      <td>
        <span className={`status-pill ${record.status.toLowerCase()}`}>{record.status}</span>
      </td>
      <td className="number-cell">{formatMoney(record.contribution)}</td>
      <td className="number-cell muted-cell">-</td>
      {canEdit ? (
        <td>
        <div className="actions">
          <button type="button" className="action-button" onClick={() => onEdit(record)}>
            Edit
          </button>
        </div>
        </td>
      ) : null}
    </tr>
  );
}

function ExpenseSummary({ expenses }) {
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <section className="expense-panel">
      <div className="section-heading">
        <div>
          <h2>Monthly Expenses</h2>
          <p>Read-only expense summary</p>
        </div>
      </div>
      <div className="table-scroll">
        <table className="expense-table">
          <thead>
            <tr>
              <th>Expense Item</th>
              <th className="number-cell">Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td className="empty-state" colSpan="2">No expenses added for this month.</td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.item}</td>
                  <td className="number-cell">{formatMoney(expense.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <th>Total Expense</th>
              <th className="number-cell">{formatMoney(totalExpense)}</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

function ExpenseSection({ form, expenses, onFieldChange, onSubmit, onCancel, onEdit, onDelete }) {
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <section className="expense-panel">
      <div className="section-heading">
        <div>
          <h2>Monthly Expenses</h2>
          <p>Spent from total contribution amount</p>
        </div>
        {form.id ? (
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>

      <form className="expense-form" onSubmit={onSubmit}>
        <input
          type="hidden"
          value={form.birthdayMonth}
          onChange={(event) => onFieldChange('birthdayMonth', event.target.value)}
        />
        <label>
          Expense Item
          <input
            type="text"
            placeholder="Cake, snacks, decoration"
            value={form.item}
            onChange={(event) => onFieldChange('item', event.target.value)}
            required
          />
        </label>
        <label>
          Expense Amount
          <input
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={form.amount}
            onChange={(event) => onFieldChange('amount', event.target.value)}
            required
          />
        </label>
        <button type="submit" className="primary-button">
          {form.id ? 'Update Expense' : 'Add Expense'}
        </button>
      </form>

      <div className="table-scroll">
        <table className="expense-table">
          <thead>
            <tr>
              <th>Expense Item</th>
              <th className="number-cell">Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td className="empty-state" colSpan="3">No expenses added for this month.</td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.item}</td>
                  <td className="number-cell">{formatMoney(expense.amount)}</td>
                  <td>
                    <div className="actions">
                      <button type="button" className="action-button" onClick={() => onEdit(expense)}>
                        Edit
                      </button>
                      <button type="button" className="action-button danger" onClick={() => onDelete(expense)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <th>Total Expense</th>
              <th className="number-cell">{formatMoney(totalExpense)}</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

function ReportPage({ title, records, emptyText, showBirthDate = false, canEdit = false, onEdit = null }) {
  return (
    <section className="report-page">
      <div className="report-page-header">
        <h3>{title}</h3>
        <span>{records.length} members</span>
      </div>
      {records.length === 0 ? (
        <p className="empty-report">{emptyText}</p>
      ) : (
        <div className="table-scroll">
          <table className="report-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Team Member Name</th>
                <th>Status</th>
                {showBirthDate ? <th>Birth Date</th> : <th className="number-cell">Contribution Amount</th>}
                <th>Note</th>
                {canEdit ? <th>Action</th> : null}
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.birthdayMonth}</td>
                  <td>{record.name}</td>
                  <td><span className={`status-pill ${record.status.toLowerCase()}`}>{record.status}</span></td>
                  {showBirthDate ? (
                    <td>{record.birthDate ? new Date(record.birthDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '-'}</td>
                  ) : (
                    <td className="number-cell">{formatMoney(record.contribution)}</td>
                  )}
                  <td>{record.note || '-'}</td>
                  {canEdit ? (
                    <td>
                      <div className="actions">
                        <button type="button" className="action-button" onClick={() => onEdit && onEdit(record)}>
                          Edit
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function BirthdayBanner({ birthdayFor, month, birthdayEmployees }) {
  let names = '';
  
  const formatList = (list) => {
    if (list.length === 0) return '';
    if (list.length === 1) return list[0];
    const items = [...list];
    const last = items.pop();
    return `${items.join(', ')} & ${last}`;
  };

  if (birthdayEmployees.length > 0) {
    names = formatList(birthdayEmployees.map((record) => record.name));
  } else {
    const fallbackNames = birthdayFor.split(/,|&|and|\+/).map((n) => n.trim()).filter(Boolean);
    names = formatList(fallbackNames);
  }

  return (
    <section className="birthday-banner-page">
      <div className="birthday-banner">
        <div className="banner-ribbon">{formatMonthLabel(month)}</div>
        <p className="banner-kicker">Team Birthday Celebration</p>
        <h2>Happy Birthday</h2>
        <strong>{names}</strong>
        <p className="banner-message">
          Wishing you joy, success, great health, and a wonderful year ahead.
        </p>
        <div className="banner-footer">From all your teammates</div>
      </div>
    </section>
  );
}
