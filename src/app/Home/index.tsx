import { LocalizedLink } from '@/i18n/components/LocalizedLink';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            K Cloud
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Coming Soon
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <LocalizedLink 
            to="/dash" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Dashboard
          </LocalizedLink>
          <LocalizedLink 
            to="/login"
            className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            Login
          </LocalizedLink>
        </div>
      </div>
    </div>
  );
}
