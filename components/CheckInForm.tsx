"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type CheckInFormProps = {
  onSubmit: (data: {
    moodScore: number;
    stressScore: number;
    sleepHours: number;
    energyScore: number;
    note: string;
  }) => Promise<void>;
  loading?: boolean;
};

export function CheckInForm({ onSubmit, loading }: CheckInFormProps) {
  const [values, setValues] = useState({
    moodScore: 6,
    stressScore: 5,
    sleepHours: 7,
    energyScore: 6,
    note: ""
  });

  function updateValue(name: keyof typeof values, value: string | number) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        void onSubmit(values);
      }}
    >
      <RangeField label="Mood" name="moodScore" value={values.moodScore} onChange={updateValue} />
      <RangeField label="Stress" name="stressScore" value={values.stressScore} onChange={updateValue} />
      <label className="label">
        Sleep hours
        <input
          className="input"
          max={14}
          min={0}
          onChange={(event) => updateValue("sleepHours", Number(event.target.value))}
          step={0.5}
          type="number"
          value={values.sleepHours}
        />
      </label>
      <RangeField label="Energy" name="energyScore" value={values.energyScore} onChange={updateValue} />
      <label className="label">
        What's on your mind today?
        <textarea
          className="input min-h-28 resize-y"
          onChange={(event) => updateValue("note", event.target.value)}
          placeholder="One honest sentence is enough."
          value={values.note}
        />
      </label>
      <button className="primary-button" disabled={loading} type="submit">
        {loading ? "Saving check-in..." : "Save check-in"}
      </button>
    </form>
  );
}

function RangeField({
  label,
  name,
  value,
  onChange
}: {
  label: string;
  name: "moodScore" | "stressScore" | "energyScore";
  value: number;
  onChange: (name: "moodScore" | "stressScore" | "energyScore", value: number) => void;
}) {
  return (
    <label className="label">
      <span>
        {label}: <strong>{value}</strong>/10
      </span>
      <input
        className="h-3 accent-ayuva-green"
        max={10}
        min={1}
        onChange={(event) => onChange(name, Number(event.target.value))}
        type="range"
        value={value}
      />
    </label>
  );
}
