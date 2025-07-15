
'use client';
import { useState } from 'react';
import Header from '../../components/Header';
import ChildCard from './ChildCard';
import AddChildModal from './AddChildModal';

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

export default function ChildrenPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');

  const mockChildren: Child[] = [
    {
      id: '1',
      name: 'María González Rodríguez',
      age: 4,
      birthDate: '2020-03-15',
      guardianName: 'Ana Rodríguez',
      guardianPhone: '+506 8888-1234',
      guardianEmail: 'ana.rodriguez@email.com',
      emergencyContact: 'Carlos González',
      emergencyPhone: '+506 8888-5678',
      medicalInfo: 'Ninguna condición médica especial',
      allergies: 'Alergia a los mariscos',
      status: 'active',
      enrollmentDate: '2023-01-15',
      photo: 'https://readdy.ai/api/search-image?query=beautiful%20happy%204%20year%20old%20Costa%20Rican%20girl%20with%20curly%20dark%20hair%2C%20bright%20smile%2C%20wearing%20colorful%20daycare%20clothes%2C%20professional%20portrait%20style%2C%20warm%20lighting%2C%20simple%20clean%20background&width=400&height=400&seq=child1&orientation=squarish',
      group: 'Grupo Arcoíris'
    },
    {
      id: '2',
      name: 'Diego Méndez Salas',
      age: 3,
      birthDate: '2021-07-22',
      guardianName: 'Carmen Salas',
      guardianPhone: '+506 8888-2345',
      guardianEmail: 'carmen.salas@email.com',
      emergencyContact: 'José Méndez',
      emergencyPhone: '+506 8888-6789',
      medicalInfo: 'Asma leve controlada',
      allergies: 'Polen y ácaros',
      status: 'active',
      enrollmentDate: '2023-02-20',
      photo: 'https://readdy.ai/api/search-image?query=adorable%203%20year%20old%20Costa%20Rican%20boy%20with%20dark%20hair%2C%20playful%20expression%2C%20wearing%20casual%20daycare%20outfit%2C%20professional%20portrait%20style%2C%20warm%20lighting%2C%20simple%20clean%20background&width=400&height=400&seq=child2&orientation=squarish',
      group: 'Grupo Estrellitas'
    },
    {
      id: '3',
      name: 'Sofía Vargas Jiménez',
      age: 5,
      birthDate: '2019-11-08',
      guardianName: 'Patricia Jiménez',
      guardianPhone: '+506 8888-3456',
      guardianEmail: 'patricia.jimenez@email.com',
      emergencyContact: 'Roberto Vargas',
      emergencyPhone: '+506 8888-7890',
      medicalInfo: 'Usa lentes para miopía',
      allergies: 'Ninguna alergia conocida',
      status: 'active',
      enrollmentDate: '2022-08-10',
      photo: 'https://readdy.ai/api/search-image?query=beautiful%205%20year%20old%20Costa%20Rican%20girl%20with%20long%20dark%20hair%2C%20wearing%20glasses%2C%20sweet%20smile%2C%20colorful%20daycare%20clothes%2C%20professional%20portrait%20style%2C%20warm%20lighting%2C%20simple%20clean%20background&width=400&height=400&seq=child3&orientation=squarish',
      group: 'Grupo Mariposas'
    },
    {
      id: '4',
      name: 'Mateo Hernández Cruz',
      age: 2,
      birthDate: '2022-05-12',
      guardianName: 'Elena Cruz',
      guardianPhone: '+506 8888-4567',
      guardianEmail: 'elena.cruz@email.com',
      emergencyContact: 'Miguel Hernández',
      emergencyPhone: '+506 8888-8901',
      medicalInfo: 'Desarrollo normal',
      allergies: 'Alergia a los frutos secos',
      status: 'active',
      enrollmentDate: '2023-09-05',
      photo: 'https://readdy.ai/api/search-image?query=cute%202%20year%20old%20Costa%20Rican%20toddler%20boy%20with%20short%20dark%20hair%2C%20happy%20expression%2C%20wearing%20bright%20daycare%20clothes%2C%20professional%20portrait%20style%2C%20warm%20lighting%2C%20simple%20clean%20background&width=400&height=400&seq=child4&orientation=squarish',
      group: 'Grupo Pollitos'
    },
    {
      id: '5',
      name: 'Isabella Mora Castillo',
      age: 4,
      birthDate: '2020-09-30',
      guardianName: 'Lucía Castillo',
      guardianPhone: '+506 8888-5678',
      guardianEmail: 'lucia.castillo@email.com',
      emergencyContact: 'Fernando Mora',
      emergencyPhone: '+506 8888-9012',
      medicalInfo: 'Ninguna condición especial',
      allergies: 'Lactosa',
      status: 'active',
      enrollmentDate: '2023-03-12',
      photo: 'https://readdy.ai/api/search-image?query=lovely%204%20year%20old%20Costa%20Rican%20girl%20with%20wavy%20dark%20hair%2C%20bright%20eyes%2C%20cheerful%20smile%2C%20wearing%20colorful%20daycare%20uniform%2C%20professional%20portrait%20style%2C%20warm%20lighting%2C%20simple%20clean%20background&width=400&height=400&seq=child5&orientation=squarish',
      group: 'Grupo Arcoíris'
    },
    {
      id: '6',
      name: 'Gabriel Quesada López',
      age: 3,
      birthDate: '2021-01-18',
      guardianName: 'Mónica López',
      guardianPhone: '+506 8888-6789',
      guardianEmail: 'monica.lopez@email.com',
      emergencyContact: 'Daniel Quesada',
      emergencyPhone: '+506 8888-0123',
      medicalInfo: 'Alergia alimentaria controlada',
      allergies: 'Huevos y leche',
      status: 'active',
      enrollmentDate: '2023-04-08',
      photo: 'https://readdy.ai/api/search-image?query=handsome%203%20year%20old%20Costa%20Rican%20boy%20with%20curly%20dark%20hair%2C%20friendly%20smile%2C%20wearing%20casual%20daycare%20clothes%2C%20professional%20portrait%20style%2C%20warm%20lighting%2C%20simple%20clean%20background&width=400&height=400&seq=child6&orientation=squarish',
      group: 'Grupo Estrellitas'
    }
  ];

  const filteredChildren = mockChildren.filter(child => {
    const matchesSearch = child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         child.guardianName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || child.status === filterStatus;
    const matchesGroup = filterGroup === 'all' || child.group === filterGroup;
    
    return matchesSearch && matchesStatus && matchesGroup;
  });

  const groups = ['all', 'Grupo Pollitos', 'Grupo Estrellitas', 'Grupo Arcoíris', 'Grupo Mariposas'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Niños</h1>
              <p className="text-gray-600">Administra los registros completos de cada niño</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer flex items-center space-x-2"
            >
              <i className="ri-add-line"></i>
              <span>Agregar Niño</span>
            </button>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por nombre del niño o tutor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <i className="ri-search-line text-gray-400"></i>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-8"
                >
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grupo</label>
                <select
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-8"
                >
                  {groups.map(group => (
                    <option key={group} value={group}>
                      {group === 'all' ? 'Todos los Grupos' : group}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Mostrando {filteredChildren.length} de {mockChildren.length} niños
            </p>
            <div className="flex items-center space-x-2">
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <i className="ri-grid-line text-gray-600"></i>
              </button>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <i className="ri-list-check text-gray-600"></i>
              </button>
            </div>
          </div>

          {/* Children Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChildren.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>

          {filteredChildren.length === 0 && (
            <div className="text-center py-12">
              <i className="ri-search-line text-gray-300 text-6xl mb-4"></i>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
              <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </div>
      </main>

      {showAddModal && (
        <AddChildModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
