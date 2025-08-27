// src/App.tsx

import React from 'react';
import { Layout } from './components/Layout'; // We created this component in the previous step

function App(): JSX.Element {
  // This now correctly uses our professional layout
  return <Layout />;
}

export default App;