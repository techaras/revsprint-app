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

  // Save OAuth tokens
  static async saveTokens(accessToken: string, refreshToken: string) {
    // Define the base config values that should always exist
    const configData = [
      { configKey: 'api_key', configValue: '' },
      { configKey: 'app_id', configValue: '' },
      { configKey: 'client_id', configValue: process.env.HUBSPOT_CLIENT_ID || '' },
      { configKey: 'client_secret', configValue: process.env.HUBSPOT_CLIENT_SECRET || '' },
      { configKey: 'install_url', configValue: '' },
      { configKey: 'redirect_url', configValue: process.env.HUBSPOT_REDIRECT_URL || 'http://localhost:3000/api/hubspot/install' }
    ];
    
    // Create operations for the seed config values (don't update if they exist)
    const seedOperations = configData.map(config => 
      prisma.config.upsert({
        where: { configKey: config.configKey },
        update: {}, // Don't update existing values
        create: {
          configKey: config.configKey,
          configValue: config.configValue
        }
      })
    );
    
    // Add the token operations
    const tokenOperations = [
      prisma.config.upsert({
        where: { configKey: 'access_token' },
        update: { configValue: accessToken },
        create: {
          configKey: 'access_token',
          configValue: accessToken
        }
      }),
      prisma.config.upsert({
        where: { configKey: 'refresh_token' },
        update: { configValue: refreshToken },
        create: {
          configKey: 'refresh_token',
          configValue: refreshToken
        }
      })
    ];
    
    // Execute all operations in a transaction
    const allOperations = [...seedOperations, ...tokenOperations];
    await prisma.$transaction(allOperations);
    
    console.log('Tokens saved and config initialized');
    return true;
  }
}

export class LoginService {
  // Record a login attempt
  static async recordLoginAttempt(contactId: number, ip: string, success: boolean) {
    await prisma.loginHistory.create({
      data: {
        contactId,
        ip,
        success
      }
    });
  }

  // Get login history for a contact
  static async getLoginHistory(contactId: number) {
    return prisma.loginHistory.findMany({
      where: { contactId },
      orderBy: { insertDate: 'desc' }
    });
  }

  // Get login statistics for a contact
  static async getLoginStats(contactId: number) {
    const loginHistory = await prisma.loginHistory.findMany({
      where: { contactId }
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

  // Verify login credentials
  static async verifyCredentials(email: string, password: string) {
    const credentials = await prisma.loginCredential.findFirst({
      where: {
        email,
        password
      }
    });

    return credentials !== null;
  }
}