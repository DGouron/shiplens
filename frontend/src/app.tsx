import { Outlet } from 'react-router';

export function App() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

export function ShiplensShell() {
  return <p>Shiplens</p>;
}
