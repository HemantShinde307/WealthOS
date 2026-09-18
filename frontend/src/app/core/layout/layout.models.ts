export interface NavItem {
  label: string;
  icon: string;
  route: string;
  filled?: boolean;
}

export interface ShellConfig {
  brand: string;
  portalLabel: string;
  navItems: NavItem[];
  ctaLabel?: string;
  ctaRoute?: string;
  theme?: 'light' | 'dark';
  /** Optional "exit this module" link shown above the nav items, e.g. for a console entered from another portal.
   *  The destination is always the current user's own role home route (see DesktopShellComponent.backRoute) since
   *  a shell like Back Office can be reached by more than one role. */
  backLabel?: string;
}

export interface FlowShellConfig {
  title: string;
  subtitle?: string;
  backRoute?: string;
  steps?: string[];
  currentStep?: number;
  bare?: boolean;
}
