import React from 'react';
import { Navigate } from 'react-router-dom';

// This page is no longer in use as teachers now see a direct list of their students on the dashboard.
// Redirecting to the teacher dashboard to handle any old bookmarks or routes.
const ClassPage: React.FC = () => {
  return <Navigate to="/teacher" />;
};

export default ClassPage;
