import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            <Navbar />
            <main className="flex-grow pt-10"> {/* pt-20 accounts for fixed navbar */}
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
