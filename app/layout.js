import './globals.css';
import { Inter } from 'next/font/google';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { AuthProvider } from '@/lib/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Quatex Trading UI',
  description: 'Trading platform UI clone',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-main text-main">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
