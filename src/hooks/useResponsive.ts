import { useState, useEffect } from 'react';

interface ResponsiveConfig {
  mobileBreakpoint: number;
  tabletBreakpoint: number;
  desktopBreakpoint: number;
  largeDesktopBreakpoint: number;
}

interface ResponsiveHook {
  screenWidth: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isSmallScreen: boolean;
  isLargeScreen: boolean;
  getResponsiveValue: <T>(values: { [key: string]: T }) => T;
}

const defaultConfig: ResponsiveConfig = {
  mobileBreakpoint: 480,
  tabletBreakpoint: 768,
  desktopBreakpoint: 1024,
  largeDesktopBreakpoint: 1200
};

export function useResponsive(config: ResponsiveConfig = defaultConfig): ResponsiveHook {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenWidth < config.mobileBreakpoint;
  const isTablet = screenWidth >= config.mobileBreakpoint && screenWidth < config.tabletBreakpoint;
  const isDesktop = screenWidth >= config.tabletBreakpoint && screenWidth < config.largeDesktopBreakpoint;
  const isLargeDesktop = screenWidth >= config.largeDesktopBreakpoint;
  const isSmallScreen = screenWidth < config.tabletBreakpoint;
  const isLargeScreen = screenWidth >= config.desktopBreakpoint;

  const getResponsiveValue = <T>(values: { [key: string]: T }): T => {
    if (isMobile && values.mobile) return values.mobile;
    if (isTablet && values.tablet) return values.tablet;
    if (isDesktop && values.desktop) return values.desktop;
    if (isLargeDesktop && values.largeDesktop) return values.largeDesktop;
    return values.default!;
  };

  return {
    screenWidth,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isSmallScreen,
    isLargeScreen,
    getResponsiveValue
  };
} 