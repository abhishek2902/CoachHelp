import { Browser as BrowserCore } from '../core/Browser';
import { OperatingSystem as OperatingSystemCore } from '../core/OperatingSystem';
import { PlatformDetection } from '../core/PlatformDetection';
import { DeviceType as DeviceTypeCore } from '../detect/DeviceType';
export type Browser = BrowserCore;
export type OperatingSystem = OperatingSystemCore;
export type DeviceType = DeviceTypeCore;
export declare const detect: () => PlatformDetection;
export declare const override: (overrides: Partial<PlatformDetection>) => void;
//# sourceMappingURL=PlatformDetection.d.ts.map