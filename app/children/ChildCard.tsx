
'use client';
import { useState } from 'react';
import ChildDetailModal from './ChildDetailModal';

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

interface ChildCardProps {
  child: Child;
}

export default function ChildCard({ child }: ChildCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
        <div className="p-6">
          <div className="flex items-start space-x-4 mb-4">
            <img
              src={child.photo}
              alt={child.name}
              className="w-16 h-16 rounded-full object-cover object-top"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{child.name}</h3>
              <p className="text-sm text-gray-600">{child.age} años • {child.group}</p>
              <div className="flex items-center mt-1">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  child.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <span className={`text-xs font-medium ${
                  child.status === 'active' ? 'text-green-700' : 'text-gray-500'
                }`}>
                  {child.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <i className="ri-parent-line w-4 h-4 mr-3 flex items-center justify-center"></i>
              <span className="truncate">{child.guardianName}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <i className="ri-phone-line w-4 h-4 mr-3 flex items-center justify-center"></i>
              <span>{child.guardianPhone}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <i className="ri-calendar-line w-4 h-4 mr-3 flex items-center justify-center"></i>
              <span>Ingresó: {new Date(child.enrollmentDate).toLocaleDateString('es-CR')}</span>
            </div>
          </div>

          {(child.allergies !== 'Ninguna alergia conocida' && child.allergies) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center text-red-700">
                <i className="ri-alert-line w-4 h-4 mr-2 flex items-center justify-center"></i>
                <span className="text-xs font-medium">Alergias: {child.allergies}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowDetail(true)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm cursor-pointer whitespace-nowrap"
            >
              Ver Detalles
            </button>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
                <i className="ri-edit-line"></i>
              </button>
              <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer">
                <i className="ri-delete-bin-line"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDetail && (
        <ChildDetailModal child={child} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}
