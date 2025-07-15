
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: 'ri-dashboard-line' },
    { name: 'Niños', href: '/children', icon: 'ri-parent-line' },
    { name: 'Asistencia', href: '/attendance', icon: 'ri-calendar-check-line' },
    { name: 'Reportes', href: '/reports', icon: 'ri-file-chart-2-line' },
    { name: 'Usuarios', href: '/users', icon: 'ri-admin-line' },
    { name: 'Búsqueda', href: '/search', icon: 'ri-search-2-line' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="ri-graduation-cap-line text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900" style={{fontFamily: '"Pacifico", serif'}}>San Gabriel</h1>
              <p className="text-sm text-gray-600">Daycare Center - Birri, Heredia</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <i className={`${item.icon} text-base`}></i>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer">
              <i className="ri-notification-3-line text-xl"></i>
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-600">Administrator</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-user-line text-blue-600"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
