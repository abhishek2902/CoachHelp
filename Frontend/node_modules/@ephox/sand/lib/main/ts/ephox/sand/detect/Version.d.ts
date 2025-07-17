export interface Version {
    readonly major: number;
    readonly minor: number;
}
export declare const Version: {
    nu: (major: number, minor: number) => Version;
    detect: (versionRegexes: RegExp[], agent: any) => Version;
    unknown: () => Version;
};
//# sourceMappingURL=Version.d.ts.map