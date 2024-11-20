export interface AppPlatform {
  id: string;
  name: string;
  packageName: string;
  urlScheme?: string;
  downloadUrl?: string;
}

export const platforms: Record<string, AppPlatform> = {
  // 移动应用商店
  appStore: {
    id: 'appStore',
    name: 'App Store',
    packageName: 'com.yourdomain.loancalculator',
    urlScheme: 'loancalculator://'
  },
  googlePlay: {
    id: 'googlePlay',
    name: 'Google Play',
    packageName: 'com.yourdomain.loancalculator'
  },
  // 国内应用商店
  huawei: {
    id: 'huawei',
    name: '华为应用市场',
    packageName: 'com.yourdomain.loancalculator',
    downloadUrl: 'https://appgallery.huawei.com/'
  },
  xiaomi: {
    id: 'xiaomi',
    name: '小米应用商店',
    packageName: 'com.yourdomain.loancalculator',
    downloadUrl: 'https://app.mi.com/'
  },
  oppo: {
    id: 'oppo',
    name: 'OPPO软件商店',
    packageName: 'com.yourdomain.loancalculator',
    downloadUrl: 'https://store.oppo.com/'
  },
  vivo: {
    id: 'vivo',
    name: 'vivo应用商店',
    packageName: 'com.yourdomain.loancalculator',
    downloadUrl: 'https://developer.vivo.com.cn/'
  },
  // 应用分发平台
  coolapk: {
    id: 'coolapk',
    name: '酷安',
    packageName: 'com.yourdomain.loancalculator',
    downloadUrl: 'https://www.coolapk.com/'
  },
  // Windows平台
  microsoftStore: {
    id: 'microsoftStore',
    name: 'Microsoft Store',
    packageName: 'LoanCalculator',
    downloadUrl: 'https://www.microsoft.com/store/apps'
  }
}; 