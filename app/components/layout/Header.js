import { Database } from 'lucide-react';
import { DatabaseStatus } from '../common/DatabaseStatus';

export const Header = ({ connected }) => (
  <div className="bg-white shadow-sm border-b">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Database className="h-8 w-8 text-indigo-600" />
            Payroll System
          </h1>
          <p className="text-gray-600">Manage employees and calculate payroll with Supabase</p>
        </div>
        <DatabaseStatus connected={connected} />
      </div>
    </div>
  </div>
);