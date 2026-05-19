import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { StateBox } from '../StateBox';

describe('<StateBox />', () => {
  it('renders a loading variant with optional message', () => {
    const { queryByText } = render(
      <StateBox variant="loading" message="Carregando..." />
    );
    expect(queryByText('Carregando...')).not.toBeNull();
  });

  it('renders an error variant with title, message and retry button', () => {
    const onRetry = jest.fn();
    const { getByText } = render(
      <StateBox
        variant="error"
        title="Algo deu errado"
        message="Tente novamente."
        onRetry={onRetry}
      />
    );

    expect(getByText('Algo deu errado')).toBeTruthy();
    expect(getByText('Tente novamente.')).toBeTruthy();

    fireEvent.press(getByText('Tentar novamente'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('omits the retry button when onRetry is not provided', () => {
    const { queryByText } = render(
      <StateBox variant="empty" title="Vazio" message="Nada por aqui." />
    );
    expect(queryByText('Tentar novamente')).toBeNull();
  });

  it('supports a custom retry label', () => {
    const onRetry = jest.fn();
    const { getByText } = render(
      <StateBox
        variant="error"
        title="X"
        onRetry={onRetry}
        retryLabel="Voltar"
      />
    );
    expect(getByText('Voltar')).toBeTruthy();
  });
});
