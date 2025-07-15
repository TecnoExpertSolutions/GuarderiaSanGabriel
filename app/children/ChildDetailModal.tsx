
'use client';

interface Child {
  id: string;
  name: string;
  age: number;
  birthDate: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalInfo: string;
  allergies: string;
  status: 'active' | 'inactive';
  enrollmentDate: string;
  photo: string;
  group: string;
}

interface ChildDetailModalProps {
  child: Child;
  onClose: () => void;
}

export default function ChildDetailModal({ child, onClose }: ChildDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Información Completa del Niño</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            <i className="ri-close-line text-2xl text-gray-500"></i>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Photo and Basic Info */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <img
                  src={child.photo}
                  alt={child.name}
                  className="w-32 h-32 rounded-full object-cover object-top mx-auto mb-4"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{child.name}</h3>
                <div className="flex items-center justify-center mb-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    child.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    child.status === 'active' ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {child.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p className="text-gray-600">{child.age} años • {child.group}</p>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 space-y-3">
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                  <i className="ri-edit-line mr-2"></i>
                  Editar Información
                </button>
                <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap">
                  <i className="ri-calendar-check-line mr-2"></i>
                  Registrar Asistencia
                </button>
                <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors cursor-pointer whitespace-nowrap">
                  <i className="ri-file-chart-line mr-2"></i>
                  Ver Reportes
                </button>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i className="ri-user-line mr-2"></i>
                    Información Personal
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                      <p className="text-gray-900 mt-1">{new Date(child.birthDate).toLocaleDateString('es-CR')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Edad</label>
                      <p className="text-gray-900 mt-1">{child.age} años</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Grupo Asignado</label>
                      <p className="text-gray-900 mt-1">{child.group}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Ingreso</label>
                      <p className="text-gray-900 mt-1">{new Date(child.enrollmentDate).toLocaleDateString('es-CR')}</p>
                    </div>
                  </div>
                </div>

                {/* Guardian Information */}
                <div className="bg-green-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i className="ri-parent-line mr-2"></i>
                    Información del Tutor
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre del Tutor</label>
                      <p className="text-gray-900 mt-1">{child.guardianName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <p className="text-gray-900 mt-1">{child.guardianPhone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                      <p className="text-gray-900 mt-1">{child.guardianEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-orange-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i className="ri-phone-line mr-2"></i>
                    Contacto de Emergencia
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre</label>
                      <p className="text-gray-900 mt-1">{child.emergencyContact}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <p className="text-gray-900 mt-1">{child.emergencyPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="bg-red-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i className="ri-heart-pulse-line mr-2"></i>
                    Información Médica
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Información Médica General</label>
                      <p className="text-gray-900 mt-1 bg-white p-3 rounded-lg border">{child.medicalInfo}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Alergias</label>
                      <div className="mt-1">
                        {child.allergies !== 'Ninguna alergia conocida' && child.allergies ? (
                          <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                            <div className="flex items-center text-red-800">
                              <i className="ri-alert-line mr-2"></i>
                              <span className="font-medium">{child.allergies}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-600 bg-white p-3 rounded-lg border">Ninguna alergia conocida</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-purple-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i className="ri-history-line mr-2"></i>
                    Actividad Reciente
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="ri-checkbox-circle-line text-green-600 text-sm"></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Asistencia registrada</p>
                        <p className="text-xs text-gray-600">Hoy a las 8:15 AM</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="ri-edit-line text-blue-600 text-sm"></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Información médica actualizada</p>
                        <p className="text-xs text-gray-600">Hace 3 días</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <i className="ri-file-line text-purple-600 text-sm"></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Reporte mensual generado</p>
                        <p className="text-xs text-gray-600">Hace 1 semana</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
