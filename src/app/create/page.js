'use client';
import './create.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePollPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const addOption = () => setOptions([...options, '']);
  const removeOption = (index) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };
  const handleOptionChange = (value, index) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/create', {
      method: 'POST',
      body: JSON.stringify({ title, question, options }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/create/success?id=${data.pollId}`);
    } else {
      alert('Error creating poll');
    }
  };

  return (
    <main className="container">
  <h1>Create a New Poll</h1>
  <form onSubmit={handleSubmit}>
    <input
      type="text"
      placeholder="Poll Title"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      required
    />

    <textarea
      placeholder="Poll Question"
      value={question}
      onChange={(e) => setQuestion(e.target.value)}
      required
    />

    <h3>Options:</h3>
    {options.map((opt, i) => (
      <div className="option-row" key={i}>
        <input
          type="text"
          placeholder={`Option ${i + 1}`}
          value={opt}
          onChange={(e) => handleOptionChange(e.target.value, i)}
          required
        />
        {options.length > 2 && (
          <button type="button" onClick={() => removeOption(i)}>✖</button>
        )}
      </div>
    ))}

    <button type="button" onClick={addOption} className="add-button">
    Add Option
    </button>

    <button type="submit" className="submit-button">
      Publish Poll
    </button>
  </form>
</main>

  );
}
