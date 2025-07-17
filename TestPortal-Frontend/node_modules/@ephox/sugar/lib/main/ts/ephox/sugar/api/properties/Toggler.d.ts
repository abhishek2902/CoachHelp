export interface Toggler {
    readonly on: () => void;
    readonly off: () => void;
    readonly toggle: () => void;
    readonly isOn: () => boolean;
}
export declare const Toggler: (turnOff: () => void, turnOn: () => void, initial: boolean) => Toggler;
//# sourceMappingURL=Toggler.d.ts.map