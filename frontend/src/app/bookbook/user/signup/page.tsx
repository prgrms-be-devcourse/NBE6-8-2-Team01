'use client';

import React, { useState } from 'react';
import { FaUser, FaMapMarkerAlt } from 'react-icons/fa'; // react-icons에서 아이콘 임포트

const SignupPage = () => {
    const [nickname, setNickname] = useState('');
    const [address, setAddress] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // 닉네임 중복 확인 로직 (백엔드 API 호출 필요)
    const handleNicknameCheck = async () => {
        // TODO: 백엔드 API (예: /api/v1/users/check-nickname) 호출하여 닉네임 중복 확인
        console.log('닉네임 중복 확인:', nickname);
        alert(`'${nickname}' 닉네임 중복 확인 (구현 예정)`);
        // 예시: const response = await fetch('/api/v1/users/check-nickname', { method: 'POST', body: JSON.stringify({ nickname }) });
        // const data = await response.json();
        // if (data.isAvailable) { alert('사용 가능한 닉네임입니다.'); } else { alert('이미 사용 중인 닉네임입니다.'); }
    };

    // 폼 제출 로직
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // 기본 폼 제출 동작 방지

        if (!nickname.trim()) {
            alert('닉네임을 입력해주세요.');
            return;
        }
        if (!address.trim()) {
            alert('주소를 입력해주세요.');
            return;
        }
        if (!agreedToTerms) {
            alert('약관에 동의해야 회원가입을 할 수 있습니다.');
            return;
        }

        // TODO: 백엔드 API 호출하여 회원가입 처리
        console.log('회원가입 정보:', { nickname, address, agreedToTerms });
        alert('회원가입 정보 제출 (구현 예정)');
        // 예시: const response = await fetch('/api/v1/users/signup', { method: 'POST', body: JSON.stringify({ nickname, address }) });
        // if (response.ok) {
        //   alert('회원가입이 완료되었습니다!');
        //   // 회원가입 성공 후 메인 페이지 등으로 리다이렉트
        //   window.location.href = '/bookbook';
        // } else {
        //   alert('회원가입에 실패했습니다.');
        // }
    };

    return (
        <div className="font-sans bg-gray-100 flex items-center justify-center min-h-screen p-4">
            <div className="signup-container bg-white p-8 sm:px-10 rounded-lg shadow-lg w-full max-w-lg text-left">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">회원가입</h1>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="nickname" className="flex items-center font-bold text-gray-700 mb-2 text-lg">
                            <FaUser className="text-xl mr-2" /> 닉네임
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                id="nickname"
                                name="nickname"
                                placeholder="닉네임을 입력하세요"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="flex-grow p-3 border border-gray-300 rounded-md text-base focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 h-12"
                            />
                            <button
                                type="button"
                                onClick={handleNicknameCheck}
                                className="check-button bg-gray-800 text-white px-5 py-3 rounded-md cursor-pointer text-base whitespace-nowrap
                           hover:bg-gray-700 flex items-center justify-center h-12"
                            >
                                중복확인
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="address" className="flex items-center font-bold text-gray-700 mb-2 text-lg">
                            <FaMapMarkerAlt className="text-xl mr-2" /> 주소
                        </label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            placeholder="주소를 입력하세요"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md text-base focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 h-12"
                        />
                    </div>

                    <div className="terms-agreement bg-gray-50 border border-gray-200 p-4 rounded-md mt-8 mb-4 max-h-52 overflow-y-auto text-left text-sm text-gray-700 leading-relaxed">
                        <p className="font-bold text-gray-800 text-center mb-2 block text-base">복복 이용 약관</p>
                        <div className="terms-content">
                            <p className="mb-1">제 1조 (목적)</p>
                            <p className="mb-1">본 약관은 복복 서비스(이하 &apos;서비스&apos;)의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.</p>
                            <br/>
                            <p className="mb-1">제 2조 (정의)</p>
                            <p className="mb-1"><span className="list-num">①</span> &apos;회원&apos;은 본 약관에 동의하고 서비스를 이용하는 자를 의미합니다.</p>
                            <p className="mb-1"><span className="list-num">②</span> &apos;서비스&apos;는 복복이 제공하는 모든 관련 제반 서비스를 말합니다.</p>
                            <br/>
                            <p className="mb-1">제 3조 (약관의 효력 및 변경)</p>
                            <p className="mb-1"><span className="list-num">①</span> 본 약관은 서비스 웹사이트에 공시함으로써 효력이 발생합니다.</p>
                            <p className="mb-1"><span className="list-num">②</span> 회사는 필요한 경우 본 약관을 변경할 수 있으며, 변경된 약관은 공시 후 7일이 경과하면 효력이 발생합니다.</p>
                            <br/>
                            <p className="mb-1">제 4조 (회원 가입 및 탈퇴)</p>
                            <p className="mb-1"><span className="list-num">①</span> 회원이 되고자 하는 자는 본 약관에 동의하고, 회사가 정한 양식에 따라 개인정보를 기입하여 회원가입을 신청합니다.</p>
                            <p className="mb-1"><span className="list-num">②</span> 회사는 제1항에 따라 회원가입을 신청한 자 중 다음 각 호에 해당하는 경우 승낙을 거부할 수 있습니다.</p>
                            <p className="indent-item mb-1"><span className="list-num">1.</span> 가입신청자가 이전에 회원 자격을 상실한 적이 있는 경우 (단, 회사로부터 회원 재가입 승낙을 얻은 경우는 예외)</p>
                            <p className="indent-item mb-1"><span className="list-num">2.</span> 허위 내용을 등록한 경우</p>
                            <p className="indent-item mb-1"><span className="list-num">3.</span> 기타 본 약관에 위배되거나 위법 또는 부당한 이용 신청으로 판단되는 경우</p>
                            <p className="mb-1"><span className="list-num">③</span> 회원은 언제든지 서비스 내 회원 탈퇴 기능을 통해 탈퇴할 수 있습니다.</p>
                            <br/>
                            <p className="mb-1">제 5조 (개인정보 보호 의무)</p>
                            <p className="mb-1">회사는 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 사용에 대해서는 관련 법령 및 회사의 개인정보처리방침이 적용됩니다.</p>
                            <br/>
                            <p className="mb-1">제 6조 (회원의 의무)</p>
                            <p className="mb-1"><span className="list-num">①</span> 회원은 다음 행위를 하여서는 안 됩니다.</p>
                            <p className="indent-item mb-1"><span className="list-num">1.</span> 신청 또는 변경 시 허위 내용 등록</p>
                            <p className="indent-item mb-1"><span className="list-num">2.</span> 타인의 정보 도용</p>
                            <p className="indent-item mb-1"><span className="list-num">3.</span> 회사가 게시한 정보의 변경</p>
                            <p className="indent-item mb-1"><span className="list-num">4.</span> 회사 및 기타 제3자의 저작권 등 지적재산권에 대한 침해</p>
                            <p className="indent-item mb-1"><span className="list-num">5.</span> 회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</p>
                            <p className="mb-1"><span className="list-num">②</span> 회원은 관계 법령, 본 약관의 규정, 이용 안내 및 서비스와 관련하여 공지한 주의사항 등을 준수하여야 하며, 기타 회사의 업무에 방해되는 행위를 하여서는 안 됩니다.</p>
                            <br/>
                            <p className="mb-1">제 7조 (서비스의 변경 및 중단)</p>
                            <p className="mb-1"><span className="list-num">①</span> 회사는 상당한 이유가 있는 경우 운영상, 기술상의 필요에 따라 제공하고 있는 전부 또는 일부 서비스를 변경할 수 있습니다.</p>
                            <p className="mb-1"><span className="list-num">②</span> 회사는 다음 각 호의 어느 하나에 해당하는 경우 서비스의 전부 또는 일부를 제한하거나 중단할 수 있습니다.</p>
                            <p className="indent-item mb-1"><span className="list-num">1.</span> 서비스용 설비의 보수 등 공사로 인한 부득이한 경우</p>
                            <p className="indent-item mb-1"><span className="list-num">2.</span> 전기통신사업법에 규정된 기간통신사업자가 전기통신 서비스를 중단했을 경우</p>
                            <p className="indent-item mb-1"><span className="list-num">3.</span> 국가 비상사태, 정전, 서비스 설비의 장애 또는 이용 폭주 등으로 정상적인 서비스 이용에 지장이 있는 경우</p>
                            <p className="mb-1"><span className="list-num">③</span> 회사는 서비스의 변경 또는 중단으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 고의 또는 과실이 없는 한 책임을 부담하지 않습니다.</p>
                            <br/>
                            <p className="mb-1">제 8조 (손해배상)</p>
                            <p className="mb-1">회원 또는 회사가 본 약관의 의무를 위반하여 상대방에게 손해를 입힌 경우, 위반한 당사자는 발생한 손해를 배상하여야 합니다.</p>
                            <br/>
                            <p className="mb-1">제 9조 (준거법 및 재판관할)</p>
                            <p className="mb-1"><span className="list-num">①</span> 본 약관의 해석 및 회원과 회사 간의 분쟁에 대하여는 대한민국의 법률을 적용합니다.</p>
                            <p className="mb-1"><span className="list-num">②</span> 서비스 이용 중 발생한 분쟁에 대하여는 회사의 본사 소재지를 관할하는 법원을 전속 관할법원으로 합니다.</p>
                        </div>
                    </div>

                    <div className="terms-checkbox-group flex items-center justify-center mt-4 mb-8 text-base">
                        <input
                            type="checkbox"
                            id="agreeTerms"
                            name="agreeTerms"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="mr-2 w-5 h-5 cursor-pointer"
                        />
                        <label htmlFor="agreeTerms" className="font-bold cursor-pointer leading-tight text-gray-800 bg-yellow-50 px-3 py-2 rounded shadow-sm">
                            본인은 위 약관 내용을 확인하였으며, 동의합니다.
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full p-4 bg-gray-800 text-white font-bold text-lg rounded-md cursor-pointer
                       hover:bg-gray-700 transition-colors duration-300"
                    >
                        동의하고 가입하기
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;