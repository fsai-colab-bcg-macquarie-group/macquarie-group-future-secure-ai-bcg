import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ---- Cores Primárias ---- */
        white: "var(--white)",
        black: "var(--black)",

        /* ---- Escala de Tons Claros ---- */
        light100: "var(--light-100)",
        light200: "var(--light-200)",
        light300: "var(--light-300)",
        light400: "var(--light-400)",
        light500: "var(--light-500)",
        light600: "var(--light-600)",
        light700: "var(--light-700)",
        light800: "var(--light-800)",

        /* ---- Escala de Cinza ---- */
        gray000: "var(--gray-000)",
        gray100: "var(--gray-100)",
        gray200: "var(--gray-200)",
        gray300: "var(--gray-300)",
        gray400: "var(--gray-400)",
        gray500: "var(--gray-500)",
        gray600: "var(--gray-600)",
        gray700: "var(--gray-700)",
        gray800: "var(--gray-800)",
        gray900: "var(--gray-900)",
        gray1000: "var(--gray-1000)",
        gray1100: "var(--gray-1100)",
        gray1200: "var(--gray-1200)",
        gray1300: "var(--gray-1300)",
        gray1400: "var(--gray-1400)",
        gray1500: "var(--gray-1500)",

        /* ---- Escala de Tons Escuros ---- */
        dark100: "var(--dark-100)",
        dark200: "var(--dark-200)",
        dark300: "var(--dark-300)",
        dark400: "var(--dark-400)",
        dark500: "var(--dark-500)",
        dark600: "var(--dark-600)",
        dark700: "var(--dark-700)",
        dark800: "var(--dark-800)",

        /* ---- Cores Semânticas ---- */
        error: "var(--error)",
        error_Text: "var(--error_text)",
        warning: "var(--warning)",
        info: "var(--info)",

        /* Buttons active/disabled */
        btn_Active: "var( --btn-active)",
        btn_Disabled: "var(--btn-disable)",
        btn_Active_Hover: "var(--btn-active-hover)",
        /*-------------------------////////////////---------------------------------------*/

        /*---- Colors ----*/
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        wall: 'var(--wall)',
        wallMiddle: 'var(--wall-middle)',
        wallMiddleHover: 'var(--wall-middle-hover)',

        /*---- Skeleton ----*/
        skeleton: 'var(--skeleton)',
        scrollbar: 'var(--scrollbar)',
        scrollbarHover: 'var(--scrollbar-hover)',

        /*---- Texts ----*/
        background_Middle: "var(--background-middle)",
        text_Less_Soft: "var(--text-less-soft)",
        text_Soft: "var(--text-soft)",
        text_Middle: "var(--text-middle)",
        text_Normal: "var(--text-normal)",
        text_Strong: "var(--text-strong)",


        /*---- Lines ----*/
        lines: 'var(--lines)',
        lines_Middle: 'var(--lines-middle)',

        /*---- UI ----*/
        ui_Bg_Selected: 'var(--ui-bg-selected)',
        ui_Fg_Selected: 'var(--ui-fg-selected)',

        /*---- FSai ---- */
        fsai_Foreground: "var(--fsai-foreground)",
        fsai_Foreground_Default: "var(--fsai-foreground-default)",
        fsai_Foreground_Middle: "var(--fsai-foreground-middle)",
        fsai_Foreground_Selected: "var(--fsai-foreground-selected)",
      },
      spacing: {
        spacing_01: 'var(--spacing-01)',
        spacing_02: 'var(--spacing-02)',
        spacing_03: 'var(--spacing-03)',
        spacing_04: 'var(--spacing-04)',
        spacing_05: 'var(--spacing-05)',
        spacing_06: 'var(--spacing-06)',
        spacing_07: 'var(--spacing-07)',
        spacing_08: 'var(--spacing-08)',
        spacing_09: 'var(--spacing-09)',
        spacing_10: 'var(--spacing-10)',
        spacing_11: 'var(--spacing-11)',
      },
      // fontFamily: {
      //   montserrat: ["var(--font-montserrat)", montserrat.variable],
      // },
      fontWeight: {
        bold: 'var(--font-weight-bold)',
        semibold: 'var(--font-weight-semibold)',
        medium: 'var(--font-weight-medium)',
        normal: 'var(--font-weight-normal)',
      },
      boxShadow: {
        default: 'var(--default-shadow)',
      },
    },
  },
  plugins: [],
}
export default config
