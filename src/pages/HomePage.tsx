import { useNavigate } from 'react-router-dom';
import { useUserContext } from '@/hooks/useUserContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function HomePage() {
  const { userName, logout } = useUserContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {userName}! 👋
          </h1>
          
          <p className="text-gray-600">
            You are successfully authenticated. You can now access the store visualization system.
          </p>
          
          <div className="space-y-3 pt-4">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigate('/stores')}
            >
              Go to Stores
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
