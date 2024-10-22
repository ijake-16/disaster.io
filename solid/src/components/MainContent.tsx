import { createSignal } from "solid-js";

const [selectedOptions, setSelectedOptions] = createSignal<string[]>([]);
const [data, setData] = createSignal<number[][]>([]);

interface CheckboxGroupProps {
  options: string[];
}


function MainContent() {
  return <div>MainContent</div>;
};

export default MainContent;