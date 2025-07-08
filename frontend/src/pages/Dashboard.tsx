import Sidebar from '../components/Sidebar';
import { MainContent } from '../components/MainContent';
import { ProjectList } from '../components/ProjectList';
import { useLocation } from 'react-router-dom';
import Channel from './Channel';
import VodWorkflow from './VodWorkflow';

const Dashboard = () => {
    const location = useLocation();

    return (
        <div className="bg-background-dark flex flex-col min-h-screen text-white">
            {/* <TopNav /> */}
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <div className="flex flex-col flex-1 overflow-auto">
                    {location.pathname === '/dashboard' && (
                        <>
                            <MainContent />
                            <ProjectList />
                        </> 
                    )}
                    {location.pathname.startsWith('/channel/') && (
                        <Channel />
                    )}

                    {location.pathname.endsWith("/workflow") && (
                        <VodWorkflow />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
