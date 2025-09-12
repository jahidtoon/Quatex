import Sidebar from './components/Sidebar';

export default function AffiliateLayout({ children }) {
  return (
    <Sidebar>
      {children}
    </Sidebar>
  );
}
