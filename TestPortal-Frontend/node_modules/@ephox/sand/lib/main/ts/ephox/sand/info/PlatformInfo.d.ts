export interface PlatformInfo {
    readonly name: string;
    readonly versionRegexes: RegExp[];
    readonly search: (uastring: string) => boolean;
    readonly brand?: string;
}
export declare const PlatformInfo: {
    browsers: () => PlatformInfo[];
    oses: () => PlatformInfo[];
};
//# sourceMappingURL=PlatformInfo.d.ts.map