
import { useState, useEffect } from 'react';

const ROUTE_STORAGE_KEY = 'drishti_current_route';

export const useRouteState = () => {
  const [currentRoute, setCurrentRoute] = useState(() => {
    // Get saved route from localStorage or default to 'overview'
    return localStorage.getItem(ROUTE_STORAGE_KEY) || 'overview';
  });

  useEffect(() => {
    // Save route to localStorage whenever it changes
    localStorage.setItem(ROUTE_STORAGE_KEY, currentRoute);
  }, [currentRoute]);

  const updateRoute = (route: string) => {
    setCurrentRoute(route);
  };

  return { currentRoute, updateRoute };
};
