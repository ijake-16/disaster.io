import { Component } from "solid-js";
import { createSignal } from "solid-js";

interface SidebarProps {}

const Sidebar: Component<SidebarProps> = () => {
  const [searchQuery, setSearchQuery] = createSignal("");

  const handleSearchChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    setSearchQuery(target.value);
  };
  return (
    <aside class="sidebar w-64 h-screen bg-gray-200 border-r border-gray-300 p-4">
    <div class="mb-4">
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery()}
        onInput={handleSearchChange}
        class="ml-2 w-full p-2 border border-gray-300 rounded"
      />
    </div>
    <div class="flex flex-col w-80 bg-stone-400">
    </div>
    </aside>
  );
};

export default Sidebar;