import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { SearchBar } from './SearchBar';

function ControlledSearchBar() {
  const [value, setValue] = useState('');
  return <SearchBar value={value} onChange={setValue} />;
}

describe('SearchBar', () => {
  it('renders with a placeholder and empty value', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    const input = screen.getByRole('textbox', { name: /search foods/i });
    expect(input).toHaveValue('');
  });

  it('calls onChange as the user types, updating the displayed value', async () => {
    const user = userEvent.setup();
    render(<ControlledSearchBar />);

    const input = screen.getByRole('textbox', { name: /search foods/i });
    await user.type(input, 'chick');

    expect(input).toHaveValue('chick');
  });
});
