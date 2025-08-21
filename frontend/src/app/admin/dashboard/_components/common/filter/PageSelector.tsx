interface PageSelectorProps {
    setPage: (page: number) => void;
}

const PageOptions = [
    10,
    20,
    50,
    100
]

export function PageSelector({ setPage } : PageSelectorProps){
    return (
      <div className="mt-2">
          <span>검색 수</span>
          <select
              onChange={e => {
                e.preventDefault();
                setPage(Number(e.target.value));
              }}
              className="ml-2 px-2 h-8 text-sm border border-gray-300 rounded-md bg-white text-gray-900 appearance-none cursor-pointer leading-tight"
          >
              {PageOptions.map((page, index) => (
                  <option
                      key={index}
                      value={page}
                  >
                      {page} 건
                  </option>
              ))}
          </select>
      </div>
    );
}