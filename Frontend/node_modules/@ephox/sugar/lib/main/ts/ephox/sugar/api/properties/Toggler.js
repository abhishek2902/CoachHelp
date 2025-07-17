export const Toggler = (turnOff, turnOn, initial) => {
    let active = initial || false;
    const on = () => {
        turnOn();
        active = true;
    };
    const off = () => {
        turnOff();
        active = false;
    };
    const toggle = () => {
        const f = active ? off : on;
        f();
    };
    const isOn = () => active;
    return {
        on,
        off,
        toggle,
        isOn
    };
};
//# sourceMappingURL=Toggler.js.map