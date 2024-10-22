import { ParentProps } from "solid-js";

function HeaderButton(props: ParentProps) {
  return (
    <button class="px-2">{props.children}</button>
  );
}

function Header() {
  return (
    <header class="header">
      <nav>
        <div class="flex flex-row gap-12 p-4 bg-stone-300">
          <HeaderButton>Home</HeaderButton>
          <HeaderButton>About</HeaderButton>
          <HeaderButton>Contact</HeaderButton>
        </div>
      </nav>
    </header>
  );
};

export default Header;