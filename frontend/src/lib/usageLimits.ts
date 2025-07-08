export interface UsageLimits {
  maxClipsPerMonth: number;
  maxQuality: '720p' | '1080p' | '4K';
  canUseAdvancedFeatures: boolean;
  canUseBulkProcessing: boolean;
  canUseAPI: boolean;
}

export const getUsageLimits = (planType: string): UsageLimits => {
  switch (planType) {
    case 'creator':
      return {
        maxClipsPerMonth: -1, // Unlimited
        maxQuality: '4K',
        canUseAdvancedFeatures: true,
        canUseBulkProcessing: true,
        canUseAPI: true
      };
    case 'pro':
      return {
        maxClipsPerMonth: 50,
        maxQuality: '1080p',
        canUseAdvancedFeatures: true,
        canUseBulkProcessing: true,
        canUseAPI: false
      };
    case 'free':
    default:
      return {
        maxClipsPerMonth: 5,
        maxQuality: '720p',
        canUseAdvancedFeatures: false,
        canUseBulkProcessing: false,
        canUseAPI: false
      };
  }
};

export const checkCanCreateClip = async (userId: string, currentUsage: number, planType: string): Promise<{ canCreate: boolean; reason?: string }> => {
  const limits = getUsageLimits(planType);
  
  if (limits.maxClipsPerMonth !== -1 && currentUsage >= limits.maxClipsPerMonth) {
    return {
      canCreate: false,
      reason: `You've reached your monthly limit of ${limits.maxClipsPerMonth} clips. Upgrade your plan to create more clips.`
    };
  }
  
  return { canCreate: true };
};

export const getUpgradeMessage = (currentPlan: string): string => {
  switch (currentPlan) {
    case 'free':
      return 'Upgrade to Pro for 50 clips/month and 1080p quality!';
    case 'pro':
      return 'Upgrade to Creator for unlimited clips and 4K quality!';
    default:
      return '';
  }
}; 