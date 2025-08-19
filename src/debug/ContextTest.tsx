import React from 'react';

// Test individual context hooks to identify which one is failing
export const ContextTest: React.FC = () => {
  try {
    // Test each context individually
    console.log('Testing contexts...');
    
    // 1. Test useNetWorth first
    require('../hooks/useNetWorth');
    console.log('useNetWorth imported successfully');
    
    // 2. Test useSavingsGoals
    require('../hooks/useSavingsGoals');
    console.log('useSavingsGoals imported successfully');
    
    // 3. Test the PlanningProvider
    require('../contexts/PlanningContext');
    console.log('PlanningContext imported successfully');
    
    return (
      <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '10px' }}>
        <h3>Context Debugging</h3>
        <p>All contexts imported successfully. Check console for details.</p>
      </div>
    );
  } catch (error) {
    console.error('Context test error:', error);
    return (
      <div style={{ padding: '20px', backgroundColor: '#ffebee', margin: '10px' }}>
        <h3>Context Error Detected</h3>
        <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <pre>{error instanceof Error ? error.stack : 'No stack trace'}</pre>
      </div>
    );
  }
};
