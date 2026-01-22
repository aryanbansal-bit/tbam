import { Inter } from 'next/font/google';
import '@/app/globals.css';
import Navbar from '@/app/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Rotary Management',
  description: 'Rotary Club Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}