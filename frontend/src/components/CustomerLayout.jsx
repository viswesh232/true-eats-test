import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const CustomerLayout = ({ children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default CustomerLayout;
