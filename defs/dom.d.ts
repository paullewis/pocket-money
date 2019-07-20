declare namespace Intl {
  interface RelativeFormatPart {
      type: DateTimeFormatPartTypes;
      value: string;
  }

  interface RelativeTimeFormat {
    formatToParts(date?: Date | number): DateTimeFormatPart[];
    format(value: number, unit: string): string;
  }

  var RelativeTimeFormat: {
      new(locales?: string | string[], options?: DateTimeFormatOptions): RelativeTimeFormat;
      (locales?: string | string[], options?: DateTimeFormatOptions): RelativeTimeFormat;
  };
}
