import { useCallback } from 'react';

function QnA() {
  // Debounce the input change handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only update the input state, not the questions state
    setInputValue(value);
  }, []);

  // Separate function to handle the actual question submission
  const handleSubmit = useCallback(() => {
    if (inputValue.trim()) {
      setQuestions(prev => [...prev, inputValue]);
      setInputValue(''); // Clear input after adding
    }
  }, [inputValue]);

  return (
    <div>
      <input
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSubmit();
          }
        }}
      />
    </div>
  );
}

export default QnA; 