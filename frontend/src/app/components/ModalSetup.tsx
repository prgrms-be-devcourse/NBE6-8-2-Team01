'use client';

import { useEffect } from 'react';
import Modal from 'react-modal';

export default function ModalSetup() {
    useEffect(() => {
        const checkAndSetAppElement = () => {
            if (typeof window !== 'undefined') {
                const appElement = document.querySelector('#__next');
                if (appElement instanceof HTMLElement) {
                    Modal.setAppElement(appElement);
                    console.log('react-modal 설정 완료: #__next');
                } else if (appElement === null) {
                    setTimeout(checkAndSetAppElement, 100);
                }
            }
        };

        checkAndSetAppElement();
    }, []);

    return null;
}