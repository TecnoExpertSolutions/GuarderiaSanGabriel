
'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="ri-graduation-cap-line text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900" style={{fontFamily: '"Pacifico", serif'}}>San Gabriel</h1>
                <p className="text-sm text-gray-600">Daycare Center - Birri, Heredia</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Administración</h2>
            <p className="text-gray-600">Gestiona todos los aspectos del centro de cuidado infantil San Gabriel</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Niños</p>
                  <p className="text-2xl font-bold text-gray-900">145</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="ri-team-line text-blue-600 text-xl"></i>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Presentes Hoy</p>
                  <p className="text-2xl font-bold text-green-600">132</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="ri-checkbox-circle-line text-green-600 text-xl"></i>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Personal Activo</p>
                  <p className="text-2xl font-bold text-purple-600">24</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="ri-user-star-line text-purple-600 text-xl"></i>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reportes Generados</p>
                  <p className="text-2xl font-bold text-orange-600">12</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i className="ri-file-chart-line text-orange-600 text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Main Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/children" className="group">
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-blue-200 cursor-pointer">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <i className="ri-parent-line text-blue-600 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestión de Niños</h3>
                <p className="text-gray-600 mb-4">Administra los registros completos de cada niño, información personal, médica y de contacto</p>
                <div className="flex items-center text-blue-600 font-medium">
                  <span>Acceder</span>
                  <i className="ri-arrow-right-line ml-2"></i>
                </div>
              </div>
            </Link>

            <Link href="/attendance" className="group">
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-green-200 cursor-pointer">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <i className="ri-calendar-check-line text-green-600 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Control de Asistencia</h3>
                <p className="text-gray-600 mb-4">Registra y monitorea la asistencia diaria de los niños, horarios de entrada y salida</p>
                <div className="flex items-center text-green-600 font-medium">
                  <span>Acceder</span>
                  <i className="ri-arrow-right-line ml-2"></i>
                </div>
              </div>
            </Link>

            <Link href="/reports" className="group">
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-purple-200 cursor-pointer">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <i className="ri-file-chart-2-line text-purple-600 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Generación de Reportes</h3>
                <p className="text-gray-600 mb-4">Crea reportes detallados sobre asistencia, progreso y estadísticas generales</p>
                <div className="flex items-center text-purple-600 font-medium">
                  <span>Acceder</span>
                  <i className="ri-arrow-right-line ml-2"></i>
                </div>
              </div>
            </Link>

            <Link href="/users" className="group">
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-orange-200 cursor-pointer">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                  <i className="ri-admin-line text-orange-600 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestión de Usuarios</h3>
                <p className="text-gray-600 mb-4">Administra el personal, roles y permisos del sistema de la guardería</p>
                <div className="flex items-center text-orange-600 font-medium">
                  <span>Acceder</span>
                  <i className="ri-arrow-right-line ml-2"></i>
                </div>
              </div>
            </Link>

            <Link href="/search" className="group">
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-indigo-200 cursor-pointer">
                <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                  <i className="ri-search-2-line text-indigo-600 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Búsqueda y Filtros</h3>
                <p className="text-gray-600 mb-4">Busca y filtra registros de niños por múltiples criterios de forma rápida</p>
                <div className="flex items-center text-indigo-600 font-medium">
                  <span>Acceder</span>
                  <i className="ri-arrow-right-line ml-2"></i>
                </div>
              </div>
            </Link>

            <Link href="/settings" className="group">
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-gray-300 cursor-pointer">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
                  <i className="ri-settings-3-line text-gray-600 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Configuraciones</h3>
                <p className="text-gray-600 mb-4">Ajusta las configuraciones generales del sistema y preferencias</p>
                <div className="flex items-center text-gray-600 font-medium">
                  <span>Acceder</span>
                  <i className="ri-arrow-right-line ml-2"></i>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Actividad Reciente</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="ri-user-add-line text-blue-600"></i>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Nuevo niño registrado: María González</p>
                      <p className="text-sm text-gray-600">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <i className="ri-file-check-line text-green-600"></i>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Reporte mensual generado exitosamente</p>
                      <p className="text-sm text-gray-600">Hace 4 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <i className="ri-calendar-line text-purple-600"></i>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Asistencia registrada para 128 niños</p>
                      <p className="text-sm text-gray-600">Hoy a las 8:30 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
