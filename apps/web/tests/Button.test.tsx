import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '../src/components/shared/Button';

describe('Button Component', () => {
  it('renders button with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies disabled state when disabled prop is provided', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders loading state and disables button', () => {
    render(<Button isLoading>Loading Action</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
