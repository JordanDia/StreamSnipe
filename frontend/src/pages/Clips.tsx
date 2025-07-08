import React from 'react';
import Sidebar from '../components/Sidebar';
import ClipsGrid from '../components/ClipsGrid';
import { useLocation } from 'react-router-dom';

const Clips = () => {
    const location = useLocation();
    const clips = location.state?.clips || [];
    return (
        <div className="bg-background-dark flex flex-col min-h-screen text-white">
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <div className="flex flex-col flex-1 overflow-auto">
                    <ClipsGrid clips={clips} />
                </div>
            </div>
        </div>
    );
};

export default Clips;
