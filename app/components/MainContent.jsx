import React from 'react';
// Chart import removed as per request
// PairTabs import removed as per request
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

import { useState } from 'react';

const TradePage = () => {
  const [symbol, setSymbol] = useState('BTC/USDT');
  return (
    <div className="flex flex-1 flex-col min-h-0 bg-[#0f172a]">
      <div className="px-3 py-2 bg-[#0f172a]">
    {/* PairTabs removed as per request */}
      </div>
      <div className="flex flex-1 flex-row min-h-0">
  {/* Chart removed as per request */}
  {/* TradePanel removed as per request */}
      </div>
    </div>
  );
};

const MainContent = ({ currentPage, setCurrentPage }) => {
  switch (currentPage) {
    case 'trade':
  return <TradePage key={symbol} />;
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
