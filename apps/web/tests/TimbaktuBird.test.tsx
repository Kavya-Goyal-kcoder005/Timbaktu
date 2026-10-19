import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TimbaktuBird } from '../src/components/mascot/TimbaktuBird';

describe('TimbaktuBird Mascot Component', () => {
  it('renders mascot in idle state with accessible role and label', () => {
    render(<TimbaktuBird state="idle" />);
    const mascot = screen.getByRole('img', { name: /Timbaktu the Cuckoo mascot in idle state/i });
    expect(mascot).toBeInTheDocument();
  });

  it('renders mascot in dancing state', () => {
    render(<TimbaktuBird state="dancing" />);
    const mascot = screen.getByRole('img', { name: /dancing state/i });
    expect(mascot).toBeInTheDocument();
  });

  it('displays speech bubble when showSpeechBubble is true', () => {
    render(
      <TimbaktuBird
        state="dancing"
        showSpeechBubble={true}
        speechText="Tu tu tu tu... Timbaktu!"
      />
    );
    expect(screen.getByText('Tu tu tu tu... Timbaktu!')).toBeInTheDocument();
  });
});
