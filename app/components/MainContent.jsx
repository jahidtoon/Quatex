import React from 'react';
import Chart from './Chart';
import TradePanel from './TradePanel';
import Deposit from './pages/Deposit';
import Withdrawal from './pages/Withdrawal';
import Support from './pages/Support';
import FAQ from './pages/FAQ';
import Tutorials from './pages/Tutorials';
import SupportContact from './pages/SupportContact';
import Account from './pages/Account';
import P2P from './pages/P2P';
import BuyCrypto from './pages/BuyCrypto';
import SellCrypto from './pages/SellCrypto';
import EditProfile from './pages/EditProfile';
import Tournaments from './pages/Tournaments';
import Market from './pages/Market';
import Analytics from './pages/Analytics';
import TOP from './pages/TOP';
import Signals from './pages/Signals';
import Settings from './pages/Settings';
// import More from './pages/More';
import JoinUs from './pages/JoinUs';
import LeaderBoard from './pages/LeaderBoard';

const TradePage = () => (
  <div className="flex flex-1 flex-row">
    <Chart />
    <TradePanel />
  </div>
);

const MainContent = ({ currentPage, setCurrentPage }) => {
  switch (currentPage) {
    case 'trade':
      return <TradePage />;
    case 'analytics':
      return <Analytics />;
    case 'top':
      return <TOP />;
    case 'signals':
      return <Signals />;
    case 'deposit':
      return <Deposit setCurrentPage={setCurrentPage} />;
    case 'withdrawal':
      return <Withdrawal setCurrentPage={setCurrentPage} />;
    case 'support':
      return <Support setCurrentPage={setCurrentPage} />;
    case 'faq':
      return <FAQ setCurrentPage={setCurrentPage} />;
    case 'tutorials':
      return <Tutorials setCurrentPage={setCurrentPage} />;
    case 'support-contact':
      return <SupportContact setCurrentPage={setCurrentPage} />;
    case 'account':
      return <Account setCurrentPage={setCurrentPage} />;
    case 'edit-profile':
      return <EditProfile setCurrentPage={setCurrentPage} />;
    case 'tournaments':
      return <Tournaments />;
    case 'market':
      return <Market />;
    case 'settings':
      return <Settings />;
    case 'p2p':
      return <P2P setCurrentPage={setCurrentPage} />;
    case 'buy-crypto':
      return <BuyCrypto />;
    case 'sell-crypto':
      return <SellCrypto />;
  // case 'more':
  //   return <More setCurrentPage={setCurrentPage} />;
    case 'join-us':
      return <JoinUs />;
    default:
      return <TradePage />;
  }
};
export default MainContent;
