'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { label: 'Daily Mail', href: '/dashboard/services/rotary3012/daily', icon: '📧' },
  { label: 'Personal Email', href: '/dashboard/services/rotary3012/personal', icon: '👤' },
  { label: 'WhatsApp', href: '/dashboard/services/rotary3012/whatsapp', icon: '✅' },
];

export default function RotaryNavbar() {
  const pathname = usePathname();
  const saasHref = '/dashboard/services/rotary3012/saas';

  return (
    <div className="max-w-7xl mx-auto mb-4 flex justify-between items-center">
      
      {/* Left side tabs */}
      <div className="inline-flex bg-gray-100 border border-gray-300 rounded-md p-1 gap-1">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition
                ${
                  active
                    ? 'bg-blue-600 text-white shadow-inner'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Right side SAAS link */}
      <Link
        href={saasHref}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition border
          ${
            pathname.startsWith(saasHref)
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }
        `}
      >
        🚀 SAAS
      </Link>

    </div>
  );
}
