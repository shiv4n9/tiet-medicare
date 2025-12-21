import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Generate breadcrumb items from current path if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', path: '/', icon: <Home className="w-4 h-4" /> }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Capitalize and format segment names
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Handle specific route names
      switch (segment) {
        case 'admin':
          label = 'Admin Dashboard';
          break;
        case 'doctor':
          label = 'Doctor Dashboard';
          break;
        case 'patient':
          label = 'Patient Dashboard';
          break;
        case 'my-appointments':
          label = 'My Appointments';
          break;
        default:
          label = segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }

      breadcrumbs.push({
        label,
        path: index === pathSegments.length - 1 ? undefined : currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  const handleNavigation = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          )}
          
          {item.path ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation(item.path)}
              className="h-auto p-1 font-normal text-gray-600 hover:text-medical-blue-600 dark:text-gray-400 dark:hover:text-medical-blue-400"
            >
              <div className="flex items-center space-x-1">
                {item.icon}
                <span>{item.label}</span>
              </div>
            </Button>
          ) : (
            <span className="flex items-center space-x-1 font-medium text-gray-900 dark:text-white">
              {item.icon}
              <span>{item.label}</span>
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;