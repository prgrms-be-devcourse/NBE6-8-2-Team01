'use client';

import React from 'react';
import HeroSection from "./mainpage/HeroSection";
import BookRegionSection from '../components/BookRegionSection';
import SuspensionModal from '../components/SuspensionModal';
import { useUserStatusCheck } from '../hooks/useUserStatusCheck';

export default function Home() {
    const { isSuspended, isLoaded } = useUserStatusCheck();

    if (!isLoaded) {
        return (
            <main>
                <HeroSection />
                <BookRegionSection />
            </main>
        );
    }

    return (
        <main>
            <HeroSection />
            <BookRegionSection />
            {isSuspended && <SuspensionModal />}
        </main>
    );
}