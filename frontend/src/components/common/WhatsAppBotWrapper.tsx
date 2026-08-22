'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import WhatsAppBot with SSR disabled to avoid hydration errors
const WhatsAppBot = dynamic(() => import('./WhatsAppBot'), {
    ssr: false,
    loading: () => null
});

const WhatsAppBotWrapper = () => {
    return <WhatsAppBot />;
};

export default WhatsAppBotWrapper; 