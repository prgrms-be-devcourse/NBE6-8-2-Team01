import { UserDetailResponseDto } from "../../../_types/userResponseDto";

interface SuspendFormProps {
  user: UserDetailResponseDto;
  suspendPeriod: string;
  setSuspendPeriod: (period: string) => void;
  suspendReason: string;
  setSuspendReason: (reason: string) => void;
  onSubmit: () => void;
}

const SuspendForm: React.FC<SuspendFormProps> = ({
  user,
  suspendPeriod,
  setSuspendPeriod,
  suspendReason,
  setSuspendReason,
  onSubmit,
}) => {
  return (
    <div className="p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          정지 대상 | {user.baseResponseDto.nickname}
        </label>
        <div className="relative">
          <select
            value={suspendPeriod}
            onChange={(e) => setSuspendPeriod(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 appearance-none cursor-pointer"
          >
            <option value="">정지일 수</option>
            <option value="3일">3일 정지</option>
            <option value="7일">7일 정지</option>
            <option value="30일">30일 정지</option>
            <option value="영구 정지">영구 정지</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          사유
        </label>
        <textarea
          value={suspendReason}
          onChange={(e) => setSuspendReason(e.target.value)}
          placeholder="정지 사유를 간단하게 입력해주세요."
          className="w-full p-3 border border-gray-300 rounded-md resize-none h-32"
        />
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={onSubmit}
          className="w-full py-3 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition-colors"
        >
          정지
        </button>
      </div>
    </div>
  );
};

export default SuspendForm;
