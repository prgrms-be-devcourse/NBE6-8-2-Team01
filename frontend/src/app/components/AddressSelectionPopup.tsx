"use client";

import React, { useState } from 'react';
// JSON 파일을 직접 import 합니다. Next.js에서는 public 폴더의 JSON 파일을 직접 import 할 수 있습니다.
import koreaAdministrativeDistrictData from '../../../public/korea-administrative-district.json';

// AddressSelectionPopup 컴포넌트의 props 타입을 정의.
interface AddressSelectionPopupProps {
    isOpen: boolean,
    onClose: () => void;
    onSelectAddress: (address: string) => void;
}

// 행정 구역 데이터 내 각 시/도 객체의 타입
interface ProvinceData {
    [key: string]: string[]; // 예: {"서울 특별시": ["종로구", "ㅁㅁ구"]}
}

// 전체 행정 구역 데이터 구조의 타입
interface KoreaAdministrativeDistrict{
    name: string;
    version: string;
    url: string;
    data: ProvinceData[];
}

// koreaAdministrativeDistrictData를 명시적으로 타입 캐스팅
const typedKoreaAdministrativeDistrictData: KoreaAdministrativeDistrict = koreaAdministrativeDistrictData as unknown as KoreaAdministrativeDistrict;

const AddressSelectionPopup = ({ isOpen, onClose, onSelectAddress }: AddressSelectionPopupProps) => {
    // import한 데이터를 사용합니다.
    const provinces = koreaAdministrativeDistrictData.data.map(item => Object.keys(item)[0]);

    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [districts, setDistricts] = useState<string[]>([]);

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const province = e.target.value;
        setSelectedProvince(province);
        setSelectedDistrict('');
        // 'found' 변수의 타입을 명확히 하여 'found[province]' 에러 해결
        const found = typedKoreaAdministrativeDistrictData.data.find(item => Object.keys(item)[0] === province);
        setDistricts(found ? (found[province] as string[]) : []);
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDistrict(e.target.value);
    };

    const handleSelect = () => {
        if (selectedProvince) {
            const fullAddress = selectedDistrict ? `${selectedProvince} ${selectedDistrict}` : selectedProvince;
            onSelectAddress(fullAddress);
            onClose();
        } else {
            console.warn('시/도를 선택해주세요.');
            // 팝업 내부에서 직접 토스트를 띄우고 싶다면, showToast 함수를 props로 전달받거나
            // 전역 상태 관리 (예: Context API, Zustand)를 통해 접근해야 합니다.
        }
    };

    if (!isOpen) return null;

    return ( 
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">주소 선택</h3>

                <div className="mb-4">
                    <label htmlFor="province-select" className="block text-gray-700 text-sm font-bold mb-2">
                        시/도 선택
                    </label>
                    <select
                        id="province-select"
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={selectedProvince}
                        onChange={handleProvinceChange}
                    >
                        <option value="">시/도를 선택하세요</option>
                        {provinces.map((province, index) => (
                            <option key={index} value={province}>
                                {province}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-6">
                    <label htmlFor="district-select" className="block text-gray-700 text-sm font-bold mb-2">
                        구/군 선택
                    </label>
                    <select
                        id="district-select"
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={selectedDistrict}
                        onChange={handleDistrictChange}
                        disabled={!selectedProvince || districts.length === 0}
                    >
                        <option value="">구/군을 선택하세요</option>
                        {districts.map((district, index) => (
                            <option key={index} value={district}>
                                {district}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-md transition duration-150"
                    >
                        닫기
                    </button>
                    <button
                        onClick={handleSelect}
                        className="bg-[#D5BAA3] hover:bg-[#C2A794] text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-150"
                    >
                        선택 완료
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddressSelectionPopup;