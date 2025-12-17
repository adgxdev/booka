import { ImSearch } from "react-icons/im";

export default function SearchComponent() {
  return (
    <div className="w-full md:w-6/12 bg-dblue rounded-lg flex items-center gap-1 px-1.5 py-1">
      <input type="text" placeholder="Find books by course or title" className="placeholder-gray-500 ps-2 w-full md:w-10/12 border-none outline-none py-1.5 rounded-lg bg-white" name="q" />
      <button className="w-1/6 md:w-2/12 flex items-center justify-center gap-2 px-1">
        <ImSearch className="h-5 w-5" /><span className="hidden md:block font-medium">Search</span>
      </button>
    </div>
  );
}