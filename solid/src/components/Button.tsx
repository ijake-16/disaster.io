import { createSignal } from 'solid-js';

function Button(props) {
    const [count, setCount] = createSignal(0);

    const handleClick = () => {
        setCount(count() + 1);
    };

    return (
        <button onClick={handleClick}>
            {props.label} ({count()})
        </button>
    );
}

export default Button;