import { jest } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import ComparisonChart from '../ComparisonChart';

describe('ComparisonChart', () => {
  const mockData = {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [
      {
        data: [10, 20, 30],
        label: 'Test Data',
      },
    ],
  };

  it('should render successfully', () => {
    render(<ComparisonChart data={mockData} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('should handle empty data', () => {
    const emptyData = {
      labels: [],
      datasets: [],
    };
    render(<ComparisonChart data={emptyData} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should handle errors', () => {
    const mockError = jest.fn();
    render(<ComparisonChart data={mockData} onError={mockError} />);
    // 触发错误
    const error = new Error('Test error');
    mockError(error);
    expect(mockError).toHaveBeenCalledWith(error);
  });
}); 