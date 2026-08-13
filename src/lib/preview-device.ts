export type PreviewDevice = "desktop" | "tablet" | "mobile";

const previewDeviceWidths: Record<PreviewDevice, string> = {
  desktop: "max-w-5xl",
  tablet: "max-w-[48rem]",
  mobile: "max-w-[22rem]",
};

export function previewDeviceWidthClass(device: PreviewDevice): string {
  return previewDeviceWidths[device];
}
