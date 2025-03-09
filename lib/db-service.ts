import prisma from '@/lib/db';

export class ConfigService {
  // Get all config values
  static async getAllConfig() {
    const config = await prisma.config.findMany();
    
    // Convert to object format
    const configObj: Record<string, string> = {};
    config.forEach(item => {
      configObj[item.configKey] = item.configValue;
    });
    
    return configObj;
  }

  // Get a specific config value
  static async getConfig(key: string) {
    const config = await prisma.config.findUnique({
      where: { configKey: key }
    });
    
    return config?.configValue || '';
  }

  // Update a config value
  static async updateConfig(key: string, value: string) {
    await prisma.config.upsert({
      where: { configKey: key },
      update: { configValue: value },
      create: {
        configKey: key,
        configValue: value
      }
    });
  }

  // Save global application config
  static async initializeAppConfig() {
    const configData = [
      { configKey: 'api_key', configValue: '' },
      { configKey: 'app_id', configValue: '' },
      { configKey: 'client_id', configValue: process.env.HUBSPOT_CLIENT_ID || '' },
      { configKey: 'client_secret', configValue: process.env.HUBSPOT_CLIENT_SECRET || '' },
      { configKey: 'install_url', configValue: '' },
      { configKey: 'redirect_url', configValue: process.env.HUBSPOT_REDIRECT_URL || 'http://localhost:3000/api/hubspot/install' }
    ];
    
    const operations = configData.map(config => 
      prisma.config.upsert({
        where: { configKey: config.configKey },
        update: {}, // Don't update existing values
        create: {
          configKey: config.configKey,
          configValue: config.configValue
        }
      })
    );
    
    await prisma.$transaction(operations);
    return true;
  }
}

export class HubSpotAccountService {
  // Save or update a HubSpot account with tokens
  static async saveAccount(portalId: string, name: string | null, accessToken: string, refreshToken: string, expiresIn: number = 86400) {
    // Calculate expiration date (default to 24 hours if not provided)
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    
    // Initialize global config if needed
    await ConfigService.initializeAppConfig();
    
    return prisma.hubSpotAccount.upsert({
      where: { hubspotId: portalId },
      update: {
        name: name || undefined,
        accessToken,
        refreshToken,
        expiresAt,
        updatedAt: new Date()
      },
      create: {
        hubspotId: portalId,
        name: name || "HubSpot Account",
        accessToken,
        refreshToken,
        expiresAt
      }
    });
  }
  
  // Get account by HubSpot portal ID
  static async getAccountByPortalId(portalId: string) {
    return prisma.hubSpotAccount.findUnique({
      where: { hubspotId: portalId }
    });
  }
  
  // Get account by ID
  static async getAccountById(id: number) {
    return prisma.hubSpotAccount.findUnique({
      where: { id }
    });
  }
  
  // Get all active accounts
  static async getAllAccounts() {
    return prisma.hubSpotAccount.findMany({
      orderBy: { updatedAt: 'desc' }
    });
  }
  
  // Update account tokens
  static async updateAccountTokens(id: number, accessToken: string, refreshToken: string, expiresIn: number = 86400) {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    
    return prisma.hubSpotAccount.update({
      where: { id },
      data: {
        accessToken,
        refreshToken,
        expiresAt,
        updatedAt: new Date()
      }
    });
  }
}

export class LoginService {
  // Record a login attempt with account context
  static async recordLoginAttempt(
    contactId: number, 
    ip: string, 
    success: boolean, 
    hubspotAccountId?: number
  ) {
    return prisma.loginHistory.create({
      data: {
        contactId,
        ip,
        success,
        hubspotAccountId: hubspotAccountId || undefined
      }
    });
  }

  // Get login history for a contact (optionally filtered by account)
  static async getLoginHistory(contactId: number, hubspotAccountId?: number) {
    return prisma.loginHistory.findMany({
      where: { 
        contactId,
        ...(hubspotAccountId ? { hubspotAccountId } : {})
      },
      orderBy: { insertDate: 'desc' }
    });
  }

  // Get login statistics for a contact (optionally filtered by account)
  static async getLoginStats(contactId: number, hubspotAccountId?: number) {
    const loginHistory = await prisma.loginHistory.findMany({
      where: { 
        contactId,
        ...(hubspotAccountId ? { hubspotAccountId } : {})
      }
    });

    const totalLogins = loginHistory.length;
    const successfulLogins = loginHistory.filter(login => login.success).length;
    const successPercentage = totalLogins > 0 ? (successfulLogins / totalLogins) * 100 : 0;
    
    // Count distinct IPs
    const uniqueIps = new Set(loginHistory.map(login => login.ip));
    const totalIps = uniqueIps.size;

    return {
      totalLogins,
      successPercentage,
      totalIps
    };
  }

  // Verify login credentials (optionally for a specific account)
  static async verifyCredentials(email: string, password: string, hubspotAccountId?: number) {
    const credentials = await prisma.loginCredential.findFirst({
      where: {
        email,
        password,
        ...(hubspotAccountId ? { hubspotAccountId } : {})
      }
    });

    return credentials !== null;
  }
  
  // Create or update login credentials for a contact in a specific HubSpot account
  static async createOrUpdateCredentials(
    contactId: number, 
    email: string, 
    password: string, 
    hubspotAccountId?: number
  ) {
    return prisma.loginCredential.upsert({
      where: { contactId },
      update: {
        email,
        password,
        hubspotAccountId: hubspotAccountId || undefined
      },
      create: {
        contactId,
        email,
        password,
        hubspotAccountId: hubspotAccountId || undefined
      }
    });
  }
}