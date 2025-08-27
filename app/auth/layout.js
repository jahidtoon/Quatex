import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Authentication - Qoutex',
  description: 'Sign in or create an account to access Qoutex trading platform',
};

export default function AuthLayout({ children }) {
  return (
    <div className={`${inter.className} min-h-screen bg-gray-900`}>
      {children}
    </div>
  );
}
